import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
export async function GET(req, res, next) {
  try {
    const { searchParams } = new URL(req.url);
    const testCases = searchParams.get("testCases");

    const API_KEY = process.env.GEMINI_API;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Generate test cases for all of them in python selenium , each test case is seperated by a :. Follow good coding practices add assertions put in try catch block. Do not include explanatory or introductory text. The output must be all java code Format the code in a plain text format without using triple backticks",
      testCases,
    ]);

    console.log(result.response.text());
    return NextResponse.json({ message: result.response.text() });
  } catch (err) {}
}
