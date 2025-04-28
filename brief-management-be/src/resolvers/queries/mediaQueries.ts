import { supabase } from '../../supabase';

export const mediaQueries = {
  getMedia: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getMedias: async () => {
    const { data, error } = await supabase
      .from('media')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  }
}; 