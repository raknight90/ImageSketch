"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageAdjusterProps {
  imageUrl: string;
  onAdjust: (adjustedImageUrl: string) => void;
}

const ImageAdjuster: React.FC<ImageAdjusterProps> = ({ imageUrl, onAdjust }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [brightness, setBrightness] = useState<number>(0); // -100 to 100
  const [contrast, setContrast] = useState<number>(0); // -100 to 100

  const applyAdjustments = useCallback(() => {
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
      pixels[i] = Math.min(255, Math.max(0, r));
      pixels[i + 1] = Math.min(255, Math.max(0, g));
      pixels[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imageData, 0, 0);
    onAdjust(canvas.toDataURL("image/png"));
  }, [brightness, contrast, onAdjust]);

  useEffect(() => {
    imageRef.current.onload = () => {
      applyAdjustments();
    };

    if (imageUrl) {
      imageRef.current.src = imageUrl;
    } else {
      // Clear canvas if no image URL
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onAdjust(""); // Clear adjusted image if source is gone
      }
    }
  }, [imageUrl, applyAdjustments]); // Re-run when imageUrl or applyAdjustments changes

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    // applyAdjustments will be called via useEffect due to state change
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Adjust Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="brightness-slider">Brightness ({brightness})</Label>
          <Slider
            id="brightness-slider"
            min={-100}
            max={100}
            step={1}
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
            className="w-full"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contrast-slider">Contrast ({contrast})</Label>
          <Slider
            id="contrast-slider"
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
          Reset Adjustments
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageAdjuster;