import { useState, useRef } from "react";
import texts from "../data/texts.json";

export const useTyping = () => {
  const [userInput, setUserInput] = useState({});
  const [cursorIndex, setCursorIndex] = useState({});
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const containerRef = useRef(null);

  // Focus on mount
  const focusContainer = () => containerRef.current?.focus();

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
    const textAreaFocused = containerRef.current?.contains(
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

  return {
    userInput,
    cursorIndex,
    currentTextIndex,
    showHint,
    containerRef,
    handleTextChange,
    handleKeyDown,
    handleClick,
    parseText,
    setShowHint,
  };
};
