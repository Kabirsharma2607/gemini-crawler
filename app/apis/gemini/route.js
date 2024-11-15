import axios from "axios";
import { NextResponse } from "next/server";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import * as fs from "fs";

import { PROMPT } from "./prompt";

function splitJsonFile(filePath, chunkSize = 1024 * 1024) {
  // Chunk size is 1MB by default
  const data = fs.readFileSync(filePath, "utf8");
  const jsonObject = JSON.parse(data);
  const jsonString = JSON.stringify(jsonObject);

  // Split the JSON string into smaller parts
  const parts = [];
  for (let i = 0; i < jsonString.length; i += chunkSize) {
    parts.push(jsonString.substring(i, i + chunkSize));
  }

  return parts;
}

export async function GET(req, res, next) {
  try {
    // Get query parameters from the URL
    const { searchParams } = new URL(req.url);
    const index = searchParams.get("index");
    console.log(index);

    const API_KEY = process.env.GEMINI_API;
    console.log(API_KEY);

    const fileManager = new GoogleAIFileManager(API_KEY);

    const dataFile = index.replace(/\.png$/, "_elements.json");

    console.log(`./public/${dataFile}`);

    // Upload the image file to Cloudinary
    const imageUrl = `./public/${index}`;

    const uploadImageResult = await fileManager.uploadFile(imageUrl, {
      mimeType: "image/jpeg",
      displayName: "Jetpack drawing",
    });

    // Split the JSON file into parts
    const jsonParts = splitJsonFile(`./public/${dataFile}`);

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      `You are a product tester tasked with writing 10 unique and comprehensive test cases for a new feature were building. Your test cases should follow the provided image and JSON files. Please focus on capturing various aspects of the functionality, ensuring every test case is unique. Your automation code should be in Java 18 using Selenium 4.25.0 and TestNG, with the JSON file as a reference to locate elements. Use specific locators like //tag[contains(text(), 'text')] do not use xpath at all to find elements always use wait before the element is loaded use the new WebDriverWait Syntax. Write each test case in this exact JSON format (no additional details or variations):
    {
  { "id": "id", "testCase": "test case description", "selected": false, "code": "code for automation in java with selenium and testng" }, 
  { "id": "id", "testCase": "test case description", "selected": false, "code": "code for automation in java with selenium and testng" } 
    }
Ensure each test case has a distinct starting verb to avoid redundancy.`,
      imageUrl,
      ...jsonParts,
    ]);

    console.log(result.response.text());
    return NextResponse.json({
      message: result.response.text(),
    });
  } catch (e) {
    return NextResponse.json({
      message: e.message,
    });
  }
}
