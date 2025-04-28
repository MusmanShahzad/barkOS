import { GraphQLError } from 'graphql';

/**
 * Handles database errors and converts them to user-friendly GraphQL errors
 * @param error The error from Supabase or other source
 * @param operation The operation being performed (e.g., "creating tag")
 */
export const handleError = (error: any, operation: string): never => {
  // Log detailed error information
  console.error('Error Details:');
  console.error(`Operation: ${operation}`);
  console.error('Error object:', error);
  console.error('Stack trace:', error.stack);
  
  if (error.code) {
    console.error('Error code:', error.code);
  }

  // Specific error handling for RLS policy violations
  if (error.message && error.message.includes('row-level security policy')) {
    throw new GraphQLError(
      `Permission denied: You don't have access to ${operation}. Please check your authentication or permissions.`,
      {
        extensions: {
          code: 'FORBIDDEN',
          originalError: error.message,
          details: error.details,
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
          details: error.details,
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
          details: error.details,
        },
      }
    );
  }

  // Data type validation errors
  if (error.message && error.message.includes('invalid input syntax')) {
    throw new GraphQLError(
      `Invalid data format: Please check the input values.`,
      {
        extensions: {
          code: 'BAD_USER_INPUT',
          originalError: error.message,
          details: error.details,
        },
      }
    );
  }

  // Not found errors
  if (error.message && error.message.includes('not found')) {
    throw new GraphQLError(
      `Resource not found: The requested data does not exist.`,
      {
        extensions: {
          code: 'NOT_FOUND',
          originalError: error.message,
          details: error.details,
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
        details: error.details,
        stack: error.stack,
      },
    }
  );
}; 