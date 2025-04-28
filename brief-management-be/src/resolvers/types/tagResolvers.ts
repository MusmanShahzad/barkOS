import { Tag } from '../../types';
import { supabase } from '../../supabase';

export const TagResolvers = {
  // Get all assets that have this tag
  assets: async (parent: Tag) => {
    const { data, error } = await supabase
      .from('asset_tags')
      .select('asset_id')
      .eq('tag_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const assetIds = data.map(at => at.asset_id).filter(Boolean);
    
    if (assetIds.length === 0) return [];
    
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', assetIds);
    
    if (assetsError) throw new Error(assetsError.message);
    return assets || [];
  },

  // Get all briefs that have this tag
  briefs: async (parent: Tag) => {
    const { data, error } = await supabase
      .from('brief_tags')
      .select('brief_id')
      .eq('tag_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const briefIds = data.map(bt => bt.brief_id).filter(Boolean);
    
    if (briefIds.length === 0) return [];
    
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('*')
      .in('id', briefIds);
    
    if (briefsError) throw new Error(briefsError.message);
    return briefs || [];
  }
}; 