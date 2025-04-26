import { GraphQLError } from 'graphql';

/**
 * Handles database errors and converts them to user-friendly GraphQL errors
 * @param error The error from Supabase or other source
 * @param operation The operation being performed (e.g., "creating tag")
 */
export const handleError = (error: any, operation: string): never => {
  console.error(`Error ${operation}:`, error);

  // Specific error handling for RLS policy violations
  if (error.message && error.message.includes('row-level security policy')) {
    throw new GraphQLError(
      `Permission denied: You don't have access to ${operation}. Please check your authentication or permissions.`,
      {
        extensions: {
          code: 'FORBIDDEN',
          originalError: error.message,
        },
      }
    );
  }

  // Foreign key constraint violations
  if (error.message && error.message.includes('violates foreign key constraint')) {
    throw new GraphQLError(
      `Invalid reference: One of the referenced records does not exist.`,
      {
        extensions: {
          code: 'BAD_USER_INPUT',
          originalError: error.message,
        },
      }
    );
  }

  // Unique constraint violations
  if (error.message && error.message.includes('violates unique constraint')) {
    throw new GraphQLError(
      `Duplicate record: A record with the same unique field already exists.`,
      {
        extensions: {
          code: 'BAD_USER_INPUT',
          originalError: error.message,
        },
      }
    );
  }

  // General error fallback
  throw new GraphQLError(
    `An error occurred while ${operation}.`,
    {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        originalError: error.message,
      },
    }
  );
}; 