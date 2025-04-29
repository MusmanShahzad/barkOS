import { Comment, Tag, Media } from '../../types';
import { supabase } from '../../supabase';

export const otherMutations = {
  // Comment mutations
  createComment: async (_: any, { input }: { input: Omit<Comment, 'id' | 'created_at'> }) => {
    try {
      // 1. First create the comment
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert([{
          comment: input.text, // Note: the column name in the database is 'comment', not 'text'
          user_id: input.user_id
        }])
        .select()
        .single();
      
      if (commentError) throw new Error(commentError.message);
      
      // 2. Add user mentions if provided
      if (input.mentioned_user_ids && input.mentioned_user_ids.length > 0) {
        const mentionsToInsert = input.mentioned_user_ids.map((userId: number) => ({
          comment_id: comment.id,
          user_id: userId
        }));
        
        const { error: mentionError } = await supabase
          .from('comment_mentions')
          .insert(mentionsToInsert);
        
        if (mentionError) {
          console.error('Error adding mentions:', mentionError);
          // We won't fail the whole operation if adding mentions fails
        }
      }
      
      // 3. Return the comment with its text field properly mapped
      return {
        ...comment,
        text: comment.comment // Map the 'comment' field to 'text' for GraphQL schema compatibility
      };
    } catch (error) {
      console.error('Error in createComment:', error);
      throw error;
    }
  },
  
  updateComment: async (_: any, { id, input }: { id: number, input: Partial<Omit<Comment, 'id' | 'created_at'>> }) => {
    try {
      // Update the comment itself
      const updateData: Record<string, any> = input.text ? { comment: input.text } : {};
      if (input.user_id) updateData.user_id = input.user_id;
      
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (commentError) throw new Error(commentError.message);
      
      // If we have mentioned users to update
      if (input.mentioned_user_ids) {
        // First delete existing mentions
        const { error: deleteError } = await supabase
          .from('comment_mentions')
          .delete()
          .eq('comment_id', id);
        
        if (deleteError) {
          console.error('Error removing existing mentions:', deleteError);
        }
        
        // Then add the new mentions
        if (input.mentioned_user_ids.length > 0) {
          const mentionsToInsert = input.mentioned_user_ids.map((userId: number) => ({
            comment_id: id,
            user_id: userId
          }));
          
          const { error: mentionError } = await supabase
            .from('comment_mentions')
            .insert(mentionsToInsert);
          
          if (mentionError) {
            console.error('Error adding new mentions:', mentionError);
          }
        }
      }
      
      // Return the updated comment
      return {
        ...comment,
        text: comment.comment // Map 'comment' to 'text' for GraphQL compatibility
      };
    } catch (error) {
      console.error('Error in updateComment:', error);
      throw error;
    }
  },
  
  deleteComment: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // Comment mention mutations
  addMentionToComment: async (_: any, { input }: { input: { comment_id: number, user_id: number } }) => {
    const { data, error } = await supabase
      .from('comment_mentions')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  removeMentionFromComment: async (_: any, { commentId, userId }: { commentId: number, userId: number }) => {
    const { error } = await supabase
      .from('comment_mentions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    
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