import { NextResponse } from "next/server";
import { GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";

export async function GET(req: Request) {
  // Read request headers so Next.js evaluates GEMINI_API_KEY at request time under cacheComponents
  void req.headers.get("host");
  return NextResponse.json({
    geminiConfigured: isGeminiConfigured(),
    model: GEMINI_MODEL,
  });
}
