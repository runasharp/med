import React from "react";
import { useTyping } from "../hooks/useTyping";
import TypingHeader from "./TypingHeader";
import TypingArea from "./TypingArea";
import "../styles/TypingQuiz.css";

const TypingQuiz = () => {
  const typing = useTyping();

  React.useEffect(() => {
    typing.containerRef.current?.focus();
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TypingHeader
        currentTextIndex={typing.currentTextIndex}
        handleTextChange={typing.handleTextChange}
        showHint={typing.showHint}
        setShowHint={typing.setShowHint}
      />
      <TypingArea {...typing} />
    </div>
  );
};

export default TypingQuiz;
