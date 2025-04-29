import { Comment } from '../../types';
import { supabase } from '../../supabase';

export const CommentResolvers = {
  // Field resolver to properly map the database 'comment' column to GraphQL 'text' field
  text: (parent: any) => {
    // If the parent already has a text field, return that
    if (parent.text !== undefined) return parent.text;
    
    // Otherwise, map from the database 'comment' column with fallback to empty string
    return parent.comment || '';
  },

  // Resolver for getting the user who made the comment
  user: async (parent: Comment) => {
    if (!parent.user_id) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', parent.user_id)
      .single();
    
    if (error) {
      console.error('Error getting comment user:', error);
      return null;
    }
    
    return data;
  },

  // Resolver for getting mentioned users
  mentioned_users: async (parent: Comment) => {
    const { data, error } = await supabase
      .from('comment_mentions')
      .select('user_id')
      .eq('comment_id', parent.id);
    
    if (error || !data || data.length === 0) return [];
    
    const userIds = data.map(mention => mention.user_id);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    
    if (usersError) {
      console.error('Error getting mentioned users:', usersError);
      return [];
    }
    
    return users || [];
  },

  // Resolver for getting assets related to this comment
  assets: async (parent: Comment) => {
    const { data, error } = await supabase
      .from('asset_comments')
      .select('asset_id')
      .eq('comment_id', parent.id);
    
    if (error || !data || data.length === 0) return [];
    
    const assetIds = data.map(ac => ac.asset_id).filter(Boolean);
    
    if (assetIds.length === 0) return [];
    
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', assetIds);
    
    if (assetsError) {
      console.error('Error getting comment assets:', assetsError);
      return [];
    }
    
    return assets || [];
  },

  // Resolver for getting briefs related to this comment
  briefs: async (parent: Comment) => {
    const { data, error } = await supabase
      .from('brief_comments')
      .select('brief_id')
      .eq('comment_id', parent.id);
    
    if (error || !data || data.length === 0) return [];
    
    const briefIds = data.map(bc => bc.brief_id).filter(Boolean);
    
    if (briefIds.length === 0) return [];
    
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('*')
      .in('id', briefIds);
    
    if (briefsError) {
      console.error('Error getting comment briefs:', briefsError);
      return [];
    }
    
    return briefs || [];
  }
}; 