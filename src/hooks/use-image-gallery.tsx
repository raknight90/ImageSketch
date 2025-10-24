"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSupabase } from "@/components/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  title: string; // Maps to 'description' in Supabase
  imageUrl: string; // Maps to 'image_url' in Supabase
  timestamp: string; // Maps to 'created_at' in Supabase (ISO string)
}

export function useImageGallery() {
  const { session, loading: sessionLoading } = useSupabase();
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch images from Supabase on component mount or when session changes
  useEffect(() => {
    const fetchImages = async () => {
      if (sessionLoading || !session?.user?.id) {
        setGalleryImages([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log("useImageGallery: Fetching images from Supabase for user:", session.user.id);
      const { data, error } = await supabase
        .from("generated_art")
        .select("id, description, image_url, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("useImageGallery: Failed to fetch images:", error);
        toast.error("Failed to load saved images from gallery.");
        setGalleryImages([]);
      } else {
        const fetchedImages: GalleryImage[] = data.map((item) => ({
          id: item.id,
          title: item.description,
          imageUrl: item.image_url,
          timestamp: item.created_at,
        }));
        setGalleryImages(fetchedImages);
        console.log("useImageGallery: Loaded images from Supabase:", fetchedImages);
        if (fetchedImages.length > 0) {
          toast.info(`Loaded ${fetchedImages.length} images from gallery.`);
        } else {
          toast.info("Gallery is empty.");
        }
      }
      setLoading(false);
    };

    fetchImages();
  }, [session, sessionLoading]); // Re-fetch when session or sessionLoading changes

  const saveImage = useCallback(async (title: string, imageUrl: string) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to save images.");
      return;
    }
    if (!imageUrl) {
      toast.error("Cannot save an empty image.");
      console.warn("useImageGallery: Attempted to save empty image.");
      return;
    }

    console.log("useImageGallery: Saving image to Supabase with title:", title, "imageUrl length:", imageUrl.length);

    const { data, error } = await supabase
      .from("generated_art")
      .insert({
        user_id: session.user.id,
        description: title,
        image_url: imageUrl,
        // style and orientation are not used by the current app logic, can be null or default
        style: "default",
        orientation: "default",
      })
      .select("id, description, image_url, created_at")
      .single();

    if (error) {
      console.error("useImageGallery: Failed to save image:", error);
      toast.error("Failed to save image to gallery.");
    } else if (data) {
      const newImage: GalleryImage = {
        id: data.id,
        title: data.description,
        imageUrl: data.image_url,
        timestamp: data.created_at,
      };
      setGalleryImages((prevImages) => [newImage, ...prevImages]); // Add new image to the top
      toast.success(`'${title}' saved to gallery!`);
    }
  }, [session]);

  const deleteImage = useCallback(async (id: string) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to delete images.");
      return;
    }
    console.log("useImageGallery: Deleting image from Supabase with id:", id);

    const { error } = await supabase
      .from("generated_art")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id); // Ensure user can only delete their own images

    if (error) {
      console.error("useImageGallery: Failed to delete image:", error);
      toast.error("Failed to delete image from gallery.");
    } else {
      setGalleryImages((prevImages) => prevImages.filter((img) => img.id !== id));
      toast.info("Image removed from gallery.");
    }
  }, [session]);

  const clearGallery = useCallback(async () => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to clear the gallery.");
      return;
    }
    console.log("useImageGallery: Clearing all images for user:", session.user.id);

    const { error } = await supabase
      .from("generated_art")
      .delete()
      .eq("user_id", session.user.id);

    if (error) {
      console.error("useImageGallery: Failed to clear gallery:", error);
      toast.error("Failed to clear gallery.");
    } else {
      setGalleryImages([]);
      toast.info("Gallery cleared.");
    }
  }, [session]);

  return { galleryImages, saveImage, deleteImage, clearGallery, loading };
}