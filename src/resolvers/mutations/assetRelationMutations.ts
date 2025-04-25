import { AssetComment, AssetTag } from '../../types';
import { supabase } from '../../supabase';

export const assetRelationMutations = {
  // AssetComment mutations
  createAssetComment: async (_: any, { input }: { input: Omit<AssetComment, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('asset_comments')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteAssetComment: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('asset_comments')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // AssetTag mutations
  createAssetTag: async (_: any, { input }: { input: Omit<AssetTag, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('asset_tags')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteAssetTag: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('asset_tags')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 