import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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

    // Define the command to run the crawler
    const command = `node app/apis/crawler.cjs`;

    // Run the crawler script using the promisified exec function
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return NextResponse.json(
        { message: "An error occurred during the crawler execution." },
        { status: 500 }
      );
    }

    console.log(`stdout: ${stdout}`);
    return NextResponse.json(
      { message: "Crawler executed successfully", output: stdout },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
