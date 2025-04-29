import { BriefAsset, BriefComment, BriefTag } from '../../types';
import { supabase } from '../../supabase';

export const briefRelationMutations = {
  // BriefAsset mutations
  createBriefAsset: async (_: any, { input }: { input: Omit<BriefAsset, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('brief_assets')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteBriefAsset: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('brief_assets')
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

  // Add a new comment directly to a brief
  addCommentToBrief: async (_: any, { 
    briefId, 
    commentInput 
  }: { 
    briefId: number, 
    commentInput: { 
      text: string, 
      user_id: number,
      mentioned_user_ids?: number[] 
    } 
  }) => {
    // Validate input
    if (!commentInput.text || commentInput.text.trim() === '') {
      throw new Error('Comment text cannot be empty');
    }
    
    // Start a transaction
    // 1. First create the comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([{
        comment: commentInput.text.trim(), // Ensure text is trimmed and stored in the 'comment' column
        user_id: commentInput.user_id
      }])
      .select()
      .single();
    
    if (commentError) throw new Error(commentError.message);
    
    // 2. Now link the comment to the brief
    const { error: linkError } = await supabase
      .from('brief_comments')
      .insert([{
        brief_id: briefId,
        comment_id: comment.id
      }]);
    
    if (linkError) {
      // If there was an error linking, try to delete the created comment to avoid orphans
      await supabase.from('comments').delete().eq('id', comment.id);
      throw new Error(linkError.message);
    }
    
    // 3. Add user mentions if provided
    if (commentInput.mentioned_user_ids && commentInput.mentioned_user_ids.length > 0) {
      const mentionsToInsert = commentInput.mentioned_user_ids.map(userId => ({
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
    
    // 4. Return the comment with its text field properly mapped
    return {
      ...comment,
      text: comment.comment || '' // Map the 'comment' field to 'text' with fallback
    };
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