import { supabase } from '../../supabase';

export const objectiveQueries = {
  getObjective: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getObjectives: async () => {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 