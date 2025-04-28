import { supabase } from '../../supabase';
import { User } from '../../types';

export const UserResolvers = {
  briefs: async (parent: User) => {
    const { data, error } = await supabase
      .from('briefs_users')
      .select('brief_id')
      .eq('user_id', parent.id);

    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const briefIds = data.map(bu => bu.brief_id).filter(Boolean);
    
    if (briefIds.length === 0) return [];
    
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('*')
      .in('id', briefIds);
    
    if (briefsError) throw new Error(briefsError.message);
    return briefs || [];
  }
}; 