import { Comment, Tag, Media } from '../../types';
import { supabase } from '../../supabase';

export const otherMutations = {
  // Comment mutations
  createComment: async (_: any, { input }: { input: Omit<Comment, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateComment: async (_: any, { id, input }: { id: number, input: Partial<Omit<Comment, 'id' | 'created_at'>> }) => {
    const { data, error } = await supabase
      .from('comments')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteComment: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // Tag mutations
  createTag: async (_: any, { input }: { input: Omit<Tag, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('tags')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateTag: async (_: any, { id, input }: { id: number, input: Partial<Omit<Tag, 'id' | 'created_at'>> }) => {
    const { data, error } = await supabase
      .from('tags')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteTag: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // Media mutations
  createMedia: async (_: any, { input }: { input: Omit<Media, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('media')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  updateMedia: async (_: any, { id, input }: { id: number, input: Partial<Omit<Media, 'id' | 'created_at'>> }) => {
    const { data, error } = await supabase
      .from('media')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteMedia: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 