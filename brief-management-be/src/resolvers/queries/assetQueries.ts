import { Asset } from '../../types';
import { supabase } from '../../supabase';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface AssetFilters {
  name?: string;
  description?: string;
  mediaId?: number;
  thumbnailMediaId?: number;
  tagIds?: number[];
  briefIds?: number[];
  commentIds?: number[];
  createdAt?: DateRange;
  search?: string;
}

interface AssetSort {
  field: 'NAME' | 'CREATED_AT' | 'DESCRIPTION';
  order: 'ASC' | 'DESC';
}

interface PaginationInput {
  page: number;
  pageSize: number;
}

interface PaginatedAssets {
  assets: Asset[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export const assetQueries = {
  getAsset: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  getAssets: async (
    _: any,
    { 
      filters,
      sort = [{ field: 'CREATED_AT', order: 'DESC' }],
      pagination = { page: 1, pageSize: 10 }
    }: {
      filters?: AssetFilters;
      sort?: AssetSort[];
      pagination?: PaginationInput;
    }
  ): Promise<PaginatedAssets> => {
    try {
      // Start with the base count query to get total results
      let countQuery = supabase.from('assets').select('id', { count: 'exact' });
      
      // Start with the base data query
      let query = supabase.from('assets').select('*');

      if (filters) {
        // Search across multiple fields
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
          countQuery = countQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }

        // Filter by name if provided (using ilike for case-insensitive partial match)
        if (filters.name) {
          const nameFilter = `%${filters.name}%`;
          query = query.ilike('name', nameFilter);
          countQuery = countQuery.ilike('name', nameFilter);
        }

        // Filter by description
        if (filters.description) {
          const descFilter = `%${filters.description}%`;
          query = query.ilike('description', descFilter);
          countQuery = countQuery.ilike('description', descFilter);
        }

        // Filter by media ID
        if (filters.mediaId) {
          query = query.eq('media_id', filters.mediaId);
          countQuery = countQuery.eq('media_id', filters.mediaId);
        }

        // Filter by thumbnail media ID
        if (filters.thumbnailMediaId) {
          query = query.eq('thumbnail_media_id', filters.thumbnailMediaId);
          countQuery = countQuery.eq('thumbnail_media_id', filters.thumbnailMediaId);
        }

        // Filter by date range
        if (filters.createdAt) {
          if (filters.createdAt.startDate) {
            query = query.gte('created_at', filters.createdAt.startDate);
            countQuery = countQuery.gte('created_at', filters.createdAt.startDate);
          }
          if (filters.createdAt.endDate) {
            query = query.lte('created_at', filters.createdAt.endDate);
            countQuery = countQuery.lte('created_at', filters.createdAt.endDate);
          }
        }

        // If we have tag IDs, filter through asset_tags
        if (filters.tagIds && filters.tagIds.length > 0) {
          const { data: assetIds, error: tagError } = await supabase
            .from('asset_tags')
            .select('asset_id')
            .in('tag_id', filters.tagIds);

          if (tagError) throw new Error(tagError.message);
          
          if (assetIds && assetIds.length > 0) {
            const ids = assetIds.map(a => a.asset_id);
            query = query.in('id', ids);
            countQuery = countQuery.in('id', ids);
          } else {
            return {
              assets: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              currentPage: pagination.page,
              totalPages: 0
            };
          }
        }

        // If we have brief IDs, filter through brief_assets
        if (filters.briefIds && filters.briefIds.length > 0) {
          const { data: assetIds, error: briefError } = await supabase
            .from('brief_assets')
            .select('asset_id')
            .in('brief_id', filters.briefIds);

          if (briefError) throw new Error(briefError.message);
          
          if (assetIds && assetIds.length > 0) {
            const ids = assetIds.map(a => a.asset_id);
            query = query.in('id', ids);
            countQuery = countQuery.in('id', ids);
          } else {
            return {
              assets: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              currentPage: pagination.page,
              totalPages: 0
            };
          }
        }

        // If we have comment IDs, filter through asset_comments
        if (filters.commentIds && filters.commentIds.length > 0) {
          const { data: assetIds, error: commentError } = await supabase
            .from('asset_comments')
            .select('asset_id')
            .in('comment_id', filters.commentIds);

          if (commentError) throw new Error(commentError.message);
          
          if (assetIds && assetIds.length > 0) {
            const ids = assetIds.map(a => a.asset_id);
            query = query.in('id', ids);
            countQuery = countQuery.in('id', ids);
          } else {
            return {
              assets: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              currentPage: pagination.page,
              totalPages: 0
            };
          }
        }
      }

      // Apply sorting
      sort.forEach(({ field, order }) => {
        const column = field.toLowerCase();
        query = query.order(column === 'created_at' ? 'created_at' : column, {
          ascending: order === 'ASC'
        });
      });

      // Get total count before pagination
      const { count: totalCount, error: countError } = await countQuery;
      if (countError) throw new Error(countError.message);
      if (totalCount === null) throw new Error('Failed to get total count');

      // Calculate pagination values
      const totalPages = Math.ceil(totalCount / pagination.pageSize);
      const offset = (pagination.page - 1) * pagination.pageSize;

      // Apply pagination
      query = query
        .range(offset, offset + pagination.pageSize - 1)
        .limit(pagination.pageSize);

      // Execute the final query
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return {
        assets: data || [],
        totalCount,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
        currentPage: pagination.page,
        totalPages
      };
    } catch (error) {
      console.error('Error in getAssets resolver:', {
        error,
        message: error.message,
        filters
      });
      throw error;
    }
  }
}; 