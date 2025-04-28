import { supabase } from '../../supabase';
import { Context, User } from '../../types';

interface UserInput {
  full_name?: string;
  email?: string;
  bio?: string;
  phone_number?: string;
  profile_image?: string;
}

export const userMutations = {
  createUser: async (_: any, { input }: { input: UserInput }, _context: Context) => {
    const { data, error } = await supabase
      .from('users')
      .insert([input])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as User;
  },

  updateUser: async (_: any, { id, input }: { id: number; input: UserInput }, _context: Context) => {
    const { data, error } = await supabase
      .from('users')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as User;
  },

  deleteUser: async (_: any, { id }: { id: number }, _context: Context) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  addUserToBrief: async (_: any, { userId, briefId }: { userId: number; briefId: number }, _context: Context) => {
    try {
      const { error } = await supabase
        .from('briefs_users')
        .insert([{
          user_id: userId,
          brief_id: briefId
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding user to brief:', error);
      return false;
    }
  },

  removeUserFromBrief: async (_: any, { userId, briefId }: { userId: number; briefId: number }, _context: Context) => {
    try {
      const { error } = await supabase
        .from('briefs_users')
        .delete()
        .eq('user_id', userId)
        .eq('brief_id', briefId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing user from brief:', error);
      return false;
    }
  }
}; 