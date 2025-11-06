import React from "react";
import texts from "../data/texts.json";

const TypingHeader = ({
  currentTextIndex,
  handleTextChange,
  showHint,
  setShowHint,
}) => {
  return (
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
  );
};

export default TypingHeader;
