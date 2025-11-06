import React, { useState, useRef } from "react";
import texts from "./texts.json";
import "./TypingQuiz.css";

const TypingQuiz = () => {
  const [userInput, setUserInput] = useState({});
  const [cursorIndex, setCursorIndex] = useState({});
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const containerRef = useRef(null);

  // Focus on typing area on mount
  React.useEffect(() => {
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
    const textAreaFocused = containerRef.current.contains(
      document.activeElement
    );
    const key = e.key;

    if (textAreaFocused) e.preventDefault();

    const inputMap = { ...userInput[currentTextIndex] };
    const textChars = parseText(texts[currentTextIndex].content);
    const cursor = cursorIndex[currentTextIndex] ?? 0;

    if (key.length === 1) {
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

  const handleClick = () => {
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
      let display = c.char;
      let color = "grey";

      if (c.hidden && !showHint && !typedChar) display = "_";

      if (typedChar) {
        color = typedChar === c.char ? (c.hidden ? "green" : "blue") : "red";
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
      style={{
        outline: "none",
        cursor: "text",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        {/* Select Text */}
        <div>
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

        {/* Show Hint */}
        <button
          onClick={() => setShowHint((p) => !p)}
          style={{ padding: "6px 12px" }}
        >
          {showHint ? "Hinweis ausblenden" : "Hinweis anzeigen"}
        </button>
      </div>

      {/* Typing Area */}
      <div
        className="text-container"
        style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "20px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {getStyledText()}
      </div>
    </div>
  );
};

export default TypingQuiz;
