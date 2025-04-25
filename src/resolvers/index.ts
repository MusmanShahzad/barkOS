// Import type resolvers
import { AssetResolvers } from './types/assetResolvers';
import { AssetCommentResolvers } from './types/assetCommentResolvers';
import { AssetTagResolvers } from './types/assetTagResolvers';
import { BriefResolvers } from './types/briefResolvers';
import { BriefAssetResolvers } from './types/briefAssetResolvers';
import { BriefCommentResolvers } from './types/briefCommentResolvers';
import { BriefTagResolvers } from './types/briefTagResolvers';
import { ProductResolvers } from './types/productResolvers';
import { ObjectiveResolvers } from './types/objectiveResolvers';

// Import query resolvers
import { assetQueries } from './queries/assetQueries';
import { assetCommentQueries } from './queries/assetCommentQueries';
import { assetTagQueries } from './queries/assetTagQueries';
import { briefQueries } from './queries/briefQueries';
import { otherQueries } from './queries/otherQueries';
import { productQueries } from './queries/productQueries';
import { objectiveQueries } from './queries/objectiveQueries';

// Import mutation resolvers
import { assetMutations } from './mutations/assetMutations';
import { assetRelationMutations } from './mutations/assetRelationMutations';
import { briefMutations } from './mutations/briefMutations';
import { briefRelationMutations } from './mutations/briefRelationMutations';
import { otherMutations } from './mutations/otherMutations';
import { productMutations } from './mutations/productMutations';
import { objectiveMutations } from './mutations/objectiveMutations';

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
  Product: ProductResolvers,
  Objective: ObjectiveResolvers,
  
  // Query resolvers
  Query: {
    ...assetQueries,
    ...assetCommentQueries,
    ...assetTagQueries,
    ...briefQueries,
    ...otherQueries,
    ...productQueries,
    ...objectiveQueries,
  },
  
  // Mutation resolvers
  Mutation: {
    ...assetMutations,
    ...assetRelationMutations,
    ...briefMutations,
    ...briefRelationMutations,
    ...otherMutations,
    ...productMutations,
    ...objectiveMutations,
  },
}; 