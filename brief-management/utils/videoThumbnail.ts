/**
 * Generates a thumbnail from a video file using HTML5 Canvas
 * @param videoFile The video file to generate a thumbnail from
 * @param timeInSeconds The time in seconds to capture the thumbnail (default: 1)
 * @returns A Promise that resolves to a Blob of the thumbnail in JPEG format
 */
export async function generateVideoThumbnail(
  videoFile: File,
  timeInSeconds: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create video and canvas elements
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set up video element
    video.autoplay = false;
    video.muted = true;
    video.src = URL.createObjectURL(videoFile);

    // Handle video metadata loaded
    video.onloadedmetadata = () => {
      // Set canvas size (640px width, maintaining aspect ratio)
      const aspectRatio = video.videoHeight / video.videoWidth;
      canvas.width = 640;
      canvas.height = Math.round(640 * aspectRatio);

      // Seek to specified time
      video.currentTime = timeInSeconds;
    };

    // Handle video seeked event
    video.onseeked = () => {
      try {
        // Draw video frame to canvas
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Clean up
              URL.revokeObjectURL(video.src);
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail blob'));
            }
          },
          'image/jpeg',
          0.85 // JPEG quality
        );
      } catch (error) {
        reject(error);
      }
    };

    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Error loading video'));
    };
  });
}

/**
 * Creates a File object from a Blob
 * @param blob The blob to convert
 * @param filename The desired filename
 * @returns A File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
} 