import { supabase } from '../../supabase';
import { Asset } from '../../types';

export const AssetResolvers = {
  briefs: async (parent: Asset) => {
    const { data, error } = await supabase
      .from('brief_assets')
      .select('brief_id')
      .eq('asset_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const briefIds = data.map(ba => ba.brief_id).filter(Boolean);
    
    if (briefIds.length === 0) return [];
    
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('*')
      .in('id', briefIds);
    
    if (briefsError) throw new Error(briefsError.message);
    return briefs || [];
  },

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
    
    if (!data || data.length === 0) return [];
    
    const commentIds = data.map(ac => ac.comment_id).filter(Boolean);
    
    if (commentIds.length === 0) return [];
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .in('id', commentIds)
      .order('created_at', { ascending: false });
    
    if (commentsError) throw new Error(commentsError.message);
    return comments || [];
  },

  tags: async (parent: Asset) => {
    const { data, error } = await supabase
      .from('asset_tags')
      .select('tag_id')
      .eq('asset_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const tagIds = data.map(at => at.tag_id).filter(Boolean);
    
    if (tagIds.length === 0) return [];
    
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds);
    
    if (tagsError) throw new Error(tagsError.message);
    return tags || [];
  }
}; 