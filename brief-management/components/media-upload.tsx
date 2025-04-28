"use client"

import { useState, useCallback } from 'react';
import { FileUpload } from './ui/file-upload';
import { useUploadMediaMutation } from '../src/graphql/generated/graphql';
import { toast } from 'sonner';
import { generateVideoThumbnails } from '@rajesh896/video-thumbnails-generator';

export interface MediaUploadProps {
  onUploadComplete: (media: { 
    id: number; 
    url: string;
    file_type: string;
    thumbnail_id?: number;
  }) => void;
  onUploadError: (error: Error) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  onUploadProgress,
  disabled = false,
  accept,
  maxSize,
  className
}) => {
  const [uploadMedia] = useUploadMediaMutation();
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);

  const calculateProgress = useCallback((startTime: number): number => {
    const elapsed = Date.now() - startTime;
    // Simulate progress based on typical upload times
    // Fast at start, slower in middle, fast at end
    const progress = Math.min(90, (elapsed / 3000) * 100); // Max 90% until complete
    return Math.round(progress);
  }, []);

  const generateAndUploadThumbnail = async (file: File) => {
    try {
      // Generate thumbnail for video
      const thumbnails = await generateVideoThumbnails(file, 1, 'image/jpeg');
      if (!thumbnails || thumbnails.length === 0) {
        return null;
      }

      // Convert base64 to File object
      const base64Data = thumbnails[0];
      const byteString = atob(base64Data.split(',')[1]);
      const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const thumbnailFile = new File([ab], 'thumbnail.jpg', { type: mimeString });

      // Upload thumbnail using GraphQL mutation
      const { data } = await uploadMedia({
        variables: { 
          file: thumbnailFile 
        },
        context: {
          hasUpload: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Apollo-Require-Preflight': 'true',
            'x-apollo-operation-name': 'UploadMedia'
          }
        }
      });

      return data?.uploadMedia?.id || null;
    } catch (error) {
      console.error('Error generating/uploading thumbnail:', error);
      return null;
    }
  };

  const handleUpload = async (file: File) => {
    try {
      // Validate file size before upload
      if (maxSize && file.size > maxSize) {
        throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
      }

      onUploadStart?.();
      setUploadStartTime(Date.now());

      // Start progress updates
      const progressTimer = setInterval(() => {
        if (uploadStartTime) {
          const progress = calculateProgress(uploadStartTime);
          onUploadProgress?.(progress);
        }
      }, 100);

      // Execute the upload mutation
      const { data, errors } = await uploadMedia({
        variables: { 
          file
        },
        context: {
          hasUpload: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Apollo-Require-Preflight': 'true',
            'x-apollo-operation-name': 'UploadMedia'
          }
        }
      });

      clearInterval(progressTimer);

      if (errors?.length) {
        throw new Error(errors[0].message);
      }

      if (!data?.uploadMedia) {
        throw new Error('Upload failed - no response from server');
      }

      // If it's a video file, generate and upload thumbnail
      let thumbnailId = null;
      if (file.type.startsWith('video/')) {
        thumbnailId = await generateAndUploadThumbnail(file);
      }

      // Upload complete - set progress to 100%
      onUploadProgress?.(100);
      onUploadComplete({
        id: data.uploadMedia.id,
        url: data.uploadMedia.url,
        file_type: data.uploadMedia.file_type,
        ...(thumbnailId && { thumbnail_id: thumbnailId })
      });

      toast.success('File uploaded successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred';
      onUploadError(new Error(errorMessage));
      toast.error(`Upload failed: ${errorMessage}`);
      onUploadProgress?.(0); // Reset progress on error
    } finally {
      setUploadStartTime(null);
    }
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      disabled={disabled}
      accept={accept}
      maxSize={maxSize}
      className={className}
    />
  );
}; 