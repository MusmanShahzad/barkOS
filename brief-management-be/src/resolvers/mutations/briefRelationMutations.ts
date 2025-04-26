import { BriefAsset, BriefComment, BriefTag } from '../../types';
import { supabase } from '../../supabase';

export const briefRelationMutations = {
  // BriefAsset mutations
  createBriefAsset: async (_: any, { input }: { input: Omit<BriefAsset, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('brief_assests')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteBriefAsset: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('brief_assests')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // BriefComment mutations
  createBriefComment: async (_: any, { input }: { input: Omit<BriefComment, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('brief_comments')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteBriefComment: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('brief_comments')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // BriefTag mutations
  createBriefTag: async (_: any, { input }: { input: Omit<BriefTag, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('brief_tags')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteBriefTag: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('brief_tags')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 