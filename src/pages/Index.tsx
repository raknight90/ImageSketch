"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";
import ImageCropper from "@/components/ImageCropper";
import ImageAdjuster from "@/components/ImageAdjuster";
import ImageSketcher from "@/components/ImageSketcher";
import ImageDisplayCard from "@/components/ImageDisplayCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [adjustedImage, setAdjustedImage] = useState<string | null>(null);
  const [sketchedImage, setSketchedImage] = useState<string | null>(null);

  const handleImageSelect = (imageUrl: string) => {
    setOriginalImage(imageUrl);
    setCroppedImage(null);
    setAdjustedImage(null);
    setSketchedImage(null);
  };

  const handleCrop = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setAdjustedImage(null);
    setSketchedImage(null);
  };

  const handleAdjust = (adjustedImageUrl: string) => {
    setAdjustedImage(adjustedImageUrl);
    setSketchedImage(null);
  };

  const handleSketch = (sketchedImageUrl: string) => {
    setSketchedImage(sketchedImageUrl);
  };

  // Determine the source image for the next step in the pipeline
  const imageForAdjuster = croppedImage || originalImage;
  const imageForSketcher = adjustedImage || croppedImage || originalImage;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 space-y-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <div className="flex justify-between w-full max-w-6xl mb-4">
        <h1 className="text-4xl font-bold text-center flex-grow">Photo Sketcher App</h1>
        <ThemeToggle /> {/* Add the ThemeToggle here */}
      </div>

      <Button asChild className="mb-4">
        <Link to="/gallery">View Saved Images</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        <ImageUpload onImageSelect={handleImageSelect} />

        {originalImage && (
          <ImageCropper imageUrl={originalImage} onCrop={handleCrop} />
        )}

        {imageForAdjuster && (
          <ImageAdjuster imageUrl={imageForAdjuster} onAdjust={handleAdjust} />
        )}

        {imageForSketcher && (
          <ImageSketcher imageUrl={imageForSketcher} onSketch={handleSketch} />
        )}
      </div>

      {(originalImage || croppedImage || adjustedImage || sketchedImage) && (
        <>
          <Separator className="w-full max-w-6xl my-8" />
          <h2 className="text-3xl font-bold text-center">Your Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {originalImage && (
              <ImageDisplayCard
                title="Original Image"
                imageUrl={originalImage}
                filename="original-image.png"
              />
            )}
            {croppedImage && (
              <ImageDisplayCard
                title="Cropped Image"
                imageUrl={croppedImage}
                filename="cropped-image.png"
              />
            )}
            {adjustedImage && (
              <ImageDisplayCard
                title="Adjusted Image"
                imageUrl={adjustedImage}
                filename="adjusted-image.png"
              />
            )}
            {sketchedImage && (
              <ImageDisplayCard
                title="Sketched Image"
                imageUrl={sketchedImage}
                filename="sketched-image.png"
              />
            )}
          </div>
        </>
      )}

      <MadeWithDyad />
    </div>
  );
};

export default Index;