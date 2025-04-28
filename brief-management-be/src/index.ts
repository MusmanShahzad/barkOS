import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { Request, Response, NextFunction } from 'express';
import { graphqlUploadExpress } from 'graphql-upload-minimal';

// Define interface for our context
interface MyContext {
  token?: string;
}

async function startServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);
  const port = process.env.PORT || 4000;

  // Debug log resolvers
  console.log('Loaded resolvers:', {
    queryKeys: Object.keys(resolvers.Query || {}),
    mutationKeys: Object.keys(resolvers.Mutation || {}),
    typeKeys: Object.keys(resolvers).filter(key => key !== 'Query' && key !== 'Mutation')
  });
  app.use(graphqlUploadExpress());

  // Create Apollo Server with drain plugin and error handling
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
    formatError: (formattedError, error: any) => {
      // Log the detailed error
      console.error('GraphQL Error:', {
        message: formattedError.message,
        locations: formattedError.locations,
        path: formattedError.path,
        extensions: formattedError.extensions,
        originalError: error,
        stack: error?.stack
      });

      // Return a cleaned up error for the client
      return {
        message: formattedError.message,
        locations: formattedError.locations,
        path: formattedError.path,
        extensions: {
          code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
          details: formattedError.extensions?.details || error?.details
        }
      };
    },
    introspection: true,
  });

  // Start the Apollo Server
  await server.start();

  // Apply middleware with error handling
  app.use(
    '/graphql',
    cors({
      origin: '*', // Allow all origins (be cautious in production)
      credentials: true, // Allow cookies and credentials
      allowedHeaders: '*', // Allow all headers
      exposedHeaders: '*', // Expose all headers to the client
    }),
    express.json(),
    (err: any, _req: Request, res: Response, next: NextFunction) => {
      if (err) {
        // console.error('Express middleware error:', err);
        res.status(500).json({
          errors: [{
            message: err.message || 'Internal server error',
            extensions: { 
              code: 'INTERNAL_SERVER_ERROR',
              details: err.details
            }
          }]
        });
        return;
      }
      next();
    },
    expressMiddleware(server, {
      context: async ({ req }) => {
        try {
          return { 
            token: req.headers.token as string | undefined 
          };
        } catch (error) {
          console.error('Context creation error:', error);
          throw error;
        }
      },
    }),
  );

  // Add a default route
  app.get('/', (_req: Request, res: Response) => {
    res.send('Hello! GraphQL endpoint is at /graphql');
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      errors: [{
        message: err.message || 'Internal server error',
        extensions: { 
          code: 'INTERNAL_SERVER_ERROR',
          details: err.details
        }
      }]
    });
  });

  // Start the server
  await new Promise<void>((resolve) => {
    httpServer.listen({ port }, resolve);
  });

  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
}); 