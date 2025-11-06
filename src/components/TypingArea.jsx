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

        if (c.hidden && !showHint && !typedChar) display = "_";
        if (typedChar)
          color = typedChar === c.char ? (c.hidden ? "green" : "blue") : "red";

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
      })}
    </div>
  );
};

export default TypingArea;
