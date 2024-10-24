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
      `You are a product tester who will write test cases for the following project. For this product we are building a new feature. Keep the following image in mind, along with all the JSON files that I will send. Generate about 30 geniune test cases which dictate the functionality of usecase and every testcase should be uniquely written for all the feature in the json format { {id: "id", testCase: "testcase"}, {id: "testcase", testCase: "testcase"}} Should be framed uniquely with different starting verb or better vocabulary, Instead of starting every description with (verify that..., or enter or some similar wording), so use different sentence starting verb`,
      imageUrl,
      ...jsonParts,
    ]);

    //console.log(result.response.text());
    return NextResponse.json({
      message: result.response.text(),
    });
  } catch (e) {
    return NextResponse.json({
      message: e.message,
    });
  }
}
