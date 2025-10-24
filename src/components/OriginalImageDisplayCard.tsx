"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OriginalImageDisplayCardProps {
  title: string;
  imageUrl: string;
}

const OriginalImageDisplayCard: React.FC<OriginalImageDisplayCardProps> = ({ title, imageUrl }) => {
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
      </CardContent>
    </Card>
  );
};

export default OriginalImageDisplayCard;