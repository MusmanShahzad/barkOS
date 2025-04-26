import { supabase } from '../../supabase';

export const assetCommentQueries = {
  getAssetComment: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('asset_comments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getAssetComments: async () => {
    const { data, error } = await supabase
      .from('asset_comments')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  getAssetCommentsByAssetId: async (_: any, { assetId }: { assetId: number }) => {
    const { data, error } = await supabase
      .from('asset_comments')
      .select('*')
      .eq('asset_id', assetId);
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 