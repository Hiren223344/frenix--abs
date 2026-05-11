import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { TokenService } from "@/services/token";
import { logRequest, validateApiKey, getUserCredits, deductCredits } from "@/services/tracking-server";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

// AI Provider Configuration (Mistral)
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "G9EMyZMT6nDIYNiZKUudQQL7pvVLCBgq";
const MISTRAL_BASE_URL = process.env.MISTRAL_BASE_URL || "https://api.mistral.ai/v1";
const PUBLIC_MODEL_ID = "uttam-vara"; // The only allowed model ID externally
const INTERNAL_MODEL_ID = "mistral-large-latest"; // Mistral model

const client = new OpenAI({
  apiKey: MISTRAL_API_KEY,
  baseURL: MISTRAL_BASE_URL,
});

// Load System Prompt
const SYSTEM_PROMPT_PATH = path.join(process.cwd(), "src/app/v1/chat/completions/system_prompt.md");
const SYSTEM_PROMPT = fs.existsSync(SYSTEM_PROMPT_PATH) 
  ? fs.readFileSync(SYSTEM_PROMPT_PATH, "utf8")
  : "You are Uttam Vara, built by Frenix Labs. Be direct and technical.";

export async function POST(req: Request) {
  try {
    let userId: string | null = null;

    // 1. Check for API Key in Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKey = authHeader.split(" ")[1];
      userId = await validateApiKey(apiKey);
    }

    // 2. Fallback to Clerk Session (for Web UI)
    if (!userId) {
      const clerkAuth = await auth();
      userId = clerkAuth.userId;
    }

    if (!userId) {
      return NextResponse.json({ 
        error: {
          message: "Unauthorized. Please provide a valid Bearer API Key or Clerk session.",
          type: "auth_error",
          code: 401
        }
      }, { status: 401 });
    }

    console.log(`[API] Authenticated User ID: ${userId}`);

    // 3. Check Credits
    const currentCredits = await getUserCredits(userId);
    console.log(`[API] Current Credits for ${userId}: $${currentCredits}`);

    if (currentCredits <= 0) {
      return NextResponse.json({ 
        error: {
          message: "Payment Required. Your credit balance is $0.00. Please top up in the Uttam Vara dashboard.",
          type: "insufficient_credits",
          code: 402
        }
      }, { status: 402 });
    }

    const body = await req.json();
    const { messages, model, stream = false, temperature = 0.7 } = body;

    // Strict model validation
    if (model !== PUBLIC_MODEL_ID) {
      return NextResponse.json({ 
        error: {
          message: `Model '${model}' not found. Currently, only '${PUBLIC_MODEL_ID}' is available.`,
          type: "invalid_request_error",
          code: "model_not_found"
        }
      }, { status: 404 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ 
        error: {
          message: "Invalid messages format. Expected an array.",
          type: "invalid_request_error",
          code: 400
        }
      }, { status: 400 });
    }

    // Prepend System Prompt and filter out any existing system messages from the user to avoid 400 errors
    const finalMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.filter((m: any) => m.role !== "system")
    ];

    const promptTokens = TokenService.countMessagesTokens(finalMessages);

    if (stream) {
      const response = await client.chat.completions.create({
        model: INTERNAL_MODEL_ID, // Route to the actual model backend
        messages: finalMessages as any,
        stream: true,
        temperature,
      });

      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          let fullContent = "";
          for await (const chunk of response) {
            // Overwrite model ID in chunk to match the public identity
            if (chunk.model) chunk.model = PUBLIC_MODEL_ID;
            
            const content = chunk.choices[0]?.delta?.content || "";
            fullContent += content;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
          
          // Log tokens after stream ends
          const completionTokens = TokenService.countTokens(fullContent);
          const cost = (promptTokens / 1000000) * 2.5 + (completionTokens / 1000000) * 17.5;
          
          await Promise.all([
            logRequest({
              userId,
              model: PUBLIC_MODEL_ID,
              promptTokens,
              completionTokens,
              status: 'success',
            }),
            deductCredits(userId, cost)
          ]);
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(customStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Non-streaming
      const completion = await client.chat.completions.create({
        model: INTERNAL_MODEL_ID,
        messages: finalMessages as any,
        temperature,
      });

      // Overwrite internal model ID with public identity
      const responseJson = completion as any;
      responseJson.model = PUBLIC_MODEL_ID;

      const responseText = completion.choices[0]?.message?.content || "";
      const completionTokens = TokenService.countTokens(responseText);

      // Log stats and deduct credits
      const cost = (promptTokens / 1000000) * 2.5 + (completionTokens / 1000000) * 17.5;
      
      await Promise.all([
        logRequest({
          userId,
          model: PUBLIC_MODEL_ID,
          promptTokens,
          completionTokens,
          status: 'success',
        }),
        deductCredits(userId, cost)
      ]);

      // Ensure usage stats are present and accurate
      if (!responseJson.usage) {
        responseJson.usage = {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        };
      }

      return NextResponse.json(responseJson);
    }
  } catch (error: any) {
    console.error("Uttam Vara Gateway Error:", error);
    return NextResponse.json({ 
      error: {
        message: error.message || "An error occurred during chat completion via Uttam Vara Gateway",
        type: "api_error",
        code: error.code || 500
      }
    }, { status: error.status || 500 });
  }
}
