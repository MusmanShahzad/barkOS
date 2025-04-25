import { Brief, BriefStatus } from '../../types';
import { supabase } from '../../supabase';

export const briefMutations = {
  createBrief: async (_: any, { input }: { input: Omit<Brief, 'id' | 'created_at'> }) => {
    // Ensure status is a valid enum value if provided
    if (input.status && !Object.values(BriefStatus).includes(input.status)) {
      throw new Error(`Invalid status value. Must be one of: ${Object.values(BriefStatus).join(', ')}`);
    }
    
    const { data, error } = await supabase
      .from('briefs')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateBrief: async (_: any, { id, input }: { id: number, input: Partial<Omit<Brief, 'id' | 'created_at'>> }) => {
    // Ensure status is a valid enum value if provided
    if (input.status && !Object.values(BriefStatus).includes(input.status)) {
      throw new Error(`Invalid status value. Must be one of: ${Object.values(BriefStatus).join(', ')}`);
    }
    
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