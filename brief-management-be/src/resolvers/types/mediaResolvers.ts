import { Media } from '../../types';
import { supabase } from '../../supabase';

export const MediaResolvers = {
  // Get all assets that use this media as their main media
  assets: async (parent: Media) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('media_id', parent.id);
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get all assets that use this media as their thumbnail
  thumbnailFor: async (parent: Media) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('thumbnail_media_id', parent.id);
    
    if (error) throw new Error(error.message);
    return data || [];
  }
}; 