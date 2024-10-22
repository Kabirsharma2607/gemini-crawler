import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import { name, crawler } from "../crawler.js";
//import { crawler } from "@/app/utils/crawler";

export async function GET(req) {
  try {
    // Get query parameters from the URL
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const password = searchParams.get("password");
    const website = searchParams.get("website");

    // Validate input
    if (!email || !password || !website) {
      return NextResponse.json(
        { message: "Missing parameters" },
        { status: 400 }
      );
    }
    console.log(name);

    const startCrawl = async (website, email, password) => {
      // Store user data in a temporary object
      const userData = { email, password };

      await crawler.run({
        startUrls: [website],
        userData, // Pass userData to the crawler
      });
    };

    await startCrawl(email, password, website);

    return NextResponse.json({ status: 200 }, { message: "pass" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
