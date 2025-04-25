import { supabase } from '../../supabase';

export const assetTagQueries = {
  getAssetTag: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('asset_tags')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getAssetTags: async () => {
    const { data, error } = await supabase
      .from('asset_tags')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  getAssetTagsByAssetId: async (_: any, { assetId }: { assetId: number }) => {
    const { data, error } = await supabase
      .from('asset_tags')
      .select('*')
      .eq('asset_id', assetId);
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 