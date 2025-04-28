import { Product } from '../../types';
import { supabase } from '../../supabase';

export const productMutations = {
  createProduct: async (_: any, { input }: { input: Omit<Product, 'id' | 'created_at'> }) => {
    try {

      if (!input || !input.name) {
        console.error('Invalid input:', input);
        throw new Error('Product name is required');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([input])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error in createProduct:', {
          error,
          message: error.message,
          code: error.code,
          details: error.details
        });
        throw new Error(`Failed to create product: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from supabase');
        throw new Error('Failed to create product: No data returned');
      }

      console.log('Product created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProduct mutation:', {
        error,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
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