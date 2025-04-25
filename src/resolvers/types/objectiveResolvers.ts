import { Objective } from '../../types';
import { supabase } from '../../supabase';

export const ObjectiveResolvers = {
  briefs: async (parent: Objective) => {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('objective_id', parent.id);
    
    if (error) throw new Error(error.message);
    return data || [];
  },
}; 