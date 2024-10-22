// app/api/images/route.js
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(req) {
  const imagesDirectory = "public/screenshots"; // Adjust to your screenshots directory

  try {
    // Read all files from the directory
    const files = fs.readdirSync(imagesDirectory);

    // Filter for image files (you can adjust extensions as needed)
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => `screenshots/${file}`); // Create relative paths

    // Send back the array of image paths
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error("Error reading images directory:", error);
    return NextResponse.json(
      { message: "Error reading images directory" },
      { status: 500 }
    );
  }
}
