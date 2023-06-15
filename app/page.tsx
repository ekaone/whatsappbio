"use client";

import { useState, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DropDown, { VibeType } from "@/components/DropDown";
import LoadingDots from "@/components/LoadingDots";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [vibe, setVibe] = useState<VibeType>("Funny");
  const [generatedBios, setGeneratedBios] = useState<String>("");

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const prompt = `Generate 5 ${vibe} biographies and base them on of this context: ${bio}. Make sure each generated biography is less than 77 characters, short sentences and concise, with no hashtags and clearly labeled "1.", "2.", "3.", "4." and "5." follow the user's instructions carefully.`;

  const generateBio = async (e: any) => {
    e.preventDefault();

    if (bio === "") {
      toast.error("Please enter your mind");
      return;
    }

    setGeneratedBios("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedBios((prev) => prev + chunkValue);
    }
    scrollToBios();
    setLoading(false);
  };

  return (
    <div className="relative flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4">
        <div className="max-w-xl w-full">
          <div className="flex mb-5 items-center space-x-3">
            <p className="text-left font-medium relative">
              Select your Stylish
            </p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>
          <div className="flex mt-10 items-center space-x-3">
            <p className="text-left font-medium">What is your mind</p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-pink-500 my-5"
            placeholder={"e.g. Wish me on april fool day…😁"}
          />

          {!loading && (
            <button
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 w-full"
              onClick={(e) => generateBio(e)}
            >
              Generate Bio &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-gradient-to-br from-lime-500 to-green-500 rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              🪄 <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedBios && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your Whatsapp Bio
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedBios
                  .substring(generatedBios.indexOf("1") + 3)
                  .split(/\d+\./g)
                  .map((generatedBio) => {
                    return (
                      <div
                        className="text-justify bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBio);
                          toast("Biography copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                        key={generatedBio}
                      >
                        <p>{generatedBio}</p>
                        <blockquote className="mt-4 text-sm border-l-4 border-slate-300 pl-3 text-slate-400">
                          whatsappbio.com
                        </blockquote>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
