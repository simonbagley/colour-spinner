import React, { useRef, useState, useEffect } from "react";
import { ChromePicker } from "react-color";

const generateColors = (count) => {
  if (!Number.isFinite(count) || count < 1) return ["#000000"];
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    colors.push(`hsl(${hue}, 100%, 50%)`);
  }
  return colors;
};

const randomizeColors = (count, segments) => {
  const palette = generateColors(count);
  const result = [];
  for (let i = 0; i < segments; i++) {
    const choices = palette.filter((c) => c !== result[i - 1]);
    result.push(choices[Math.floor(Math.random() * choices.length)]);
  }
  return result;
};

export default function App() {
  const canvasRef = useRef(null);
  const [segments, setSegments] = useState(16);
  const [spinRate, setSpinRate] = useState(0.5);
  const [diameter, setDiameter] = useState(400);
  const [colorCount, setColorCount] = useState(2);
  const [colors, setColors] = useState(() => generateColors(2));
  const [isPaused, setIsPaused] = useState(false);
  const [angle, setAngle] = useState(0);

  const animate = useRef();
  const lastTime = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !Array.isArray(colors) || colors.length === 0) return;

    canvas.width = diameter;
    canvas.height = diameter;
    const radius = diameter / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle);

    const angleStep = (2 * Math.PI) / segments;
    for (let i = 0; i < segments; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, i * angleStep, (i + 1) * angleStep);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length] || "#000";
      ctx.fill();
    }
    ctx.restore();
  }, [angle, segments, colors, diameter]);

  useEffect(() => {
    const loop = (timestamp) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const delta = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      if (!isPaused) {
        setAngle(
          (prev) => (prev + 2 * Math.PI * spinRate * delta) % (2 * Math.PI)
        );
      }
      animate.current = requestAnimationFrame(loop);
    };
    animate.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animate.current);
  }, [spinRate, isPaused]);

  const handleColorChange = (index, newColor) => {
    const updated = [...colors];
    updated[index] = newColor?.hex || "#000000";
    setColors(updated);
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
      <canvas
        ref={canvasRef}
        style={{ background: "#fff", borderRadius: "50%" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "300px",
        }}
      >
        <div>
          <label>Segments: {segments}</label>
          <input
            type="range"
            min="0"
            max="32"
            value={segments}
            onChange={(e) => setSegments(+e.target.value)}
          />
        </div>
        <div>
          <label>Spin Rate: {spinRate.toFixed(1)} rev/s</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={spinRate}
            onChange={(e) => setSpinRate(+e.target.value)}
          />
        </div>
        <div>
          <label>Diameter: {diameter}px</label>
          <input
            type="range"
            min="100"
            max="1200"
            value={diameter}
            onChange={(e) => setDiameter(+e.target.value)}
          />
        </div>
        <div>
          <label>Number of Colours: {colorCount}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={colorCount}
            onChange={(e) => {
              const count = +e.target.value;
              setColorCount(count);
              setColors(generateColors(count));
            }}
          />
        </div>
        {colors.map((color, i) => (
          <ChromePicker
            key={i}
            color={color}
            onChange={(c) => handleColorChange(i, c)}
            disableAlpha
          />
        ))}
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <button
          onClick={() => setColors(randomizeColors(colorCount, segments))}
        >
          🎲 Randomize
        </button>
      </div>
    </div>
  );
}
