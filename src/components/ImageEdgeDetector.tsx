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

  // TEMPORARY DEBUGGING FUNCTION: Fills canvas with a color based on threshold
  const processImageData = useCallback((imageData: ImageData, threshold: number): ImageData => {
    console.log("DEBUG: processImageData called with threshold:", threshold);
    const width = imageData.width;
    const height = imageData.height;
    const outputImageData = new ImageData(width, height);
    const outputPixels = outputImageData.data;

    // Scale threshold to a color value (0-255)
    const colorValue = Math.min(255, Math.max(0, threshold * 1.275)); // Scale 0-200 to 0-255

    for (let i = 0; i < outputPixels.length; i += 4) {
      outputPixels[i] = colorValue;     // Red
      outputPixels[i + 1] = colorValue; // Green
      outputPixels[i + 2] = colorValue; // Blue
      outputPixels[i + 3] = 255;        // Alpha
    }
    return outputImageData;
  }, []);

  // Effect 1: Handles loading the image and storing its original pixel data
  useEffect(() => {
    console.log("Image loading effect triggered for imageUrl:", imageUrl);
    const currentImage = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) {
      onEdgeDetect("");
      setOriginalImageData(null); // Clear stored data if canvas not ready
      return;
    }

    const handleImageLoad = () => {
      console.log("Image loaded successfully.");
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
    console.log("Edge detection application effect triggered. Threshold:", edgeThreshold);
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
            onValueChange={(value) => {
              console.log("Slider value changed to:", value[0]);
              setEdgeThreshold(value[0]);
            }}
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