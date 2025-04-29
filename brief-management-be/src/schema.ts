export const typeDefs = `#graphql
  type User {
    id: Int!
    full_name: String
    email: String
    bio: String
    phone_number: String
    profile_image: String
    created_at: String!
    briefs: [Brief]
  }

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
    briefs: [Brief]
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
    users: [User]
    related_briefs: [Brief]
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
    user: User
    assets: [Asset]
    briefs: [Brief]
    mentioned_users: [User]
  }

  type CommentMention {
    id: Int!
    comment_id: Int!
    user_id: Int!
    created_at: String!
    comment: Comment
    user: User
  }

  type Tag {
    id: Int!
    name: String
    created_at: String
    assets: [Asset]
    briefs: [Brief]
  }

  type Media {
    id: Int!
    url: String
    file_type: String
    created_at: String
    assets: [Asset]
    thumbnailFor: [Asset]
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
    tagIds: [Int]
    relatedBriefIds: [Int]
  }

  input AssetUpdateInput {
    media_id: Int
    name: String
    description: String
    thumbnail_media_id: Int
    tagIds: [Int]
    commentIds: [Int]
    relatedBriefIds: [Int]
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
    userIds: [Int]
    tagIds: [Int]
    assetIds: [Int]
    relatedBriefIds: [Int]
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
    mentioned_user_ids: [Int]
  }

  input CommentMentionInput {
    comment_id: Int!
    user_id: Int!
  }

  input TagInput {
    name: String
  }

  input MediaInput {
    file: Upload!
  }

  input ProductInput {
    name: String
    description: String
  }

  input ObjectiveInput {
    name: String
    description: String
  }

  input SafeBriefUpdateInput {
    title: String
    description: String
    go_live_on: String
    about_target_audience: String
    about_hook: String
    product_id: Int
    objective_id: Int
    status: BriefStatus
  }

  input UserInput {
    full_name: String
    email: String
    bio: String
    phone_number: String
    profile_image: String
  }

  # Sorting and pagination types
  enum SortOrder {
    ASC
    DESC
  }

  enum UserSortField {
    FULL_NAME
    EMAIL
    CREATED_AT
  }

  enum AssetSortField {
    NAME
    CREATED_AT
    DESCRIPTION
  }

  enum BriefSortField {
    TITLE
    CREATED_AT
    GO_LIVE_ON
    STATUS
  }

  input UserSort {
    field: UserSortField!
    order: SortOrder!
  }

  input AssetSort {
    field: AssetSortField!
    order: SortOrder!
  }

  input BriefSort {
    field: BriefSortField!
    order: SortOrder!
  }

  input PaginationInput {
    page: Int! = 1
    pageSize: Int! = 10
  }

  type PaginatedUsers {
    users: [User]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  type PaginatedAssets {
    assets: [Asset]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  type PaginatedBriefs {
    briefs: [Brief]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  input DateRangeInput {
    startDate: String
    endDate: String
  }

  input UserFilters {
    fullName: String
    email: String
    search: String
    briefIds: [Int]
    createdAt: DateRangeInput
  }

  input AssetFilters {
    name: String
    description: String
    mediaId: Int
    thumbnailMediaId: Int
    tagIds: [Int]
    briefIds: [Int]
    commentIds: [Int]
    createdAt: DateRangeInput
    search: String
  }

  input BriefFilters {
    userIds: [Int]
    title: String
    productId: Int
    objectiveId: Int
    tagIds: [Int]
    assetIds: [Int]
    status: [BriefStatus]
    createdAt: DateRangeInput
    goLiveOn: DateRangeInput
    search: String
  }

  type Query {
    hello: String
    
    # User queries
    getUser(id: Int!): User
    getUsers(
      filters: UserFilters
      sort: [UserSort]
      pagination: PaginationInput
    ): PaginatedUsers!
    getUserBriefs(userId: Int!): [Brief]
    getBriefUsers(briefId: Int!): [User]
    
    # Asset queries
    getAsset(id: Int!): Asset
    getAssets(
      filters: AssetFilters
      sort: [AssetSort]
      pagination: PaginationInput
    ): PaginatedAssets!
    
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
    getBriefs(
      filters: BriefFilters
      sort: [BriefSort]
      pagination: PaginationInput
    ): PaginatedBriefs!
    
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
    getCommentMentions(commentId: Int!): [CommentMention]
    
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
    addCommentToAsset(assetId: Int!, commentInput: CommentInput!): Comment
    
    # AssetTag mutations
    createAssetTag(input: AssetTagInput!): AssetTag
    deleteAssetTag(id: Int!): Boolean
    
    # Brief mutations
    createBrief(input: BriefInput!): Brief
    updateBrief(id: Int!, input: BriefInput!): Brief
    deleteBrief(id: Int!): Boolean
    safeUpdateBrief(id: Int!, input: SafeBriefUpdateInput!): Brief
    
    # BriefAsset mutations
    createBriefAsset(input: BriefAssetInput!): BriefAsset
    deleteBriefAsset(id: Int!): Boolean
    
    # BriefComment mutations
    createBriefComment(input: BriefCommentInput!): BriefComment
    deleteBriefComment(id: Int!): Boolean
    addCommentToBrief(briefId: Int!, commentInput: CommentInput!): Comment
    
    # BriefTag mutations
    createBriefTag(input: BriefTagInput!): BriefTag
    deleteBriefTag(id: Int!): Boolean
    
    # Comment mutations
    createComment(input: CommentInput!): Comment
    updateComment(id: Int!, input: CommentInput!): Comment
    deleteComment(id: Int!): Boolean
    addMentionToComment(input: CommentMentionInput!): CommentMention
    removeMentionFromComment(commentId: Int!, userId: Int!): Boolean
    
    # Tag mutations
    createTag(input: TagInput!): Tag
    updateTag(id: Int!, input: TagInput!): Tag
    deleteTag(id: Int!): Boolean
    
    # Media mutations
    createMedia(input: MediaInput!): Media
    updateMedia(id: Int!, input: MediaInput!): Media
    deleteMedia(id: Int!): Boolean
    uploadMedia(file: Upload!): MediaUploadResponse!
    
    # Product mutations
    createProduct(input: ProductInput!): Product
    updateProduct(id: Int!, input: ProductInput!): Product
    deleteProduct(id: Int!): Boolean
    
    # Objective mutations
    createObjective(input: ObjectiveInput!): Objective
    updateObjective(id: Int!, input: ObjectiveInput!): Objective
    deleteObjective(id: Int!): Boolean

    # User mutations
    createUser(input: UserInput!): User
    updateUser(id: Int!, input: UserInput!): User
    deleteUser(id: Int!): Boolean
    addUserToBrief(userId: Int!, briefId: Int!): Boolean
    removeUserFromBrief(userId: Int!, briefId: Int!): Boolean
  }

  # Add Upload scalar for file handling
  scalar Upload

  type MediaUploadResponse {
    id: Int!
    url: String!
    name: String!
    file_type: String!
    s3_key: String!
    size: Int!
    created_at: String!
  }
`; 