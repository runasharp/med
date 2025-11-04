import React, { useState, useEffect, useRef } from "react";
import texts from "./texts.json";
import "./TypingQuiz.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const TypingQuiz = () => {
  const [userInput, setUserInput] = useState({});
  const [cursorIndex, setCursorIndex] = useState({});
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [graphVisible, setGraphVisible] = useState(false);
  const [countdownMinutes, setCountdownMinutes] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [countdownActive, setCountdownActive] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Format seconds as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Timer & countdown effect
  useEffect(() => {
    if (!startTime && !countdownActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (countdownActive && countdown !== null) {
        const remaining = Math.max(countdown - now, 0);
        setElapsedTime(Math.ceil(remaining / 1000));
        if (remaining === 0) {
          setCountdownActive(false);
        }
      } else {
        const newElapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(newElapsed);

        if (showSpeed) {
          const inputMap = userInput[currentTextIndex] || {};
          const charsTyped = Object.keys(inputMap).length;
          const minutes = newElapsed / 60 || 1 / 60;
          const wpm = Math.round(charsTyped / 5 / minutes);
          setSpeedHistory((prev) => [...prev, { second: newElapsed, wpm }]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    startTime,
    showSpeed,
    userInput,
    currentTextIndex,
    countdownActive,
    countdown,
  ]);

  const handleTextChange = (index) => {
    setCurrentTextIndex(index);
    if (!userInput[index]) setUserInput((prev) => ({ ...prev, [index]: {} }));
    if (!cursorIndex[index])
      setCursorIndex((prev) => ({ ...prev, [index]: 0 }));
    setStartTime(null);
    setElapsedTime(0);
    setSpeedHistory([]);
    setCountdownActive(false);
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

    if (!startTime && !countdownActive) setStartTime(Date.now());

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

  const calculateSpeed = () => {
    const inputMap = userInput[currentTextIndex] || {};
    const charsTyped = Object.keys(inputMap).length;
    const minutes = elapsedTime / 60 || 1 / 60;
    const wpm = charsTyped / 5 / minutes;
    return Math.round(wpm);
  };

  const handleResetTime = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setSpeedHistory([]);
    setCountdownActive(false);
  };

  const handleStartCountdown = () => {
    const minutes = parseInt(countdownMinutes);
    if (isNaN(minutes) || minutes <= 0) return;
    const countdownMs = minutes * 60 * 1000;
    setCountdown(Date.now() + countdownMs);
    setCountdownActive(true);
    setStartTime(null);
    setElapsedTime(minutes * 60);
    setSpeedHistory([]);
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

        {/* Timer */}
        {showTimer && <div>Zeit: {formatTime(elapsedTime)}</div>}

        {/* WPM */}
        {showSpeed && <div>Geschwindigkeit: {calculateSpeed()} WPM</div>}

        {/* Toggles */}
        <div style={{ display: "flex", gap: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={showTimer}
              onChange={() => setShowTimer((p) => !p)}
            />{" "}
            Zeit
          </label>
          <label>
            <input
              type="checkbox"
              checked={showSpeed}
              onChange={() => setShowSpeed((p) => !p)}
            />{" "}
            Geschwindigkeit
          </label>
        </div>

        {/* Reset / Countdown */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={handleResetTime} style={{ padding: "6px 12px" }}>
            Zeit zurücksetzen
          </button>
          <input
            type="number"
            placeholder="Minuten"
            value={countdownMinutes}
            onChange={(e) => setCountdownMinutes(e.target.value)}
            style={{ width: "60px", padding: "4px" }}
          />
          <button
            onClick={handleStartCountdown}
            style={{ padding: "6px 12px" }}
          >
            Countdown starten
          </button>
        </div>
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

      {/* Graph toggle */}
      {showSpeed && (
        <div style={{ marginTop: "10px", padding: "0 20px" }}>
          <button
            onClick={() => setGraphVisible((p) => !p)}
            style={{ padding: "6px 12px" }}
          >
            {graphVisible ? "Graph ausblenden" : "Graph anzeigen"}
          </button>
        </div>
      )}

      {/* Real-time speed graph */}
      {showSpeed && graphVisible && speedHistory.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            padding: "0 20px",
            maxHeight: "250px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h4>Geschwindigkeit über Zeit (WPM)</h4>
          <LineChart
            width={700}
            height={200}
            data={speedHistory}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid stroke="#ccc" />
            <XAxis
              dataKey="second"
              label={{
                value: "Sekunden",
                position: "insideBottomRight",
                offset: -5,
              }}
            />
            <YAxis
              label={{ value: "WPM", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Line type="monotone" dataKey="wpm" stroke="#8884d8" dot={false} />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default TypingQuiz;
