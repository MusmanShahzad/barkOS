import { supabase } from '../../supabase';
import { uploadFileToSupabase, deleteFileFromSupabase } from '../../utils/mediaUtils';
import { FileUpload } from 'graphql-upload-minimal';
import { FileValidationError } from '../../utils/fileValidation';

interface MediaInput {
  url?: string;
  type?: string;
  title?: string;
  description?: string;
}

export const mediaMutations = {
  uploadMedia: async (_: any, { file }: { file: FileUpload }) => {
    let uploadResponse = null;

    try {
      // Start a Supabase transaction
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      // Upload file first
      uploadResponse = await uploadFileToSupabase(file);

      console.log('uploadResponse', uploadResponse);
      // Insert media record within transaction
      const { data: media, error: dbError } = await supabase
        .from('media')
        .insert({
          url: uploadResponse.url,
          file_type: uploadResponse.file_type,
          name: uploadResponse.name,
          s3_key: uploadResponse.s3_key,
          updated_at: new Date().toISOString(),
          size: uploadResponse.size,
          user_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        // Rollback by deleting uploaded file
        await deleteFileFromSupabase(uploadResponse.key);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return media;
    } catch (error) {
      // Cleanup on any error
      if (uploadResponse?.key) {
        try {
          await deleteFileFromSupabase(uploadResponse.key);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

      // Handle specific error types
      if (error instanceof FileValidationError) {
        throw new Error(`File validation failed: ${error.message}`);
      }

      throw new Error(`Failed to upload media: ${error.message}`);
    }
  },

  deleteMedia: async (_: any, { id }: { id: string }) => {
    try {
      // Get media record first
      const { data: media, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Error fetching media: ${fetchError.message}`);
      }

      if (!media) {
        throw new Error('Media not found');
      }

      // Delete file from storage first
      await deleteFileFromSupabase(media.key);

      // Then delete database record
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Error deleting media record: ${deleteError.message}`);
      }

      return media;
    } catch (error: any) {
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  },

  createMedia: async (_: any, { input }: { input: MediaInput }) => {
    try {
      const { data, error } = await supabase
        .from('media')
        .insert(input)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating media: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      throw new Error(`Failed to create media: ${error.message}`);
    }
  },

  updateMedia: async (_: any, { id, input }: { id: string; input: MediaInput }) => {
    try {
      const { data, error } = await supabase
        .from('media')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating media: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      throw new Error(`Failed to update media: ${error.message}`);
    }
  }
}; 