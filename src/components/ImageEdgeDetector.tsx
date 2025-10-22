"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
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
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null); // Stores the raw pixel data

  // Function to apply edge detection using Sobel operator
  const processImageData = useCallback((imageData: ImageData, threshold: number): ImageData => {
    const pixels = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    const outputImageData = new ImageData(width, height);
    const outputPixels = outputImageData.data;

    // Convert to grayscale first
    const grayPixels = new Uint8ClampedArray(width * height);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      grayPixels[i / 4] = 0.2126 * r + 0.7152 * g + 0.0722 * b; // Luminosity method
    }

    // Sobel kernels
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];

    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    for (let y = 1; y < height - 1; y++) { // Iterate excluding borders
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0;
        let pixelY = 0;

        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const neighborX = x + kx;
            const neighborY = y + ky;
            const neighborIndex = neighborY * width + neighborX;
            const grayValue = grayPixels[neighborIndex];

            pixelX += grayValue * sobelX[ky + 1][kx + 1];
            pixelY += grayValue * sobelY[ky + 1][kx + 1];
          }
        }

        // Calculate gradient magnitude
        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);

        // Apply threshold: black for strong edges, white for non-edges
        const edgeColor = magnitude > threshold ? 0 : 255;

        const outputIndex = (y * width + x) * 4;
        outputPixels[outputIndex] = edgeColor;     // Red
        outputPixels[outputIndex + 1] = edgeColor; // Green
        outputPixels[outputIndex + 2] = edgeColor; // Blue
        outputPixels[outputIndex + 3] = 255;       // Alpha
      }
    }

    // Handle borders (set to white or black, or copy original)
    // For simplicity, let's set borders to white (no edge)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          const outputIndex = (y * width + x) * 4;
          outputPixels[outputIndex] = 255;
          outputPixels[outputIndex + 1] = 255;
          outputPixels[outputIndex + 2] = 255;
          outputPixels[outputIndex + 3] = 255;
        }
      }
    }

    return outputImageData;
  }, []); // No dependencies, as it operates on passed arguments

  // Effect 1: Handles loading the image and storing its original pixel data
  useEffect(() => {
    const currentImage = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) {
      onEdgeDetect("");
      setOriginalImageData(null); // Clear stored data if canvas not ready
      return;
    }

    const handleImageLoad = () => {
      canvas.width = currentImage.naturalWidth;
      canvas.height = currentImage.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(currentImage, 0, 0);
      // Store the original image data
      setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };

    const handleImageError = () => {
      console.error("Failed to load image for edge detection.");
      onEdgeDetect("");
      setOriginalImageData(null); // Clear stored data on error
    };

    currentImage.onload = handleImageLoad;
    currentImage.onerror = handleImageError;

    if (imageUrl) {
      // Only update src if it's a new image to avoid unnecessary reloads
      if (currentImage.src !== imageUrl) {
        currentImage.src = imageUrl;
      } else if (currentImage.complete) {
        // If the image is already loaded (e.g., from cache), process it immediately
        handleImageLoad();
      }
    } else {
      // No image URL, clear canvas and stored data
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onEdgeDetect("");
      setOriginalImageData(null);
    }

    // Cleanup function: remove event listeners
    return () => {
      currentImage.onload = null;
      currentImage.onerror = null;
    };
  }, [imageUrl, onEdgeDetect]); // Only re-run if imageUrl changes

  // Effect 2: Applies edge detection when originalImageData is available or threshold changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (originalImageData && ctx && canvas) {
      // Process the stored original image data with the current threshold
      const processedData = processImageData(originalImageData, edgeThreshold);
      ctx.putImageData(processedData, 0, 0); // Draw the processed data to the canvas
      onEdgeDetect(canvas.toDataURL("image/png")); // Output the result
    } else if (!originalImageData && ctx && canvas) {
      // If originalImageData becomes null (e.g., imageUrl cleared), clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onEdgeDetect("");
    }
  }, [originalImageData, edgeThreshold, onEdgeDetect, processImageData]); // Re-run when original data or threshold changes

  const handleReset = () => {
    setEdgeThreshold(50);
    // The second useEffect will re-run due to edgeThreshold change and apply the effect
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