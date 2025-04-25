// Import type resolvers
import { AssetResolvers } from './types/assetResolvers';
import { AssetCommentResolvers } from './types/assetCommentResolvers';
import { AssetTagResolvers } from './types/assetTagResolvers';
import { BriefResolvers } from './types/briefResolvers';
import { BriefAssetResolvers } from './types/briefAssetResolvers';
import { BriefCommentResolvers } from './types/briefCommentResolvers';
import { BriefTagResolvers } from './types/briefTagResolvers';

// Import query resolvers
import { assetQueries } from './queries/assetQueries';
import { assetCommentQueries } from './queries/assetCommentQueries';
import { assetTagQueries } from './queries/assetTagQueries';
import { briefQueries } from './queries/briefQueries';
import { otherQueries } from './queries/otherQueries';

// Import mutation resolvers
import { assetMutations } from './mutations/assetMutations';
import { assetRelationMutations } from './mutations/assetRelationMutations';
import { briefMutations } from './mutations/briefMutations';
import { briefRelationMutations } from './mutations/briefRelationMutations';
import { otherMutations } from './mutations/otherMutations';

// Combine all resolvers
export const resolvers = {
  // Type resolvers
  Asset: AssetResolvers,
  AssetComment: AssetCommentResolvers,
  AssetTag: AssetTagResolvers,
  Brief: BriefResolvers,
  BriefAsset: BriefAssetResolvers,
  BriefComment: BriefCommentResolvers,
  BriefTag: BriefTagResolvers,
  
  // Query resolvers
  Query: {
    ...assetQueries,
    ...assetCommentQueries,
    ...assetTagQueries,
    ...briefQueries,
    ...otherQueries,
  },
  
  // Mutation resolvers
  Mutation: {
    ...assetMutations,
    ...assetRelationMutations,
    ...briefMutations,
    ...briefRelationMutations,
    ...otherMutations,
  },
}; 