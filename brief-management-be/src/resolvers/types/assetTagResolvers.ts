import { AssetTag } from '../../types';
import { supabase } from '../../supabase';

export const AssetTagResolvers = {
  tag: async (parent: AssetTag) => {
    if (!parent.tag_id) return null;
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', parent.tag_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  asset: async (parent: AssetTag) => {
    if (!parent.asset_id) return null;
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', parent.asset_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 