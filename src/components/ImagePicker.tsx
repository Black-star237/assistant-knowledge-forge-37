
import React, { useState, ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';

interface ImagePickerProps {
  currentImageUrl?: string | null;
  onImageSelect: (file: File) => void;
  onImageUpload: (file: File) => Promise<string | null>; // Returns new image URL or null on error
  isUploading: boolean;
  label?: string;
  fallbackText?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImageUrl,
  onImageSelect,
  onImageUpload,
  isUploading,
  label = "Photo de profil",
  fallbackText = "P",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file); // Notify parent about selection
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Optionally, trigger upload immediately
      // const newUrl = await onImageUpload(file);
      // if (newUrl) setPreviewUrl(newUrl); // Update preview with final URL if needed
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={previewUrl || currentImageUrl || undefined} alt="Avatar" />
          <AvatarFallback>{fallbackText.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {isUploading ? 'Chargement...' : 'Changer'}
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default ImagePicker;

