"use client";

import { useEffect, useRef } from "react";

const GenerateFavicon = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const size = 64; // Favicon size

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#3b82f6"); // blue-500
    gradient.addColorStop(1, "#8b5cf6"); // purple-500

    // Draw rounded rectangle with gradient
    ctx.fillStyle = gradient;
    roundRect(ctx, 4, 4, size - 8, size - 8, 12);
    ctx.fill();

    // Draw check square icon
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();

    // Draw square
    ctx.rect(18, 18, 28, 28);

    // Draw check
    ctx.moveTo(24, 32);
    ctx.lineTo(30, 38);
    ctx.lineTo(40, 26);

    ctx.stroke();

    // Convert to favicon and set
    const link =
      document.querySelector("link[rel='icon']") ||
      document.createElement("link");
    link.type = "image/png";
    link.rel = "icon";
    link.href = canvas.toDataURL("image/png");
    document.head.appendChild(link);
  }, []);

  // Helper function to draw rounded rectangle
  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  return (
    <div className="hidden">
      <canvas ref={canvasRef} width="64" height="64" />
    </div>
  );
};

export default GenerateFavicon;
