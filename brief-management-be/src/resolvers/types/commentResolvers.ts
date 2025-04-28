import { Comment } from '../../types';
import { supabase } from '../../supabase';

export const CommentResolvers = {
  // Get the user who made the comment
  user: async (parent: Comment) => {
    if (!parent.user_id) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', parent.user_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get all assets this comment is attached to
  assets: async (parent: Comment) => {
    const { data, error } = await supabase
      .from('asset_comments')
      .select('asset_id')
      .eq('comment_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const assetIds = data.map(ac => ac.asset_id).filter(Boolean);
    
    if (assetIds.length === 0) return [];
    
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', assetIds);
    
    if (assetsError) throw new Error(assetsError.message);
    return assets || [];
  },

  // Get all briefs this comment is attached to
  briefs: async (parent: Comment) => {
    const { data, error } = await supabase
      .from('brief_comments')
      .select('brief_id')
      .eq('comment_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const briefIds = data.map(bc => bc.brief_id).filter(Boolean);
    
    if (briefIds.length === 0) return [];
    
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('*')
      .in('id', briefIds);
    
    if (briefsError) throw new Error(briefsError.message);
    return briefs || [];
  }
}; 