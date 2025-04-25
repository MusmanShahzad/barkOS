import { supabase } from '../../supabase';

export const briefQueries = {
  getBrief: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getBriefs: async () => {
    const { data, error } = await supabase
      .from('briefs')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 