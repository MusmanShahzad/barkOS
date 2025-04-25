import { Brief } from '../../types';
import { supabase } from '../../supabase';

export const briefMutations = {
  createBrief: async (_: any, { input }: { input: Omit<Brief, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('briefs')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateBrief: async (_: any, { id, input }: { id: number, input: Partial<Omit<Brief, 'id' | 'created_at'>> }) => {
    const { data, error } = await supabase
      .from('briefs')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteBrief: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('briefs')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 