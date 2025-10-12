"use client";
import { useEffect, useState } from "react";
import useTranslationHooks from "./hook";

export default function TranslationGame() {
  const { list, pair, selectRandom } = useTranslationHooks();
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (pair && Object.keys(list).length > 0) {
      setMessage("");
    }
  }, [pair]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair) return;

    if (userInput.trim().toLowerCase() === pair.translation.toLowerCase()) {
      setScore((prev) => prev + 1);
      setMessage("✅ Correct!");
    } else {
      setMessage(`❌ Incorrect! Correct answer: ${pair.translation}`);
    }

    setTimeout(() => {
      setUserInput("");
      setMessage("");
      selectRandom();
    }, 1000);
  };

  if (!pair || Object.keys(list).length === 0) {
    return <p style={{ textAlign: "center", marginTop: "4rem" }}>Loading...</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "4rem", fontFamily: "sans-serif" }}>
      <h1>German Translation Game 🇩🇪</h1>
      <p style={{ fontSize: "1.2rem" }}>
        Translate this word: <strong>{pair.article} {pair.word}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type the translation..."
          autoFocus
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "0.5rem",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1.2rem",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Check
        </button>
      </form>

      <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>
      <p style={{ marginTop: "2rem", fontSize: "1.1rem" }}>Score: {score}</p>
    </div>
  );
}
