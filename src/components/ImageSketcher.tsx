"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageSketcherProps {
  imageUrl: string;
  onSketch: (sketchedImageUrl: string) => void;
}

const ImageSketcher: React.FC<ImageSketcherProps> = ({ imageUrl, onSketch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    imageRef.current.onload = () => {
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
    };

    if (imageUrl) {
      imageRef.current.src = imageUrl;
    }
  }, [imageUrl]);

  const applySketchEffect = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Simple grayscale and edge detection for a sketch effect
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Grayscale conversion (luminosity method)
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Apply a simple threshold to create a sketch-like effect
      // You can adjust the threshold value (e.g., 128) for different results
      const threshold = 150; 
      const sketchColor = gray > threshold ? 255 : 0;

      pixels[i] = sketchColor;     // Red
      pixels[i + 1] = sketchColor; // Green
      pixels[i + 2] = sketchColor; // Blue
      // Alpha remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
    onSketch(canvas.toDataURL("image/png"));
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sketch Your Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative border rounded-md overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
        <Button onClick={applySketchEffect}>Apply Sketch Effect</Button>
      </CardContent>
    </Card>
  );
};

export default ImageSketcher;