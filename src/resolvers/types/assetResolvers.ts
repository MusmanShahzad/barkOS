import { Asset } from '../../types';
import { supabase } from '../../supabase';

export const AssetResolvers = {
  media: async (parent: Asset) => {
    if (!parent.media_id) return null;
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', parent.media_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  thumbnail: async (parent: Asset) => {
    if (!parent.thumbnail_media_id) return null;
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', parent.thumbnail_media_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  comments: async (parent: Asset) => {
    const { data, error } = await supabase
      .from('asset_comments')
      .select('comment_id')
      .eq('asset_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    // If no comments, return empty array
    if (!data || data.length === 0) return [];
    
    // Get the actual comments
    const commentIds = data.map(ac => ac.comment_id).filter(Boolean);
    
    if (commentIds.length === 0) return [];
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .in('id', commentIds);
    
    if (commentsError) throw new Error(commentsError.message);
    return comments || [];
  },
  tags: async (parent: Asset) => {
    const { data, error } = await supabase
      .from('asset_tags')
      .select('tag_id')
      .eq('asset_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    // If no tags, return empty array
    if (!data || data.length === 0) return [];
    
    // Get the actual tags
    const tagIds = data.map(at => at.tag_id).filter(Boolean);
    
    if (tagIds.length === 0) return [];
    
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds);
    
    if (tagsError) throw new Error(tagsError.message);
    return tags || [];
  },
}; 