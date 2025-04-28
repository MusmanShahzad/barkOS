"use client"

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Cloud, File as FileIcon, Upload } from 'lucide-react';

export interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  disabled = false,
  accept,
  maxSize,
  className
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      try {
        await onUpload(acceptedFiles[0]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }, [onUpload]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragAccept,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    disabled,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple: false,
    useFsAccessApi: false // Disable File System Access API to ensure consistent behavior
  });

  // Format file size limit for display
  const formatMaxSize = () => {
    if (!maxSize) return '';
    const mb = maxSize / (1024 * 1024);
    return `Max size: ${mb}MB`;
  };

  // Format accepted file types for display
  const formatAcceptedTypes = () => {
    if (!accept) return 'All files accepted';
    return `Accepted types: ${accept.replace('/*', '')}`;
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors',
        isDragActive && !isDragReject && 'border-primary bg-primary/5',
        isDragReject && 'border-destructive bg-destructive/5',
        isDragAccept && 'border-success bg-success/5',
        !isDragActive && 'border-muted-foreground/25',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-xs text-muted-foreground">
        {isDragActive ? (
          isDragReject ? (
            <Cloud className="mb-2 h-10 w-10 text-destructive" />
          ) : (
            <Upload className="mb-2 h-10 w-10 text-primary animate-bounce" />
          )
        ) : (
          <FileIcon className="mb-2 h-10 w-10" />
        )}
        
        <p className="mb-2 text-base font-medium">
          {isDragActive
            ? isDragReject
              ? 'File type or size not accepted'
              : 'Drop to upload'
            : 'Drag & drop file here'}
        </p>
        
        <p>or click to select</p>
        
        <div className="mt-2 text-center">
          <p>{formatAcceptedTypes()}</p>
          {maxSize && <p>{formatMaxSize()}</p>}
        </div>

        {fileRejections.length > 0 && (
          <div className="mt-2 text-destructive text-center">
            {fileRejections.map(({ errors }) =>
              errors.map((error) => (
                <p key={error.code}>{error.message}</p>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 