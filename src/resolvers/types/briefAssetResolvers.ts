import { BriefAsset } from '../../types';
import { supabase } from '../../supabase';

export const BriefAssetResolvers = {
  brief: async (parent: BriefAsset) => {
    if (!parent.brief_id) return null;
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', parent.brief_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  asset: async (parent: BriefAsset) => {
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