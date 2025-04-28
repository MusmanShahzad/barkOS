import { supabase } from '../../supabase';

export const tagQueries = {
  getTag: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getTags: async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  }
}; 