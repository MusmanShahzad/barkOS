import { supabase } from '../../supabase';
import { Brief } from '../../types';

export const BriefResolvers = {
  users: async (parent: Brief) => {
    const { data, error } = await supabase
      .from('briefs_users')
      .select('user_id')
      .eq('brief_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const userIds = data.map(bu => bu.user_id).filter(Boolean);
    
    if (userIds.length === 0) return [];
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    
    if (usersError) throw new Error(usersError.message);
    return users || [];
  },

  related_briefs: async (parent: Brief) => {
    const { data, error } = await supabase
      .from('related_briefs')
      .select('related_brief_id')
      .eq('brief_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const briefIds = data.map(rb => rb.related_brief_id).filter(Boolean);
    
    if (briefIds.length === 0) return [];
    
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('*')
      .in('id', briefIds);
    
    if (briefsError) throw new Error(briefsError.message);
    return briefs || [];
  },

  product: async (parent: Brief) => {
    if (!parent.product_id) return null;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', parent.product_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  objective: async (parent: Brief) => {
    if (!parent.objective_id) return null;
    
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .eq('id', parent.objective_id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  assets: async (parent: Brief) => {
    const { data, error } = await supabase
      .from('brief_assets') // Note: there's a typo in the table name from SQL file
      .select('asset_id')
      .eq('brief_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const assetIds = data.map(ba => ba.asset_id).filter(Boolean);
    
    if (assetIds.length === 0) return [];
    
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', assetIds);
    
    if (assetsError) throw new Error(assetsError.message);
    return assets || [];
  },

  comments: async (parent: Brief) => {
    const { data, error } = await supabase
      .from('brief_comments')
      .select('comment_id')
      .eq('brief_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const commentIds = data.map(bc => bc.comment_id).filter(Boolean);
    
    if (commentIds.length === 0) return [];
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .in('id', commentIds);
    
    if (commentsError) throw new Error(commentsError.message);
    return comments || [];
  },

  tags: async (parent: Brief) => {
    const { data, error } = await supabase
      .from('brief_tags')
      .select('tag_id')
      .eq('brief_id', parent.id);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const tagIds = data.map(bt => bt.tag_id).filter(Boolean);
    
    if (tagIds.length === 0) return [];
    
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds);
    
    if (tagsError) throw new Error(tagsError.message);
    return tags || [];
  }
}; 