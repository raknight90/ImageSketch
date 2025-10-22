"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageSketcherProps {
  imageUrl: string;
  onSketch: (sketchedImageUrl: string) => void;
}

const ImageSketcher: React.FC<ImageSketcherProps> = ({ imageUrl, onSketch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [brightness, setBrightness] = useState<number>(0); // -100 to 100
  const [contrast, setContrast] = useState<number>(0); // -100 to 100

  const applySketchEffect = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current.complete) return;

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const brightnessFactor = brightness / 100; // -1 to 1
    const contrastFactor = (contrast + 100) / 100; // 0 to 2, where 1 is no change

    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];

      // Apply brightness
      r = r * (1 + brightnessFactor);
      g = g * (1 + brightnessFactor);
      b = b * (1 + brightnessFactor);

      // Apply contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Clamp values to 0-255
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));

      // Grayscale conversion (luminosity method)
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Apply a simple threshold to create a sketch-like effect
      const threshold = 150; 
      const sketchColor = gray > threshold ? 255 : 0;

      pixels[i] = sketchColor;     // Red
      pixels[i + 1] = sketchColor; // Green
      pixels[i + 2] = sketchColor; // Blue
      // Alpha remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
    onSketch(canvas.toDataURL("image/png"));
  }, [brightness, contrast, onSketch]);

  useEffect(() => {
    imageRef.current.onload = () => {
      applySketchEffect();
    };

    if (imageUrl) {
      imageRef.current.src = imageUrl;
    } else {
      // Clear canvas if no image URL
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSketch(""); // Clear sketched image if source is gone
      }
    }
  }, [imageUrl, applySketchEffect]);

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    // applySketchEffect will be called via useEffect due to state change
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sketch Your Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="sketch-brightness-slider">Brightness ({brightness})</Label>
          <Slider
            id="sketch-brightness-slider"
            min={-100}
            max={100}
            step={1}
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
            className="w-full"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sketch-contrast-slider">Contrast ({contrast})</Label>
          <Slider
            id="sketch-contrast-slider"
            min={-100}
            max={100}
            step={1}
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0])}
            className="w-full"
          />
        </div>
        <div className="relative border rounded-md overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
        <Button onClick={handleReset} variant="outline">
          Reset Sketch Adjustments
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageSketcher;