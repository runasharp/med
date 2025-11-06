import React from "react";
import texts from "../data/texts.json";

const TypingArea = ({
  userInput,
  cursorIndex,
  currentTextIndex,
  parseText,
  showHint,
  containerRef,
  handleKeyDown,
  handleClick,
}) => {
  const text = texts[currentTextIndex].content;
  const chars = parseText(text);
  const inputMap = userInput[currentTextIndex] || {};
  const cursor = cursorIndex[currentTextIndex] ?? 0;

  return (
    <div
      className="text-container"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      style={{
        flexGrow: 1,
        overflowY: "auto",
        padding: "20px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        outline: "none",
        cursor: "text",
      }}
    >
      {chars.map((c, i) => {
        const typedChar = inputMap[i];
        let display = c.char;
        let color = "grey";

        // Handle hidden characters
        if (c.hidden && !showHint && !typedChar) display = "_";
        if (typedChar) {
          color = typedChar === c.char ? (c.hidden ? "green" : "blue") : "red";
          // Log comparison for debugging
          if (c.char === "\n" || typedChar === "\n") {
            console.log(`Position ${i}:`, {
              expectedChar: JSON.stringify(c.char),
              typedChar: JSON.stringify(typedChar),
              match: typedChar === c.char,
              color,
            });
          }
        }

        const isCursor = i === cursor;

        // Render newline characters
        if (c.char === "\n") {
          return (
            <span
              key={i}
              data-index={i}
              style={{
                color,
                backgroundColor: isCursor ? "lightgrey" : "transparent",
                display: "inline",
              }}
            >
              {typedChar === "\n" ? "\n" : display}
            </span>
          );
        }

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
      })}
      {/* Cursor at the end */}
      {cursor === chars.length && (
        <span
          style={{
            backgroundColor: "lightgrey",
            display: "inline-block",
            width: "2px",
            height: "1em",
          }}
        />
      )}
    </div>
  );
};

export default TypingArea;
