import React, { useState, useEffect, useRef } from "react";
import texts from "./texts.json";
import "./TypingQuiz.css";

const TypingQuiz = () => {
  const [userInput, setUserInput] = useState({}); // { [textIndex]: { position: char } }
  const [cursorIndex, setCursorIndex] = useState({});
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleTextChange = (index) => {
    setCurrentTextIndex(index);
    if (!userInput[index]) setUserInput((prev) => ({ ...prev, [index]: {} }));
    if (!cursorIndex[index])
      setCursorIndex((prev) => ({ ...prev, [index]: 0 }));
  };

  const parseText = (text) => {
    const chars = [];
    const regex = /\{(.*?)\}|./gs;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1] !== undefined) {
        for (let c of match[1]) chars.push({ char: c, hidden: true });
      } else {
        chars.push({ char: match[0], hidden: false });
      }
    }
    return chars;
  };

  const handleKeyDown = (e) => {
    e.preventDefault();
    const key = e.key;
    const inputMap = { ...userInput[currentTextIndex] };
    const textChars = parseText(texts[currentTextIndex].content);
    const cursor = cursorIndex[currentTextIndex] ?? 0;

    if (key.length === 1) {
      // Insert typed character at cursor position
      inputMap[cursor] = key;
      setUserInput((prev) => ({ ...prev, [currentTextIndex]: inputMap }));
      setCursorIndex((prev) => ({ ...prev, [currentTextIndex]: cursor + 1 }));
    } else if (key === "Backspace") {
      if (cursor > 0) {
        delete inputMap[cursor - 1];
        setUserInput((prev) => ({ ...prev, [currentTextIndex]: inputMap }));
        setCursorIndex((prev) => ({ ...prev, [currentTextIndex]: cursor - 1 }));
      }
    } else if (key === "Delete") {
      if (cursor < textChars.length) {
        delete inputMap[cursor];
        setUserInput((prev) => ({ ...prev, [currentTextIndex]: inputMap }));
      }
    } else if (key === "ArrowLeft") {
      if (cursor > 0)
        setCursorIndex((prev) => ({ ...prev, [currentTextIndex]: cursor - 1 }));
    } else if (key === "ArrowRight") {
      if (cursor < textChars.length)
        setCursorIndex((prev) => ({ ...prev, [currentTextIndex]: cursor + 1 }));
    }
  };

  const handleClick = (e) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const span = range.startContainer.parentNode;
    if (!span.dataset || !span.dataset.index) return;

    const idx = Number(span.dataset.index);
    setCursorIndex((prev) => ({ ...prev, [currentTextIndex]: idx }));
    containerRef.current.focus();
  };

  const getStyledText = () => {
    const text = texts[currentTextIndex].content;
    const chars = parseText(text);
    const inputMap = userInput[currentTextIndex] || {};
    const cursor = cursorIndex[currentTextIndex] ?? 0;

    return chars.map((c, i) => {
      const typedChar = inputMap[i];
      let display;
      let color = "grey";

      if (c.hidden && !showHint && !typedChar) {
        display = "_";
      } else {
        display = c.char;
      }

      if (typedChar) {
        if (typedChar === c.char) {
          color = c.hidden ? "green" : "blue";
        } else {
          color = "red";
        }
      }

      const isCursor = i === cursor;

      return (
        <span
          key={i}
          data-index={i}
          style={{
            color,
            display: "inline",
            backgroundColor: isCursor ? "lightgrey" : "transparent",
          }}
        >
          {display}
        </span>
      );
    });
  };

  return (
    <div
      className="typing-quiz"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      style={{ outline: "none", cursor: "text", minHeight: "100vh" }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ marginRight: "8px" }}>Bericht wählen:</label>
          <select
            value={currentTextIndex}
            onChange={(e) => handleTextChange(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #aaa",
              fontSize: "14px",
            }}
          >
            {texts.map((t, index) => (
              <option key={t.id} value={index}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div
          className="text-container"
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginTop: "10px",
            whiteSpace: "pre-wrap",
            minHeight: "300px",
            fontFamily: "monospace",
          }}
        >
          {getStyledText()}
        </div>

        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => setShowHint((p) => !p)}
            style={{ padding: "6px 12px", marginRight: "10px" }}
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypingQuiz;
