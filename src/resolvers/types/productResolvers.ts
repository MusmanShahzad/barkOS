import { Product } from '../../types';
import { supabase } from '../../supabase';

export const ProductResolvers = {
  briefs: async (parent: Product) => {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('product_id', parent.id);
    
    if (error) throw new Error(error.message);
    return data || [];
  },
}; 