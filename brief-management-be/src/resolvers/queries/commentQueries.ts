import { supabase } from '../../supabase';

export const commentQueries = {
  getComment: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getComments: async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  }
}; 