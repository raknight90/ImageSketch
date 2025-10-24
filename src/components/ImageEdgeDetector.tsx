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
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null); // Stores the raw pixel data for the *currently processed* image
  const [currentLoadedImageUrl, setCurrentLoadedImageUrl] = useState<string | null>(null); // Tracks the imageUrl that originalImageData corresponds to

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
  }, []);

  // Effect 1: Handles loading the image and updating originalImageData
  useEffect(() => {
    const currentImageElement = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) {
      onEdgeDetect("");
      setOriginalImageData(null);
      setCurrentLoadedImageUrl(null);
      return;
    }

    // If imageUrl is empty, clear everything and return
    if (!imageUrl) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onEdgeDetect("");
      setOriginalImageData(null);
      setCurrentLoadedImageUrl(null);
      return;
    }

    // Only load a new image if the imageUrl has actually changed from what's currently loaded
    if (imageUrl !== currentLoadedImageUrl) {
      // Set currentLoadedImageUrl to null temporarily to indicate loading
      setCurrentLoadedImageUrl(null);
      setOriginalImageData(null); // Clear originalImageData to indicate new image is coming

      currentImageElement.src = imageUrl;

      const handleImageLoad = () => {
        // Create an offscreen canvas to get the original image data
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) {
          console.error("Failed to get offscreen canvas context.");
          onEdgeDetect("");
          setOriginalImageData(null);
          setCurrentLoadedImageUrl(null);
          return;
        }

        offscreenCanvas.width = currentImageElement.naturalWidth;
        offscreenCanvas.height = currentImageElement.naturalHeight;
        offscreenCtx.drawImage(currentImageElement, 0, 0);
        
        // Update the state with the new original image data and its source
        setOriginalImageData(offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height));
        setCurrentLoadedImageUrl(imageUrl); // Mark this URL as successfully loaded
        
        // Set the main canvas dimensions, but don't draw the original image here.
        // The processed image will be drawn by Effect 2.
        canvas.width = currentImageElement.naturalWidth;
        canvas.height = currentImageElement.naturalHeight;
        // Do NOT clear main canvas here. Let Effect 2 handle drawing.
        // If originalImageData is null, Effect 2 will not draw, preserving previous state.
      };

      const handleImageError = () => {
        console.error("Failed to load image for edge detection.");
        onEdgeDetect("");
        setOriginalImageData(null);
        setCurrentLoadedImageUrl(null);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear main canvas on error
      };

      currentImageElement.onload = handleImageLoad;
      currentImageElement.onerror = handleImageError;

      // Cleanup function: remove event listeners
      return () => {
        currentImageElement.onload = null;
        currentImageElement.onerror = null;
      };
    }
  }, [imageUrl, onEdgeDetect, currentLoadedImageUrl]); // Depend on currentLoadedImageUrl to know if a new image needs loading

  // Effect 2: Debounced application of edge detection when originalImageData is available or threshold changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!originalImageData || !ctx || !canvas) {
      // If no image data, do NOT clear the canvas.
      // This preserves the previous state during loading of a new image.
      // Only clear if imageUrl is explicitly empty (handled in Effect 1).
      onEdgeDetect("");
      return;
    }

    // Set canvas dimensions to match the image data
    canvas.width = originalImageData.width;
    canvas.height = originalImageData.height;

    const handler = setTimeout(() => {
      const processedData = processImageData(originalImageData, edgeThreshold);
      ctx.putImageData(processedData, 0, 0); // Draw the processed data to the canvas
      onEdgeDetect(canvas.toDataURL("image/png")); // Output the result
    }, 100); // Debounce for 100ms

    return () => {
      clearTimeout(handler);
    };
  }, [originalImageData, edgeThreshold, onEdgeDetect, processImageData]);

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
            max={300}
            step={1}
            value={[edgeThreshold]}
            onValueChange={(value) => setEdgeThreshold(value[0])}
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
          Reset Edge Threshold
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageEdgeDetector;