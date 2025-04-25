import { BriefTag } from '../../types';
import { supabase } from '../../supabase';

export const BriefTagResolvers = {
  brief: async (parent: BriefTag) => {
    if (!parent.brief_id) return null;
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', parent.brief_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  tag: async (parent: BriefTag) => {
    if (!parent.tag_id) return null;
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', parent.tag_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 