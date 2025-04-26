import { supabase } from '../../supabase';

export const assetQueries = {
  getAsset: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getAssets: async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 