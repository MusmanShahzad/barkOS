import { Product } from '../../types';
import { supabase } from '../../supabase';

export const productMutations = {
  createProduct: async (_: any, { input }: { input: Omit<Product, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('products')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateProduct: async (_: any, { id, input }: { id: number, input: Partial<Omit<Product, 'id' | 'created_at'>> }) => {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteProduct: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 