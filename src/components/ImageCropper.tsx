"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageUrl, onCrop }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    imageRef.current.onload = () => {
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
      setCrop({ x: 0, y: 0, width: canvas.width, height: canvas.height }); // Default to full image
    };

    if (imageUrl) {
      imageRef.current.src = imageUrl;
    }
  }, [imageUrl]);

  const drawCropRect = (ctx: CanvasRenderingContext2D) => {
    const { x, y, width, height } = crop;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvasRef.current!.width, y); // Top overlay
    ctx.fillRect(0, y + height, canvasRef.current!.width, canvasRef.current!.height - (y + height)); // Bottom overlay
    ctx.fillRect(0, y, x, height); // Left overlay
    ctx.fillRect(x + width, y, canvasRef.current!.width - (x + width), height); // Right overlay
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
    drawCropRect(ctx);
  };

  useEffect(() => {
    redrawCanvas();
  }, [crop]);

  const getMousePos = (canvas: HTMLCanvasElement, event: React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const { x, y } = getMousePos(canvasRef.current!, event);
    setStartPoint({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const { x, y } = getMousePos(canvasRef.current!, event);
    const newWidth = x - startPoint.x;
    const newHeight = y - startPoint.y;

    setCrop({
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(newWidth),
      height: Math.abs(newHeight),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (crop.width === 0 || crop.height === 0) {
      // If no valid crop area was drawn, reset to full image
      const canvas = canvasRef.current;
      if (canvas) {
        setCrop({ x: 0, y: 0, width: canvas.width, height: canvas.height });
      }
    }
  };

  const handleCropImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d");

    if (!offscreenCtx) return;

    offscreenCanvas.width = crop.width;
    offscreenCanvas.height = crop.height;

    offscreenCtx.drawImage(
      imageRef.current,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    onCrop(offscreenCanvas.toDataURL("image/png"));
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crop Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative border rounded-md overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // End drag if mouse leaves canvas
          />
        </div>
        <Button onClick={handleCropImage} disabled={crop.width === 0 || crop.height === 0}>
          Apply Crop
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageCropper;