export const typeDefs = `#graphql
  type Asset {
    id: Int!
    media_id: Int!
    name: String
    description: String
    thumbnail_media_id: Int
    created_at: String!
    media: Media
    thumbnail: Media
    comments: [Comment]
    tags: [Tag]
  }

  type AssetComment {
    id: Int!
    created_at: String!
    asset_id: Int
    comment_id: Int
    asset: Asset
    comment: Comment
  }

  type AssetTag {
    id: Int!
    tag_id: Int
    asset_id: Int
    created_at: String!
    tag: Tag
    asset: Asset
  }

  enum BriefStatus {
    Draft
    Review
    Approved
    Live
  }

  type Brief {
    id: Int!
    title: String
    description: String
    created_at: String!
    go_live_on: String
    about_target_audience: String
    about_hook: String
    status: BriefStatus
    product: Product
    objective: Objective
    assets: [Asset]
    comments: [Comment]
    tags: [Tag]
  }

  type BriefAsset {
    id: Int!
    brief_id: Int
    asset_id: Int
    created_at: String!
    brief: Brief
    asset: Asset
  }

  type BriefComment {
    id: Int!
    created_at: String!
    brief_id: Int
    comment_id: Int
    brief: Brief
    comment: Comment
  }

  type BriefTag {
    id: Int!
    brief_id: Int
    tag_id: Int
    created_at: String!
    brief: Brief
    tag: Tag
  }

  type Comment {
    id: Int!
    text: String
    user_id: Int
    created_at: String!
  }

  type Tag {
    id: Int!
    name: String
    created_at: String
  }

  type Media {
    id: Int!
    url: String
    type: String
    created_at: String
  }

  type Product {
    id: Int!
    name: String
    description: String
    created_at: String!
    briefs: [Brief]
  }

  type Objective {
    id: Int!
    name: String
    description: String
    created_at: String!
    briefs: [Brief]
  }

  # Input types for mutations
  input AssetInput {
    media_id: Int!
    name: String
    description: String
    thumbnail_media_id: Int
  }

  input AssetUpdateInput {
    media_id: Int
    name: String
    description: String
    thumbnail_media_id: Int
  }

  input AssetCommentInput {
    asset_id: Int
    comment_id: Int
  }

  input AssetTagInput {
    tag_id: Int
    asset_id: Int
  }

  input BriefInput {
    title: String
    description: String
    go_live_on: String
    about_target_audience: String
    about_hook: String
    product_id: Int
    objective_id: Int
    status: BriefStatus
  }

  input BriefAssetInput {
    brief_id: Int
    asset_id: Int
  }

  input BriefCommentInput {
    brief_id: Int
    comment_id: Int
  }

  input BriefTagInput {
    brief_id: Int
    tag_id: Int
  }

  input CommentInput {
    text: String
    user_id: Int
  }

  input TagInput {
    name: String
  }

  input MediaInput {
    url: String
    type: String
  }

  input ProductInput {
    name: String
    description: String
  }

  input ObjectiveInput {
    name: String
    description: String
  }

  type Query {
    hello: String
    
    # Asset queries
    getAsset(id: Int!): Asset
    getAssets: [Asset]
    
    # AssetComment queries
    getAssetComment(id: Int!): AssetComment
    getAssetComments: [AssetComment]
    getAssetCommentsByAssetId(assetId: Int!): [AssetComment]
    
    # AssetTag queries
    getAssetTag(id: Int!): AssetTag
    getAssetTags: [AssetTag]
    getAssetTagsByAssetId(assetId: Int!): [AssetTag]
    
    # Brief queries
    getBrief(id: Int!): Brief
    getBriefs: [Brief]
    
    # BriefAsset queries
    getBriefAsset(id: Int!): BriefAsset
    getBriefAssets: [BriefAsset]
    getBriefAssetsByBriefId(briefId: Int!): [BriefAsset]
    
    # BriefComment queries
    getBriefComment(id: Int!): BriefComment
    getBriefComments: [BriefComment]
    getBriefCommentsByBriefId(briefId: Int!): [BriefComment]
    
    # BriefTag queries
    getBriefTag(id: Int!): BriefTag
    getBriefTags: [BriefTag]
    getBriefTagsByBriefId(briefId: Int!): [BriefTag]
    
    # Comment queries
    getComment(id: Int!): Comment
    getComments: [Comment]
    
    # Tag queries
    getTag(id: Int!): Tag
    getTags: [Tag]
    
    # Media queries
    getMedia(id: Int!): Media
    getMedias: [Media]
    
    # Product queries
    getProduct(id: Int!): Product
    getProducts: [Product]
    
    # Objective queries
    getObjective(id: Int!): Objective
    getObjectives: [Objective]
  }

  type Mutation {
    # Asset mutations
    createAsset(input: AssetInput!): Asset
    updateAsset(id: Int!, input: AssetUpdateInput!): Asset
    deleteAsset(id: Int!): Boolean
    
    # AssetComment mutations
    createAssetComment(input: AssetCommentInput!): AssetComment
    deleteAssetComment(id: Int!): Boolean
    
    # AssetTag mutations
    createAssetTag(input: AssetTagInput!): AssetTag
    deleteAssetTag(id: Int!): Boolean
    
    # Brief mutations
    createBrief(input: BriefInput!): Brief
    updateBrief(id: Int!, input: BriefInput!): Brief
    deleteBrief(id: Int!): Boolean
    
    # BriefAsset mutations
    createBriefAsset(input: BriefAssetInput!): BriefAsset
    deleteBriefAsset(id: Int!): Boolean
    
    # BriefComment mutations
    createBriefComment(input: BriefCommentInput!): BriefComment
    deleteBriefComment(id: Int!): Boolean
    
    # BriefTag mutations
    createBriefTag(input: BriefTagInput!): BriefTag
    deleteBriefTag(id: Int!): Boolean
    
    # Comment mutations
    createComment(input: CommentInput!): Comment
    updateComment(id: Int!, input: CommentInput!): Comment
    deleteComment(id: Int!): Boolean
    
    # Tag mutations
    createTag(input: TagInput!): Tag
    updateTag(id: Int!, input: TagInput!): Tag
    deleteTag(id: Int!): Boolean
    
    # Media mutations
    createMedia(input: MediaInput!): Media
    updateMedia(id: Int!, input: MediaInput!): Media
    deleteMedia(id: Int!): Boolean
    
    # Product mutations
    createProduct(input: ProductInput!): Product
    updateProduct(id: Int!, input: ProductInput!): Product
    deleteProduct(id: Int!): Boolean
    
    # Objective mutations
    createObjective(input: ObjectiveInput!): Objective
    updateObjective(id: Int!, input: ObjectiveInput!): Objective
    deleteObjective(id: Int!): Boolean
  }
`; 