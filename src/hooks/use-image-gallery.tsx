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
    try {
      const storedImages = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedImages) {
        setGalleryImages(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error("Failed to load images from localStorage:", error);
      toast.error("Failed to load saved images.");
    }
  }, []);

  // Save images to localStorage whenever galleryImages changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(galleryImages));
    } catch (error) {
      console.error("Failed to save images to localStorage:", error);
      toast.error("Failed to save image.");
    }
  }, [galleryImages]);

  const saveImage = useCallback((title: string, imageUrl: string) => {
    if (!imageUrl) {
      toast.error("Cannot save an empty image.");
      return;
    }
    const newImage: GalleryImage = {
      id: crypto.randomUUID(),
      title,
      imageUrl,
      timestamp: Date.now(),
    };
    setGalleryImages((prevImages) => [...prevImages, newImage]);
    toast.success(`'${title}' saved to gallery!`);
  }, []);

  const deleteImage = useCallback((id: string) => {
    setGalleryImages((prevImages) => prevImages.filter((img) => img.id !== id));
    toast.info("Image removed from gallery.");
  }, []);

  const clearGallery = useCallback(() => {
    setGalleryImages([]);
    toast.info("Gallery cleared.");
  }, []);

  return { galleryImages, saveImage, deleteImage, clearGallery };
}