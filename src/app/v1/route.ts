import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "Uttam AI API Gateway v1 is operational.",
    documentation: "https://docs.uttam.ai",
    endpoints: [
      "/v1/models",
      "/v1/chat/completions"
    ]
  });
}
