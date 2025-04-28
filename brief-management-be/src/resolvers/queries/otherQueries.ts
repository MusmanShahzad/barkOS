import { supabase } from '../../supabase';

export const otherQueries = {
  hello: () => 'Hello from Apollo GraphQL!',
  
  // Brief relationship queries
  getBriefAsset: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('brief_assets') // Note the typo in table name
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getBriefAssets: async () => {
    const { data, error } = await supabase
      .from('brief_assets')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  getBriefAssetsByBriefId: async (_: any, { briefId }: { briefId: number }) => {
    const { data, error } = await supabase
      .from('brief_assets')
      .select('*')
      .eq('brief_id', briefId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // BriefComment queries
  getBriefComment: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('brief_comments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getBriefComments: async () => {
    const { data, error } = await supabase
      .from('brief_comments')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  getBriefCommentsByBriefId: async (_: any, { briefId }: { briefId: number }) => {
    const { data, error } = await supabase
      .from('brief_comments')
      .select('*')
      .eq('brief_id', briefId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // BriefTag queries
  getBriefTag: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('brief_tags')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getBriefTags: async () => {
    const { data, error } = await supabase
      .from('brief_tags')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  getBriefTagsByBriefId: async (_: any, { briefId }: { briefId: number }) => {
    const { data, error } = await supabase
      .from('brief_tags')
      .select('*')
      .eq('brief_id', briefId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Comment queries
  getComment: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getComments: async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Tag queries
  getTag: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getTags: async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Media queries
  getMedia: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  getMedias: async () => {
    const { data, error } = await supabase
      .from('media')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  },
}; 