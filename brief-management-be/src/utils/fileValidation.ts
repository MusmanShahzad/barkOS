export interface FileValidationOptions {
  maxSizeInMB: number;
  allowedMimeTypes: string[];
  maxFilenameLength: number;
}

export const DEFAULT_FILE_OPTIONS: FileValidationOptions = {
  maxSizeInMB: 50, // 50MB max file size
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/quicktime'
  ],
  maxFilenameLength: 255
};

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
} 