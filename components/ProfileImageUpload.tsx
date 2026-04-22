"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileImageUploadProps {
  initialImage?: string;
  initials: string;
}

export function ProfileImageUpload({ initialImage, initials }: ProfileImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setImage(data.imageUrl);
      
      // Refresh the page to reflect the new image across the site
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to upload profile picture");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative mx-auto flex h-24 w-24 sm:h-32 sm:w-32 group items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground overflow-hidden shadow-sm border-4 border-white dark:border-gray-800">
      {image ? (
        <Image 
          src={image} 
          alt="Profile" 
          width={128} 
          height={128} 
          className="h-full w-full object-cover" 
        />
      ) : (
        <span className="text-3xl sm:text-5xl">{initials}</span>
      )}
      
      {/* Upload Overlay */}
      <label 
        className={`absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity ${isLoading ? 'opacity-100' : ''}`}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={isLoading}
        />
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="flex flex-col items-center">
            <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-[10px] sm:text-xs font-medium mt-1">Change</span>
          </div>
        )}
      </label>
    </div>
  );
}
