import { supabase } from '../../supabase';

export const commentQueries = {
  getComment: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    
    // Map the 'comment' field to 'text' for GraphQL compatibility
    if (data) {
      return {
        ...data,
        text: data.comment
      };
    }
    return data;
  },
  
  getComments: async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    // Map each comment's 'comment' field to 'text' for GraphQL compatibility
    if (data) {
      return data.map(comment => ({
        ...comment,
        text: comment.comment
      }));
    }
    
    return data;
  },
  
  // New query to get mentions for a specific comment
  getCommentMentions: async (_: any, { commentId }: { commentId: number }) => {
    const { data, error } = await supabase
      .from('comment_mentions')
      .select('*')
      .eq('comment_id', commentId);
    
    if (error) throw new Error(error.message);
    return data;
  }
}; 