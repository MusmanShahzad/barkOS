import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

// Define interface for our context
interface MyContext {
  token?: string;
}

async function startServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);
  const port = process.env.PORT || 4000;

  // Create Apollo Server with drain plugin
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start the Apollo Server
  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ 
        token: req.headers.token as string | undefined 
      }),
    }),
  );

  // Add a default route
  app.get('/', (req, res) => {
    res.send('Hello! GraphQL endpoint is at /graphql');
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