import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    object: "list",
    data: [
      {
        id: "uttam-vara",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "frenix-labs",
        permission: [],
        root: "uttam-vara",
        parent: null,
      }
    ]
  });
}
