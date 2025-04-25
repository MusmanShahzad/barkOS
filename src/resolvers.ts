import { supabase } from './supabase';
import { 
  Asset, AssetComment, AssetTag, 
  Brief, BriefAsset, BriefComment, BriefTag,
  Comment, Tag, Media 
} from './types';

// Define types for resolver parameters
type Context = {
  token?: string;
}

type ResolverFn<TArgs, TResult> = (
  parent: any,
  args: TArgs,
  context: Context,
  info: any
) => Promise<TResult> | TResult;

export const resolvers = {
  // Resolver field mappings
  Asset: {
    media: async (parent: Asset) => {
      if (!parent.media_id) return null;
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', parent.media_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    thumbnail: async (parent: Asset) => {
      if (!parent.thumbnail_media_id) return null;
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', parent.thumbnail_media_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    comments: async (parent: Asset) => {
      const { data, error } = await supabase
        .from('asset_comments')
        .select('comment_id')
        .eq('asset_id', parent.id);
      
      if (error) throw new Error(error.message);
      
      // If no comments, return empty array
      if (!data || data.length === 0) return [];
      
      // Get the actual comments
      const commentIds = data.map(ac => ac.comment_id).filter(Boolean);
      
      if (commentIds.length === 0) return [];
      
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .in('id', commentIds);
      
      if (commentsError) throw new Error(commentsError.message);
      return comments || [];
    },
    tags: async (parent: Asset) => {
      const { data, error } = await supabase
        .from('asset_tags')
        .select('tag_id')
        .eq('asset_id', parent.id);
      
      if (error) throw new Error(error.message);
      
      // If no tags, return empty array
      if (!data || data.length === 0) return [];
      
      // Get the actual tags
      const tagIds = data.map(at => at.tag_id).filter(Boolean);
      
      if (tagIds.length === 0) return [];
      
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .in('id', tagIds);
      
      if (tagsError) throw new Error(tagsError.message);
      return tags || [];
    },
  },
  AssetComment: {
    asset: async (parent: AssetComment) => {
      if (!parent.asset_id) return null;
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', parent.asset_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    comment: async (parent: AssetComment) => {
      if (!parent.comment_id) return null;
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('id', parent.comment_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
  },
  AssetTag: {
    tag: async (parent: AssetTag) => {
      if (!parent.tag_id) return null;
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', parent.tag_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    asset: async (parent: AssetTag) => {
      if (!parent.asset_id) return null;
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', parent.asset_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
  },
  Brief: {
    assets: async (parent: Brief) => {
      const { data, error } = await supabase
        .from('brief_assests') // Note: there's a typo in the table name from SQL file
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
    },
  },
  BriefAsset: {
    brief: async (parent: BriefAsset) => {
      if (!parent.brief_id) return null;
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', parent.brief_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    asset: async (parent: BriefAsset) => {
      if (!parent.asset_id) return null;
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', parent.asset_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
  },
  BriefComment: {
    brief: async (parent: BriefComment) => {
      if (!parent.brief_id) return null;
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', parent.brief_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    comment: async (parent: BriefComment) => {
      if (!parent.comment_id) return null;
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('id', parent.comment_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
  },
  BriefTag: {
    brief: async (parent: BriefTag) => {
      if (!parent.brief_id) return null;
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', parent.brief_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    tag: async (parent: BriefTag) => {
      if (!parent.tag_id) return null;
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', parent.tag_id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
  },
  
  Query: {
    hello: () => 'Hello from Apollo GraphQL!',
    
    // Asset queries
    getAsset: async (_: any, { id }: { id: number }) => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    getAssets: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*');
      
      if (error) throw new Error(error.message);
      return data;
    },
    
    // AssetComment queries
    getAssetComment: async (_: any, { id }: { id: number }) => {
      const { data, error } = await supabase
        .from('asset_comments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    getAssetComments: async () => {
      const { data, error } = await supabase
        .from('asset_comments')
        .select('*');
      
      if (error) throw new Error(error.message);
      return data;
    },
    getAssetCommentsByAssetId: async (_: any, { assetId }: { assetId: number }) => {
      const { data, error } = await supabase
        .from('asset_comments')
        .select('*')
        .eq('asset_id', assetId);
      
      if (error) throw new Error(error.message);
      return data;
    },
    
    // AssetTag queries
    getAssetTag: async (_: any, { id }: { id: number }) => {
      const { data, error } = await supabase
        .from('asset_tags')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    getAssetTags: async () => {
      const { data, error } = await supabase
        .from('asset_tags')
        .select('*');
      
      if (error) throw new Error(error.message);
      return data;
    },
    getAssetTagsByAssetId: async (_: any, { assetId }: { assetId: number }) => {
      const { data, error } = await supabase
        .from('asset_tags')
        .select('*')
        .eq('asset_id', assetId);
      
      if (error) throw new Error(error.message);
      return data;
    },
    
    // Brief queries
    getBrief: async (_: any, { id }: { id: number }) => {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    getBriefs: async () => {
      const { data, error } = await supabase
        .from('briefs')
        .select('*');
      
      if (error) throw new Error(error.message);
      return data;
    },
    
    // BriefAsset queries
    getBriefAsset: async (_: any, { id }: { id: number }) => {
      const { data, error } = await supabase
        .from('brief_assests') // Note the typo in table name
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    getBriefAssets: async () => {
      const { data, error } = await supabase
        .from('brief_assests')
        .select('*');
      
      if (error) throw new Error(error.message);
      return data;
    },
    getBriefAssetsByBriefId: async (_: any, { briefId }: { briefId: number }) => {
      const { data, error } = await supabase
        .from('brief_assests')
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
  },
  
  Mutation: {
    // Asset mutations
    createAsset: async (_: any, { input }: { input: Omit<Asset, 'id' | 'created_at'> }) => {
      const { data, error } = await supabase
        .from('assets')
        .insert([input])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    updateAsset: async (_: any, { id, input }: { id: number, input: Partial<Omit<Asset, 'id' | 'created_at'>> }) => {
      const { data, error } = await supabase
        .from('assets')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    deleteAsset: async (_: any, { id }: { id: number }) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    },
    
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
    
    // Brief mutations
    createBrief: async (_: any, { input }: { input: Omit<Brief, 'id' | 'created_at'> }) => {
      const { data, error } = await supabase
        .from('briefs')
        .insert([input])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    updateBrief: async (_: any, { id, input }: { id: number, input: Partial<Omit<Brief, 'id' | 'created_at'>> }) => {
      const { data, error } = await supabase
        .from('briefs')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    deleteBrief: async (_: any, { id }: { id: number }) => {
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    },
    
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
  },
}; 