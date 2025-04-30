'use client';

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink, from } from '@apollo/client';
import { ReactNode } from 'react';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

// GraphQL endpoint
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 
'https://barkos.onrender.com/graphql';

console.log('Using GraphQL endpoint:', GRAPHQL_ENDPOINT);

const uploadLink = createUploadLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'same-origin',
  headers: {
    'Apollo-Require-Preflight': 'true',
    'Content-Type': 'application/json',
  },
  fetchOptions: {
    mode: 'cors',
  }
});

const client = new ApolloClient({
  link: uploadLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export function GraphQLProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 