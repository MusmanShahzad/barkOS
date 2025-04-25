import { AssetComment } from '../../types';
import { supabase } from '../../supabase';

export const AssetCommentResolvers = {
  asset: async (parent: AssetComment) => {
    if (!parent.asset_id) return null;
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', parent.asset_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  comment: async (parent: AssetComment) => {
    if (!parent.comment_id) return null;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', parent.comment_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 