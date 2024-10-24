"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

      // Ensure response.data is valid JSON
      const jsonString = response.data.message;

      // Check and remove any unwanted characters like backticks
      const cleanJsonString = jsonString.replace(/```json|```/g, "");

      // Parse the clean JSON string
      const parsedTestCases = JSON.parse(cleanJsonString);

      // Map the parsed test cases into the desired format
      const formattedTestCases = parsedTestCases.map((testCase, idx) => ({
        id: `TC${idx + 1}`, // Format the id as TC1, TC2, etc.
        text: testCase.testCase, // Use testCase field as text
        selected: false, // Default value for selected field
      }));

      // Set the formatted test cases in state
      setTestCases(formattedTestCases);
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
        },
      });
      setFindImages(true);
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

    // let code = "import org.junit.Test;\n";
    // code += "import static org.junit.Assert.*;\n\n";
    // code += "public class ColorFilterTest {\n\n";

    // testCases
    //   .filter((tc) => tc.selected)
    //   .forEach((tc) => {
    //     code += `    @Test\n    public void ${tc.id.toLowerCase()}() {\n        // TODO: Implement test for: ${
    //       tc.text
    //     }\n        fail("Test not implemented");\n    }\n\n`;
    //   });

    // if (customTestCase) {
    //   code += `    @Test\n    public void customTestCase() {\n        // TODO: Implement test for: ${customTestCase}\n        fail("Test not implemented");\n    }\n\n`;
    // }

    // code += "}";
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
            {testCases.map((tc) => (
              <div key={tc.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tc.id}
                  checked={tc.selected}
                  onCheckedChange={() => handleTestCaseToggle(tc.id)}
                />
                <Label htmlFor={tc.id}>{tc.text}</Label>
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
