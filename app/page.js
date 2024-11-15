"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const parseTestCases = (jsonString) => {
  // Remove initial backticks, json tag, newline characters, and extra braces
  let cleanedString = jsonString
    .replace(/```json/g, "") // Remove ```json at the start
    .replace(/```/g, "") // Remove trailing backticks
    .replace(/\n/g, "") // Remove all newline characters
    .replace(/\{ *\{/g, "{") // Replace `{ {` with `{`
    .replace(/\}, *\{/g, "},{") // Replace `}, {` with `},{`
    .replace(/\}\}$/g, "}"); // Remove the final extra `}`

  //cleanedString = JSON.stringify(cleanedString);
  //console.log("cleanedString" + cleanedString);
  // Parse the cleaned string as an array
  try {
    return JSON.parse(`${cleanedString}`); // Wrap in array brackets for valid JSON format
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return [];
  }
};

export default function Home() {
  const [email, setEmail] = useState("kabiragnihotri@gmail.com");
  const [password, setPassword] = useState("Admin@12345");
  const [website, setWebsite] = useState("https://sanskruty.com");
  const [loading, setLoading] = useState(false);
  const [findImages, setFindImages] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [testCases, setTestCases] = useState();
  const [customTestCase, setCustomTestCase] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loginUrl, setLoginUrl] = useState("");
  const [keyword, setKeyword] = useState("");

  let boolean = true;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/apis/images");
        const data = await response.json();
        console.log(data);
        setImages(data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  const genTestCases = async ({ index }) => {
    try {
      const response = await axios.get("/apis/gemini", {
        params: {
          index: images[index - 1],
        },
      });
      const rawTestCases = response.data.message; // raw string format
      const parsedTestCases = parseTestCases(rawTestCases); // Parse it
      console.log(parsedTestCases);
      setTestCases(parsedTestCases); // Set parsed data to state
      setSelectedImage(index - 1);
    } catch (error) {
      console.error("Error generating test cases:", error);
    }
  };

  const onClick = async () => {
    setLoading(true);

    try {
      const response = await axios.get("/apis/getall", {
        params: {
          email,
          password,
          website,
          loginUrl,
          keyword,
        },
      });
      setFindImages(true);
      boolean = !boolean;
      console.log(response);
    } catch (error) {
      console.error("Error occurred during the request", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCaseToggle = (id) => {
    setTestCases(
      testCases.map((tc) =>
        tc.id === id ? { ...tc, selected: !tc.selected } : tc
      )
    );
  };

  const handleCustomTestCaseChange = (e) => {
    setCustomTestCase(e.target.value);
  };

  const generateCode = async () => {
    // Filter the test cases where selected is true and get the 'text' field
    const selectedTestCasesText = testCases
      .filter((testCase) => testCase.selected)
      .map((testCase) => testCase.text); // Extract the 'text' of selected test cases

    // Combine the selected test case texts and the customTestCase into a single string
    const testCaseString = [...selectedTestCasesText, customTestCase].join(
      ": "
    ); // Join by commas

    console.log(testCaseString); // Log the final string

    try {
      const response = await axios.get("/apis/gentestcases", {
        params: {
          testCases: testCaseString, // Send the combined string as testCases
        },
      });

      // Handle the response as needed
      //console.log(response.data.message);
      const code = response.data.message; // Extract the generated code from the response

      const cleanJsonString = code.replace(/```java|```/g, "");
      console.log(cleanJsonString);
      setGeneratedCode(cleanJsonString);
    } catch (error) {
      console.error("Error generating test cases:", error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Website Scraper</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="block mb-1">
              Enter your email:
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="password" className="block mb-1">
              Enter your password:
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="website" className="block mb-1">
              Enter the website:
            </Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="loginUrl" className="block mb-1">
              Enter the Login URL:
            </Label>
            <Input
              id="loginUrl"
              type="url"
              value={loginUrl}
              onChange={(e) => setLoginUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="keyword" className="block mb-1">
              Enter the Keyword:
            </Label>
            <Input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={onClick} disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </Button>
        </div>
      </div>

      {findImages && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Screenshots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.length > 0 ? (
              images.map((image, index) => (
                <div key={index} className="text-center">
                  <img
                    src={image}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-auto rounded shadow-lg cursor-pointer"
                    onClick={() => genTestCases({ index: index + 1 })}
                  />
                  <p className="mt-2">Screenshot {index + 1}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center">
                <p>No screenshots available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedImage !== null && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Test Case Selector</h2>
          <div className="space-y-4">
            {testCases.map((tc, ind) => (
              <div key={tc.id} className="flex items-center space-x-2">
                <div className="flex">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      id={tc.id}
                      checked={tc.selected}
                      onCheckedChange={() => handleTestCaseToggle(tc.id)}
                    />
                    <Label htmlFor={tc.id}>{tc.testCase}</Label>
                  </div>
                  <div>
                    {tc.selected && (
                      <div className="mt-2 w-[45vw]">
                        <h3 className="text-lg font-semibold mb-2">
                          Generated Java Code:
                        </h3>
                        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                          <code>{tc.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="custom-test-case">Custom Test Case:</Label>
            <Input
              id="custom-test-case"
              value={customTestCase}
              onChange={handleCustomTestCaseChange}
              placeholder="Enter custom test case description"
              className="mt-1"
            />
          </div>
          <Button onClick={generateCode} className="mt-4">
            Generate Test Cases
          </Button>
        </div>
      )}

      {generatedCode && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Java Code:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
