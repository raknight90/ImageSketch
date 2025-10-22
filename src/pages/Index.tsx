"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import ImageUpload from "@/components/ImageUpload";
import ImageCropper from "@/components/ImageCropper";
import ImageSketcher from "@/components/ImageSketcher";
import ImageDisplayCard from "@/components/ImageDisplayCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; // Import Button

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [sketchedImage, setSketchedImage] = useState<string | null>(null);

  const handleImageSelect = (imageUrl: string) => {
    setOriginalImage(imageUrl);
    setCroppedImage(null); // Reset cropped and sketched when a new image is uploaded
    setSketchedImage(null);
  };

  const handleCrop = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setSketchedImage(null); // Reset sketched if cropped image changes
  };

  const handleSketch = (sketchedImageUrl: string) => {
    setSketchedImage(sketchedImageUrl);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 space-y-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-center">Photo Sketcher App</h1>

      <Button asChild className="mb-4">
        <Link to="/gallery">View Saved Images</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        <ImageUpload onImageSelect={handleImageSelect} />

        {originalImage && (
          <ImageCropper imageUrl={originalImage} onCrop={handleCrop} />
        )}

        {croppedImage && (
          <ImageSketcher imageUrl={croppedImage} onSketch={handleSketch} />
        )}
      </div>

      {(originalImage || croppedImage || sketchedImage) && (
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