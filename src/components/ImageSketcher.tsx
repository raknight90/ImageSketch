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
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null); // Store base image data
  const [currentLoadedImageUrl, setCurrentLoadedImageUrl] = useState<string | null>(null); // Tracks the URL that baseImageData corresponds to

  // Function to apply sketch effect on baseImageData
  const applySketchEffect = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !baseImageData) {
      onSketch(""); // Clear output if no base image data
      return;
    }

    // Create a temporary canvas to draw the base image data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      onSketch("");
      return;
    }

    tempCanvas.width = baseImageData.width;
    tempCanvas.height = baseImageData.height;
    tempCtx.putImageData(baseImageData, 0, 0); // Draw original image data to temp canvas

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
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

    ctx.putImageData(imageData, 0, 0); // Draw processed data to main canvas
    onSketch(canvas.toDataURL("image/png")); // Emit the sketched image
  }, [brightness, contrast, baseImageData, onSketch]);

  // Effect 1: Load image and store baseImageData
  useEffect(() => {
    const currentImage = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) {
      onSketch("");
      setBaseImageData(null);
      setCurrentLoadedImageUrl(null);
      return;
    }

    // If imageUrl is empty, clear everything
    if (!imageUrl) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSketch("");
      setBaseImageData(null);
      setCurrentLoadedImageUrl(null);
      return;
    }

    // Only load a new image if the imageUrl has actually changed from what's currently loaded
    if (imageUrl !== currentLoadedImageUrl) {
      // Set currentLoadedImageUrl to null temporarily to indicate loading
      setCurrentLoadedImageUrl(null); 
      setBaseImageData(null); // Clear baseImageData to indicate new image is coming

      currentImage.src = imageUrl;

      const handleImageLoad = () => {
        canvas.width = currentImage.naturalWidth;
        canvas.height = currentImage.naturalHeight;
        // Do NOT clear canvas here. Let Effect 2 handle drawing.
        // If baseImageData is null, Effect 2 will not draw, preserving previous state.
        
        // Store the original image data from an offscreen canvas to avoid flicker
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) {
          console.error("Failed to get offscreen canvas context for ImageSketcher.");
          onSketch("");
          setBaseImageData(null);
          setCurrentLoadedImageUrl(null);
          return;
        }
        offscreenCanvas.width = currentImage.naturalWidth;
        offscreenCanvas.height = currentImage.naturalHeight;
        offscreenCtx.drawImage(currentImage, 0, 0);
        
        setBaseImageData(offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height));
        setCurrentLoadedImageUrl(imageUrl); // Mark this URL as successfully loaded
      };

      const handleImageError = () => {
        console.error("Failed to load image for sketching.");
        setBaseImageData(null);
        setCurrentLoadedImageUrl(null);
        onSketch("");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear on error
      };

      currentImage.onload = handleImageLoad;
      currentImage.onerror = handleImageError;

      return () => {
        currentImage.onload = null;
        currentImage.onerror = null;
      };
    }
  }, [imageUrl, onSketch, currentLoadedImageUrl]); // Depend on currentLoadedImageUrl

  // Effect 2: Debounce applying sketch effect when sliders change or base image is ready
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!baseImageData || !ctx || !canvas) {
      // If no base image data, do NOT clear the canvas.
      // This preserves the previous state during loading of a new image.
      // Only clear if imageUrl is explicitly empty (handled in Effect 1).
      onSketch("");
      return;
    }

    // Set canvas dimensions to match the image data
    canvas.width = baseImageData.width;
    canvas.height = baseImageData.height;

    const handler = setTimeout(() => {
      applySketchEffect();
    }, 100); // Debounce for 100ms

    return () => {
      clearTimeout(handler);
    };
  }, [brightness, contrast, baseImageData, applySketchEffect, onSketch]);

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    // applySketchEffect will be called via Effect 2 due to state change
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
          {imageUrl && !currentLoadedImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <p className="text-muted-foreground">Loading image...</p>
            </div>
          )}
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