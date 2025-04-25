import { supabase } from '../../supabase';

export const productQueries = {
  getProduct: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getProducts: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 