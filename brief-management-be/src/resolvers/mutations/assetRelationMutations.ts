import { AssetComment, AssetTag } from '../../types';
import { supabase } from '../../supabase';

export const assetRelationMutations = {
  // AssetComment mutations
  createAssetComment: async (_: any, { input }: { input: Omit<AssetComment, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('asset_comments')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteAssetComment: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('asset_comments')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // Add a new comment directly to an asset
  addCommentToAsset: async (_: any, { 
    assetId, 
    commentInput 
  }: { 
    assetId: number, 
    commentInput: { 
      text: string, 
      user_id: number,
      mentioned_user_ids?: number[] 
    } 
  }) => {
    // Start a transaction
    // 1. First create the comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([{
        comment: commentInput.text, // Note: the column name in the database is 'comment', not 'text'
        user_id: commentInput.user_id
      }])
      .select()
      .single();
    
    if (commentError) throw new Error(commentError.message);
    
    // 2. Now link the comment to the asset
    const { error: linkError } = await supabase
      .from('asset_comments')
      .insert([{
        asset_id: assetId,
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
      text: comment.comment // Map the 'comment' field to 'text' for GraphQL schema compatibility
    };
  },
  
  // AssetTag mutations
  createAssetTag: async (_: any, { input }: { input: Omit<AssetTag, 'id' | 'created_at'> }) => {
    const { data, error } = await supabase
      .from('asset_tags')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  deleteAssetTag: async (_: any, { id }: { id: number }) => {
    const { error } = await supabase
      .from('asset_tags')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },
}; 