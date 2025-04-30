import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  documents: ['./src/graphql/**/*.graphql'],
  schema: [
    {
      'https://brief-management-5tty387q3-musmanshahzads-projects.vercel.app/': {
        headers: {
          'Content-Type': 'application/json',
          'Apollo-Require-Preflight': 'true'
        },
        method: 'POST'
      },
    },
  ],
  generates: {
    './src/graphql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
        commentDescriptions: true,
      },
    },
    './src/graphql/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo'
      ],
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false
      },
      config: {
        withHooks: true,
        withRefetchFn: true,
        withMutationFn: true,
        withComponent: false,
        withHOC: false,
        withResultType: true,
        withMutationOptionsType: true,
        withSubscriptionFn: true,
        skipTypename: false,
        dedupeFragments: true,
        enumsAsTypes: true,
        constEnums: true,
        immutableTypes: true,
        namingConvention: {
          typeNames: 'pascal-case#pascalCase',
          enumValues: 'upper-case#upperCase',
          fieldNames: 'camel-case#camelCase',
          inputFieldNames: 'camel-case#camelCase',
          argumentNames: 'camel-case#camelCase'
        },
        scalars: {
          DateTime: 'string',
          JSON: '{ [key: string]: any }',
          Upload: 'File | null'
        },
        defaultScalarType: 'unknown',
        inlineFragmentTypes: 'combine',
        experimentalFragmentVariables: true,
        nonOptionalTypename: true,
        omitOperationSuffix: false,
        operationResultSuffix: 'Result',
        exportFragmentSpreadSubTypes: true,
        defaultBaseOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network'
          },
          query: {
            fetchPolicy: 'network-only'
          },
          mutate: {
            fetchPolicy: 'no-cache'
          }
        },
        apolloClientVersion: 3,
        extractFiles: true,
        useTypeImports: true,
        addDocBlocks: true
      }
    }
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
  ignoreNoDocuments: true
};

module.exports = config; 