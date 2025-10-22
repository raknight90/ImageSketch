"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImageGallery } from "@/hooks/use-image-gallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

const Gallery = () => {
  const { galleryImages, deleteImage, clearGallery } = useImageGallery();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 space-y-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-center">Your Image Gallery</h1>

      <div className="flex space-x-4">
        <Button asChild>
          <Link to="/">Back to Editor</Link>
        </Button>
        {galleryImages.length > 0 && (
          <Button variant="destructive" onClick={clearGallery}>
            Clear All Images
          </Button>
        )}
      </div>

      <Separator className="w-full max-w-6xl my-8" />

      {galleryImages.length === 0 ? (
        <p className="text-xl text-gray-600 dark:text-gray-400">No images saved yet. Go back to the editor to create some!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {galleryImages.map((image) => (
            <Card key={image.id} className="w-full max-w-md relative">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {image.title}
                  <Button variant="ghost" size="icon" onClick={() => deleteImage(image.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Saved: {new Date(image.timestamp).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <img src={image.imageUrl} alt={image.title} className="max-w-full h-auto rounded-md shadow-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MadeWithDyad />
    </div>
  );
};

export default Gallery;