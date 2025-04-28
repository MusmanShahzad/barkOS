import { Product } from '../../types';
import { supabase } from '../../supabase';

export const ProductResolvers = {
  briefs: async (parent: Product) => {
    try {
      if (!parent.id) {
        console.error('Product ID is missing');
        return [];
      }

      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('product_id', parent.id);
      
      if (error) {
        console.error('Supabase error getting briefs for product:', {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          details: error.details,
          hint: error.hint,
          productId: parent.id
        });
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error in product.briefs resolver:', {
        error,
        message: error.message,
        stack: error.stack,
        productId: parent.id
      });
      throw error;
    }
  },
}; 