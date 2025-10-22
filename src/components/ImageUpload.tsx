"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      onImageSelect("");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Your Photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Picture</Label>
          <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        {previewUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Preview:</h3>
            <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-md shadow-md" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;