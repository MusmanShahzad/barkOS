import { Asset } from '../../types';
import { supabase } from '../../supabase';

export const assetMutations = {
  createAsset: async (_: any, { input }: { input: Omit<Asset, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('assets')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateAsset: async (_: any, { id, input }: { id: number, input: Partial<Omit<Asset, 'id' | 'created_at'>> }) => {
    const { data, error } = await supabase
      .from('assets')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteAsset: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 