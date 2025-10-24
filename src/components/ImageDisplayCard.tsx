"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImageGallery } from "@/hooks/use-image-gallery";

interface ImageDisplayCardProps {
  title: string;
  imageUrl: string;
  filename: string;
}

const ImageDisplayCard: React.FC<ImageDisplayCardProps> = ({ title, imageUrl, filename }) => {
  const { saveImage } = useImageGallery();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToGallery = () => {
    console.log("ImageDisplayCard: Save to Gallery button clicked for:", title);
    console.log("ImageDisplayCard: imageUrl length:", imageUrl ? imageUrl.length : 0);
    saveImage(title, imageUrl);
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <img src={imageUrl} alt={title} className="max-w-full h-auto rounded-md shadow-md" />
        <div className="flex flex-col space-y-2">
          <Button onClick={handleDownload}>Download {title}</Button>
          <Button variant="outline" onClick={handleSaveToGallery}>Save to Gallery</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageDisplayCard;