import { supabase } from '../../supabase';

export const productQueries = {
  getProduct: async (_: any, { id }: { id: number }) => {
    try {
      console.log('Getting product with ID:', id);

      if (!id) {
        throw new Error('Product ID is required');
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error getting product:', {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data) {
        console.error(`Product with ID ${id} not found`);
        throw new Error(`Product with ID ${id} not found`);
      }

      console.log('Product retrieved successfully:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error in getProduct:', {
        error,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  getProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error getting products:', {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} products`);
      return data || [];
    } catch (error) {
      console.error('Error in getProducts:', {
        error,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
}; 