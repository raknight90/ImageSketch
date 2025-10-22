"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ImageEdgeDetectorProps {
  imageUrl: string;
  onEdgeDetect: (edgeDetectedImageUrl: string) => void;
}

const ImageEdgeDetector: React.FC<ImageEdgeDetectorProps> = ({ imageUrl, onEdgeDetect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [edgeThreshold, setEdgeThreshold] = useState<number>(50); // 0 to 255

  // This function will be recreated on every render, capturing the latest edgeThreshold
  const applyEdgeDetection = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current.complete) {
      // console.log("Skipping applyEdgeDetection: canvas, ctx, or image not ready.");
      return;
    }

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const outputImageData = ctx.createImageData(width, height);
    const outputPixels = outputImageData.data;

    // Convert to grayscale first for simpler edge detection
    const grayPixels = new Uint8ClampedArray(width * height);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      grayPixels[i / 4] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const p = grayPixels[i];

        // Get neighbors (handle boundaries)
        const pRight = (x < width - 1) ? grayPixels[y * width + (x + 1)] : p;
        const pBottom = (y < height - 1) ? grayPixels[(y + 1) * width + x] : p;

        // Calculate horizontal and vertical gradients (simple difference)
        const gx = pRight - p;
        const gy = pBottom - p;

        // Magnitude of gradient (approximates edge strength)
        const magnitude = Math.sqrt(gx * gx + gy * gy);

        // Apply threshold: black for strong edges, white for non-edges
        const edgeColor = magnitude > edgeThreshold ? 0 : 255;

        outputPixels[i * 4] = edgeColor;     // Red
        outputPixels[i * 4 + 1] = edgeColor; // Green
        outputPixels[i * 4 + 2] = edgeColor; // Blue
        outputPixels[i * 4 + 3] = 255;       // Alpha
      }
    }
    ctx.putImageData(outputImageData, 0, 0);
    onEdgeDetect(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    const currentImage = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) {
      onEdgeDetect(""); // Clear output if canvas/context not ready
      return;
    }

    const loadImageAndApplyEffect = () => {
      if (imageUrl) {
        // Only update src if it's a new image to avoid unnecessary reloads
        if (currentImage.src !== imageUrl) {
          currentImage.src = imageUrl;
        }

        // If image is already loaded, apply effect immediately
        if (currentImage.complete) {
          applyEdgeDetection();
        } else {
          // Otherwise, wait for it to load
          currentImage.onload = () => {
            applyEdgeDetection();
          };
          currentImage.onerror = () => {
            console.error("Failed to load image for edge detection.");
            onEdgeDetect("");
          };
        }
      } else {
        // No image URL, clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onEdgeDetect("");
      }
    };

    loadImageAndApplyEffect();

    // Cleanup function
    return () => {
      currentImage.onload = null;
      currentImage.onerror = null;
    };
  }, [imageUrl, edgeThreshold, onEdgeDetect]); // Depend on imageUrl and edgeThreshold

  const handleReset = () => {
    setEdgeThreshold(50);
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Detect Edges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="edge-threshold-slider">Edge Detection Threshold ({edgeThreshold})</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adjusts the sensitivity of edge detection.</p>
                  <p>Lower values detect more subtle edges (more lines).</p>
                  <p>Higher values detect only strong edges (fewer lines).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Slider
            id="edge-threshold-slider"
            min={0}
            max={200}
            step={1}
            value={[edgeThreshold]}
            onValueChange={(value) => setEdgeThreshold(value[0])}
            className="w-full"
          />
        </div>
        <div className="relative border rounded-md overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
        <Button onClick={handleReset} variant="outline">
          Reset Edge Threshold
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageEdgeDetector;