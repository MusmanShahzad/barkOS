'use client';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { ReactNode } from 'react';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const client = new ApolloClient({
  link: createUploadLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'
  }),
  cache: new InMemoryCache(),
});

export function GraphQLProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 