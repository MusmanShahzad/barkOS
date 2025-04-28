import { supabase } from '../../supabase';
import { Context, User } from '../../types';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface UserFilters {
  fullName?: string;
  email?: string;
  search?: string;
  briefIds?: number[];
  createdAt?: DateRange;
}

interface UserSort {
  field: 'FULL_NAME' | 'EMAIL' | 'CREATED_AT';
  order: 'ASC' | 'DESC';
}

interface PaginationInput {
  page: number;
  pageSize: number;
}

interface PaginatedUsers {
  users: User[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export const userQueries = {
  getUser: async (_: any, { id }: { id: number }, _context: Context) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as User;
  },
  
  getUsers: async (
    _: any,
    { 
      filters,
      sort = [{ field: 'CREATED_AT', order: 'DESC' }],
      pagination = { page: 1, pageSize: 10 }
    }: {
      filters?: UserFilters;
      sort?: UserSort[];
      pagination?: PaginationInput;
    }
  ): Promise<PaginatedUsers> => {
    try {
      // Start with the base count query to get total results
      let countQuery = supabase.from('users').select('id', { count: 'exact' });
      
      // Start with the base data query
      let query = supabase.from('users').select('*');

      if (filters) {
        // Search across multiple fields
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},bio.ilike.${searchTerm}`);
          countQuery = countQuery.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},bio.ilike.${searchTerm}`);
        }

        // Filter by full name
        if (filters.fullName) {
          const nameFilter = `%${filters.fullName}%`;
          query = query.ilike('full_name', nameFilter);
          countQuery = countQuery.ilike('full_name', nameFilter);
        }

        // Filter by email
        if (filters.email) {
          const emailFilter = `%${filters.email}%`;
          query = query.ilike('email', emailFilter);
          countQuery = countQuery.ilike('email', emailFilter);
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

        // If we have brief IDs, filter through user_briefs
        if (filters.briefIds && filters.briefIds.length > 0) {
          const { data: userIds, error: briefError } = await supabase
            .from('user_briefs')
            .select('user_id')
            .in('brief_id', filters.briefIds);

          if (briefError) throw new Error(briefError.message);
          
          if (userIds && userIds.length > 0) {
            const ids = userIds.map(u => u.user_id);
            query = query.in('id', ids);
            countQuery = countQuery.in('id', ids);
          } else {
            return {
              users: [],
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
        const columnName = column === 'full_name' ? 'full_name' : 
                         column === 'created_at' ? 'created_at' : 
                         'email';
        query = query.order(columnName, {
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
        users: data || [],
        totalCount,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
        currentPage: pagination.page,
        totalPages
      };
    } catch (error) {
      console.error('Error in getUsers resolver:', {
        error,
        message: error.message,
        filters
      });
      throw error;
    }
  },

  getUserBriefs: async (_: any, { userId }: { userId: number }, _context: Context) => {
    const { data, error } = await supabase
      .from('briefs_users')
      .select('brief_id')
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const briefIds = data.map(bu => bu.brief_id).filter(Boolean);
    
    if (briefIds.length === 0) return [];
    
    const { data: briefs, error: briefsError } = await supabase
      .from('briefs')
      .select('*')
      .in('id', briefIds);
    
    if (briefsError) throw new Error(briefsError.message);
    return briefs || [];
  },

  getBriefUsers: async (_: any, { briefId }: { briefId: number }, _context: Context) => {
    const { data, error } = await supabase
      .from('briefs_users')
      .select('user_id')
      .eq('brief_id', briefId);
    
    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) return [];
    
    const userIds = data.map(bu => bu.user_id).filter(Boolean);
    
    if (userIds.length === 0) return [];
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    
    if (usersError) throw new Error(usersError.message);
    return (users || []) as User[];
  }
}; 