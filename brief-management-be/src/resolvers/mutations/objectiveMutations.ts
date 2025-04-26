import { Objective } from '../../types';
import { supabase } from '../../supabase';

export const objectiveMutations = {
  createObjective: async (_: any, { input }: { input: Omit<Objective, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('objectives')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateObjective: async (_: any, { id, input }: { id: number, input: Partial<Omit<Objective, 'id' | 'created_at'>> }) => {
    const { data, error } = await supabase
      .from('objectives')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteObjective: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 