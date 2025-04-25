import { BriefComment } from '../../types';
import { supabase } from '../../supabase';

export const BriefCommentResolvers = {
  brief: async (parent: BriefComment) => {
    if (!parent.brief_id) return null;
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', parent.brief_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  comment: async (parent: BriefComment) => {
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