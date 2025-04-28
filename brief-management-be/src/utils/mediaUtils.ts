import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from 'graphql-upload-minimal';
import { Readable } from 'stream';
import AsyncLock from 'async-lock';
import retry from 'async-retry';
import { FileValidationOptions, DEFAULT_FILE_OPTIONS, FileValidationError } from './fileValidation';

const lock = new AsyncLock();

export interface FileUploadResponse {
  url: string;
  key: string;
  file_type: string;
  name: string;
  size: number;
  s3_key: string;
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function validateFile(
  file: FileUpload,
  options: FileValidationOptions = DEFAULT_FILE_OPTIONS
): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
  try {
    // Wait for the file promise to resolve first
    const resolvedFile = await file;
    const { filename, mimetype } = resolvedFile;

    // Validate filename length first (before accessing stream)
    if (filename.length > options.maxFilenameLength) {
      throw new FileValidationError(
        `Filename too long. Maximum length allowed is ${options.maxFilenameLength} characters`
      );
    }

    // Create stream only once and store the buffer
    const stream = resolvedFile.createReadStream();
    const buffer = await streamToBuffer(stream);

    // Validate file size after we have the buffer
    if (buffer.length > options.maxSizeInMB * 1024 * 1024) {
      throw new FileValidationError(`File size exceeds maximum limit of ${options.maxSizeInMB}MB`);
    }

    return { buffer, filename, mimetype };
  } catch (error) {
    if (error instanceof FileValidationError) {
      throw error;
    }
    throw new Error(`File validation failed: ${error.message}`);
  }
}

async function ensureBucketExists(bucket: string): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'video/*'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`);
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to ensure bucket exists: ${error.message}`);
  }
}

export const uploadFileToSupabase = async (
  file: FileUpload,
  bucket: string = 'media',
  options: FileValidationOptions = DEFAULT_FILE_OPTIONS
): Promise<FileUploadResponse> => {
  // Use lock for concurrent upload handling
  return lock.acquire('upload', async () => {
    try {
      // Validate file first, outside the retry loop
      const { buffer, filename, mimetype } = await validateFile(file, options);

      // Ensure bucket exists
      await ensureBucketExists(bucket);

      // Only retry the actual upload part
      return await retry<FileUploadResponse>(
        async () => {
          try {
            // Generate unique filename
            const fileExt = filename.split('.').pop();
            const uniqueFilename = `${uuidv4()}.${fileExt}`;

            // Upload to Supabase
            const { error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(uniqueFilename, buffer, {
                contentType: mimetype,
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              // Determine if error is retryable
              if (uploadError.message.includes('network') || uploadError.message.includes('timeout')) {
                throw uploadError; // Will trigger retry
              }
              throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from(bucket)
              .getPublicUrl(uniqueFilename);

            return {
              url: publicUrl,
              s3_key: uniqueFilename,
              key: uniqueFilename,
              name: filename,
              file_type: mimetype,
              size: buffer.length
            };
          } catch (error) {
            throw error;
          }
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000,
          onRetry: (error: unknown, attempt: number) => {
            console.error(`Upload attempt ${attempt} failed:`, error);
          }
        }
      );
    } catch (error) {
      if (error instanceof FileValidationError) {
        throw error;
      }
      throw error;
    }
  });
};

export const deleteFileFromSupabase = async (
  key: string,
  bucket: string = 'media'
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([key]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}; 