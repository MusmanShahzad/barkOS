// Import types
import { 
  AssetResolvers,
  AssetCommentResolvers,
  AssetTagResolvers,
  BriefResolvers,
  BriefAssetResolvers,
  BriefCommentResolvers,
  BriefTagResolvers,
  ProductResolvers,
  ObjectiveResolvers,
  UserResolvers,
  MediaResolvers,
  TagResolvers,
  CommentResolvers
} from './resolvers/types';

// Import queries
import {
  assetQueries,
  assetCommentQueries,
  assetTagQueries,
  briefQueries,
  objectiveQueries,
  otherQueries,
  productQueries,
  userQueries,
  mediaQueries,
  tagQueries,
  commentQueries
} from './resolvers/queries';

// Import mutations
import { assetMutations } from './resolvers/mutations/assetMutations';
import { assetRelationMutations } from './resolvers/mutations/assetRelationMutations';
import { briefMutations } from './resolvers/mutations/briefMutations';
import { briefRelationMutations } from './resolvers/mutations/briefRelationMutations';
import { otherMutations } from './resolvers/mutations/otherMutations';
import { productMutations } from './resolvers/mutations/productMutations';
import { objectiveMutations } from './resolvers/mutations/objectiveMutations';
import { userMutations } from './resolvers/mutations/userMutations';
import { mediaMutations } from './resolvers/mutations/mediaMutations';
import { GraphQLUpload } from 'graphql-upload-minimal';

// Define types for resolver parameters
// type Context = {
//   token?: string;
// }

// type ResolverFn<TArgs, TResult> = (
//   parent: any,
//   args: TArgs,
//   context: Context,
//   info: any
// ) => Promise<TResult> | TResult;

export const resolvers = {
  // Type resolvers
  Asset: AssetResolvers,
  AssetComment: AssetCommentResolvers,
  AssetTag: AssetTagResolvers,
  Brief: BriefResolvers,
  BriefAsset: BriefAssetResolvers,
  BriefComment: BriefCommentResolvers,
  BriefTag: BriefTagResolvers,
  Product: ProductResolvers,
  Objective: ObjectiveResolvers,
  User: UserResolvers,
  Media: MediaResolvers,
  Tag: TagResolvers,
  Comment: CommentResolvers,
  
  // Upload scalar
  Upload: GraphQLUpload,
  
  // Queries
  Query: {
    ...assetQueries,
    ...assetCommentQueries,
    ...assetTagQueries,
    ...briefQueries,
    ...objectiveQueries,
    ...otherQueries,
    ...productQueries,
    ...userQueries,
    ...mediaQueries,
    ...tagQueries,
    ...commentQueries,
    hello: () => 'Hello from Apollo GraphQL!',
  },
  
  // Mutations
  Mutation: {
    ...assetMutations,
    ...assetRelationMutations,
    ...briefMutations,
    ...briefRelationMutations,
    ...otherMutations,
    ...productMutations,
    ...objectiveMutations,
    ...userMutations,
    ...mediaMutations,
  },
}; 