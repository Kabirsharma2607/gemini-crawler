"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [email, setEmail] = useState("kabiragnihotri@gmail.com");
  const [password, setPassword] = useState("Admin@12345");
  const [website, setWebsite] = useState("https://sanskruty.com");
  const [loading, setLoading] = useState();
  const [findImages, setFindImages] = useState(false);

  const [images, setImages] = useState([]);

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
  //const [response, setResponse] = useState();

  const genTestCases = ({ index }) => {
    console.log(index);
  };

  const onClick = async () => {
    setLoading(true);

    try {
      const response = await axios.get("/apis/getall", {
        params: {
          email, // The email will be added to the query string
          password, // The password will be added to the query string
          website, // The website will be added to the query string
        },
      });
      setFindImages(true);
      console.log(response);
    } catch (error) {
      console.error("Error occurred during the request", error);
    } finally {
      setLoading(false); // Ensure to reset loading regardless of success/failure
    }
  };
  return (
    <div>
      {/* {JSON.stringify(images)} */}
      <label className="pr-2">Enter your email: </label>
      <input
        type="text"
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
        className="text-black"
      />
      <br />
      <br />
      <br />
      <label className="pr-2">Enter your password</label>
      <input
        type="text"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="text-black"
      />
      <br />
      <br />
      <br />

      <label className="pr-2">Enter the website</label>
      <input
        type="text"
        placeholder="Website"
        onChange={(e) => setWebsite(e.target.value)}
        className="text-black"
      />
      <br />
      <br />
      <br />
      <button
        type="submit"
        className="bg-white text-black p-2 rounded-sm"
        onClick={onClick}
      >
        Submit
      </button>
      {loading && <div className="text-white text-4xl">Loading... </div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="text-white">
              <img
                src={image}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-auto rounded shadow-lg"
                onClick={() => genTestCases({ index })}
              />
              <p className="text-center mt-2">Screenshot {index + 1}</p>
            </div>
          ))
        ) : (
          <div className="text-white text-center">
            <p>No screenshots available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
