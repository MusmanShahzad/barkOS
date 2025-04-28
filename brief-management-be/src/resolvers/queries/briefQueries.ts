import { Brief, BriefStatus } from '../../types';
import { supabase } from '../../supabase';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface BriefFilters {
  userIds?: number[];
  title?: string;
  productId?: number;
  objectiveId?: number;
  tagIds?: number[];
  assetIds?: number[];
  status?: BriefStatus[];
  createdAt?: DateRange;
  goLiveOn?: DateRange;
  search?: string;
}

interface BriefSort {
  field: 'TITLE' | 'CREATED_AT' | 'GO_LIVE_ON' | 'STATUS';
  order: 'ASC' | 'DESC';
}

interface PaginationInput {
  page: number;
  pageSize: number;
}

interface PaginatedBriefs {
  briefs: Brief[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export const briefQueries = {
  getBrief: async (_: any, { id }: { id: number }) => {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  getBriefs: async (
    _: any,
    { 
      filters,
      sort = [{ field: 'CREATED_AT', order: 'DESC' }],
      pagination = { page: 1, pageSize: 10 }
    }: {
      filters?: BriefFilters;
      sort?: BriefSort[];
      pagination?: PaginationInput;
    }
  ): Promise<PaginatedBriefs> => {
    try {
      // Start with the base count query to get total results
      let countQuery = supabase.from('briefs').select('id', { count: 'exact' });
      
      // Start with the base data query
      let query = supabase.from('briefs').select('*');

      if (filters) {
        // Search across multiple fields
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
          countQuery = countQuery.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
        }

        // Filter by title if provided (using ilike for case-insensitive partial match)
        if (filters.title) {
          const titleFilter = `%${filters.title}%`;
          query = query.ilike('title', titleFilter);
          countQuery = countQuery.ilike('title', titleFilter);
        }

        // Filter by product ID
        if (filters.productId) {
          query = query.eq('product_id', filters.productId);
          countQuery = countQuery.eq('product_id', filters.productId);
        }

        // Filter by objective ID
        if (filters.objectiveId) {
          query = query.eq('objective_id', filters.objectiveId);
          countQuery = countQuery.eq('objective_id', filters.objectiveId);
        }

        // Filter by status
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
          countQuery = countQuery.in('status', filters.status);
        }

        // Filter by date ranges
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

        if (filters.goLiveOn) {
          if (filters.goLiveOn.startDate) {
            query = query.gte('go_live_on', filters.goLiveOn.startDate);
            countQuery = countQuery.gte('go_live_on', filters.goLiveOn.startDate);
          }
          if (filters.goLiveOn.endDate) {
            query = query.lte('go_live_on', filters.goLiveOn.endDate);
            countQuery = countQuery.lte('go_live_on', filters.goLiveOn.endDate);
          }
        }

        // If we have user IDs, we need to filter through the user_briefs junction table
        if (filters.userIds && filters.userIds.length > 0) {
          const { data: briefIds, error: userError } = await supabase
            .from('user_briefs')
            .select('brief_id')
            .in('user_id', filters.userIds);

          if (userError) throw new Error(userError.message);
          
          if (briefIds && briefIds.length > 0) {
            const ids = briefIds.map(b => b.brief_id);
            query = query.in('id', ids);
            countQuery = countQuery.in('id', ids);
          } else {
            return {
              briefs: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              currentPage: pagination.page,
              totalPages: 0
            };
          }
        }

        // If we have tag IDs, filter through brief_tags
        if (filters.tagIds && filters.tagIds.length > 0) {
          const { data: briefIds, error: tagError } = await supabase
            .from('brief_tags')
            .select('brief_id')
            .in('tag_id', filters.tagIds);

          if (tagError) throw new Error(tagError.message);
          
          if (briefIds && briefIds.length > 0) {
            const ids = briefIds.map(b => b.brief_id);
            query = query.in('id', ids);
            countQuery = countQuery.in('id', ids);
          } else {
            return {
              briefs: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              currentPage: pagination.page,
              totalPages: 0
            };
          }
        }

        // If we have asset IDs, filter through brief_assets
        if (filters.assetIds && filters.assetIds.length > 0) {
          const { data: briefIds, error: assetError } = await supabase
            .from('brief_assets')
            .select('brief_id')
            .in('asset_id', filters.assetIds);

          if (assetError) throw new Error(assetError.message);
          
          if (briefIds && briefIds.length > 0) {
            const ids = briefIds.map(b => b.brief_id);
            query = query.in('id', ids);
            countQuery = countQuery.in('id', ids);
          } else {
            return {
              briefs: [],
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
        briefs: data || [],
        totalCount,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
        currentPage: pagination.page,
        totalPages
      };
    } catch (error) {
      console.error('Error in getBriefs resolver:', {
        error,
        message: error.message,
        filters
      });
      throw error;
    }
  }
}; 