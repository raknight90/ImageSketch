"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  timestamp: number;
}

const LOCAL_STORAGE_KEY = "imageGallery";

export function useImageGallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  // Load images from localStorage on component mount
  useEffect(() => {
    console.log("useImageGallery: Loading images from localStorage...");
    try {
      const storedImages = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedImages) {
        const parsedImages = JSON.parse(storedImages);
        setGalleryImages(parsedImages);
        console.log("useImageGallery: Loaded images:", parsedImages);
      } else {
        console.log("useImageGallery: No images found in localStorage.");
      }
    } catch (error) {
      console.error("useImageGallery: Failed to load images from localStorage:", error);
      toast.error("Failed to load saved images.");
    }
  }, []);

  // Save images to localStorage whenever galleryImages changes
  useEffect(() => {
    console.log("useImageGallery: galleryImages changed, attempting to save to localStorage:", galleryImages);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(galleryImages));
      console.log("useImageGallery: Images saved to localStorage.");
    } catch (error) {
      console.error("useImageGallery: Failed to save images to localStorage:", error);
      toast.error("Failed to save image.");
    }
  }, [galleryImages]);

  const saveImage = useCallback((title: string, imageUrl: string) => {
    console.log("useImageGallery: saveImage called with title:", title, "imageUrl length:", imageUrl.length);
    if (!imageUrl) {
      toast.error("Cannot save an empty image.");
      console.warn("useImageGallery: Attempted to save empty image.");
      return;
    }
    const newImage: GalleryImage = {
      id: crypto.randomUUID(),
      title,
      imageUrl,
      timestamp: Date.now(),
    };
    setGalleryImages((prevImages) => {
      const updatedImages = [...prevImages, newImage];
      console.log("useImageGallery: setGalleryImages - new state will be:", updatedImages);
      return updatedImages;
    });
    toast.success(`'${title}' saved to gallery!`);
  }, []);

  const deleteImage = useCallback((id: string) => {
    console.log("useImageGallery: deleteImage called for id:", id);
    setGalleryImages((prevImages) => prevImages.filter((img) => img.id !== id));
    toast.info("Image removed from gallery.");
  }, []);

  const clearGallery = useCallback(() => {
    console.log("useImageGallery: clearGallery called.");
    setGalleryImages([]);
    toast.info("Gallery cleared.");
  }, []);

  return { galleryImages, saveImage, deleteImage, clearGallery };
}