"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";
import ImageCropper from "@/components/ImageCropper";
import ImageSketcher from "@/components/ImageSketcher";
import ImageEdgeDetector from "@/components/ImageEdgeDetector";
import ImageDisplayCard from "@/components/ImageDisplayCard";
import OriginalImageDisplayCard from "@/components/OriginalImageDisplayCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => { // Explicitly define as React.FC
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [sketchedImage, setSketchedImage] = useState<string | null>(null);
  const [edgeDetectedImage, setEdgeDetectedImage] = useState<string | null>(null);

  const handleImageSelect = (imageUrl: string) => {
    setOriginalImage(imageUrl);
    setCroppedImage(null);
    setSketchedImage(null);
    setEdgeDetectedImage(null); // Reset all subsequent effects
  };

  const handleCrop = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setSketchedImage(null);
    setEdgeDetectedImage(null); // Reset subsequent effects
  };

  const handleSketch = (sketchedImageUrl: string) => {
    setSketchedImage(sketchedImageUrl);
    setEdgeDetectedImage(null); // Reset subsequent effects
  };

  const handleEdgeDetect = (edgeDetectedImageUrl: string) => {
    setEdgeDetectedImage(edgeDetectedImageUrl);
  };

  // Determine the source image for the next step in the pipeline
  const imageForSketcher = croppedImage || originalImage;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 space-y-8">
      <div className="flex justify-between w-full max-w-6xl mb-4">
        <h1 className="text-4xl font-bold text-center flex-grow">Photo Sketcher App</h1>
      </div>

      <Button asChild className="mb-4">
        <Link to="/gallery">View Saved Images</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        <ImageUpload onImageSelect={handleImageSelect} />

        {originalImage && (
          <ImageCropper imageUrl={originalImage} onCrop={handleCrop} />
        )}

        {imageForSketcher && (
          <ImageSketcher imageUrl={imageForSketcher} onSketch={handleSketch} />
        )}

        {originalImage && (
          <ImageEdgeDetector imageUrl={originalImage} onEdgeDetect={handleEdgeDetect} />
        )}
      </div>

      {(originalImage || croppedImage || sketchedImage || edgeDetectedImage) && (
        <>
          <Separator className="w-full max-w-6xl my-8" />
          <h2 className="text-3xl font-bold text-center">Your Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {originalImage && (
              <OriginalImageDisplayCard
                title="Original Image"
                imageUrl={originalImage}
              />
            )}
            {croppedImage && (
              <ImageDisplayCard
                title="Cropped Image"
                imageUrl={croppedImage}
                filename="cropped-image.png"
                showSaveButton={false} {/* Hide save button for cropped image */}
              />
            )}
            {sketchedImage && (
              <ImageDisplayCard
                title="Tonal Image"
                imageUrl={sketchedImage}
                filename="tonal-image.png"
              />
            )}
            {edgeDetectedImage && (
              <ImageDisplayCard
                title="Sketched Image"
                imageUrl={edgeDetectedImage}
                filename="edge-detected-image.png"
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