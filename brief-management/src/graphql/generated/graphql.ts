import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
const defaultOptions = {
  watchQuery: { fetchPolicy: "cache-and-network" },
  query: { fetchPolicy: "network-only" },
  mutate: { fetchPolicy: "no-cache" },
} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Upload: { input: File | null; output: File | null };
};

export type Asset = {
  readonly __typename: "Asset";
  readonly briefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly comments?: Maybe<ReadonlyArray<Maybe<Comment>>>;
  readonly created_at: Scalars["String"]["output"];
  readonly description?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["Int"]["output"];
  readonly media?: Maybe<Media>;
  readonly media_id: Scalars["Int"]["output"];
  readonly name?: Maybe<Scalars["String"]["output"]>;
  readonly tags?: Maybe<ReadonlyArray<Maybe<Tag>>>;
  readonly thumbnail?: Maybe<Media>;
  readonly thumbnail_media_id?: Maybe<Scalars["Int"]["output"]>;
};

export type AssetComment = {
  readonly __typename: "AssetComment";
  readonly asset?: Maybe<Asset>;
  readonly asset_id?: Maybe<Scalars["Int"]["output"]>;
  readonly comment?: Maybe<Comment>;
  readonly comment_id?: Maybe<Scalars["Int"]["output"]>;
  readonly created_at: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
};

export type AssetCommentInput = {
  readonly asset_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly comment_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AssetFilters = {
  readonly briefIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly commentIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly createdAt?: InputMaybe<DateRangeInput>;
  readonly description?: InputMaybe<Scalars["String"]["input"]>;
  readonly mediaId?: InputMaybe<Scalars["Int"]["input"]>;
  readonly name?: InputMaybe<Scalars["String"]["input"]>;
  readonly search?: InputMaybe<Scalars["String"]["input"]>;
  readonly tagIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly thumbnailMediaId?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AssetInput = {
  readonly description?: InputMaybe<Scalars["String"]["input"]>;
  readonly media_id: Scalars["Int"]["input"];
  readonly name?: InputMaybe<Scalars["String"]["input"]>;
  readonly relatedBriefIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly tagIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly thumbnail_media_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AssetSort = {
  readonly field: AssetSortField;
  readonly order: SortOrder;
};

export type AssetSortField = "CREATED_AT" | "DESCRIPTION" | "NAME";

export type AssetTag = {
  readonly __typename: "AssetTag";
  readonly asset?: Maybe<Asset>;
  readonly asset_id?: Maybe<Scalars["Int"]["output"]>;
  readonly created_at: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
  readonly tag?: Maybe<Tag>;
  readonly tag_id?: Maybe<Scalars["Int"]["output"]>;
};

export type AssetTagInput = {
  readonly asset_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly tag_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AssetUpdateInput = {
  readonly commentIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly description?: InputMaybe<Scalars["String"]["input"]>;
  readonly media_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly name?: InputMaybe<Scalars["String"]["input"]>;
  readonly relatedBriefIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly tagIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly thumbnail_media_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Brief = {
  readonly __typename: "Brief";
  readonly about_hook?: Maybe<Scalars["String"]["output"]>;
  readonly about_target_audience?: Maybe<Scalars["String"]["output"]>;
  readonly assets?: Maybe<ReadonlyArray<Maybe<Asset>>>;
  readonly comments?: Maybe<ReadonlyArray<Maybe<Comment>>>;
  readonly created_at: Scalars["String"]["output"];
  readonly description?: Maybe<Scalars["String"]["output"]>;
  readonly go_live_on?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["Int"]["output"];
  readonly objective?: Maybe<Objective>;
  readonly product?: Maybe<Product>;
  readonly related_briefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly status?: Maybe<BriefStatus>;
  readonly tags?: Maybe<ReadonlyArray<Maybe<Tag>>>;
  readonly title?: Maybe<Scalars["String"]["output"]>;
  readonly users?: Maybe<ReadonlyArray<Maybe<User>>>;
};

export type BriefAsset = {
  readonly __typename: "BriefAsset";
  readonly asset?: Maybe<Asset>;
  readonly asset_id?: Maybe<Scalars["Int"]["output"]>;
  readonly brief?: Maybe<Brief>;
  readonly brief_id?: Maybe<Scalars["Int"]["output"]>;
  readonly created_at: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
};

export type BriefAssetInput = {
  readonly asset_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly brief_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type BriefComment = {
  readonly __typename: "BriefComment";
  readonly brief?: Maybe<Brief>;
  readonly brief_id?: Maybe<Scalars["Int"]["output"]>;
  readonly comment?: Maybe<Comment>;
  readonly comment_id?: Maybe<Scalars["Int"]["output"]>;
  readonly created_at: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
};

export type BriefCommentInput = {
  readonly brief_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly comment_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type BriefFilters = {
  readonly assetIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly createdAt?: InputMaybe<DateRangeInput>;
  readonly goLiveOn?: InputMaybe<DateRangeInput>;
  readonly objectiveId?: InputMaybe<Scalars["Int"]["input"]>;
  readonly productId?: InputMaybe<Scalars["Int"]["input"]>;
  readonly search?: InputMaybe<Scalars["String"]["input"]>;
  readonly status?: InputMaybe<ReadonlyArray<InputMaybe<BriefStatus>>>;
  readonly tagIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly title?: InputMaybe<Scalars["String"]["input"]>;
  readonly userIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
};

export type BriefInput = {
  readonly about_hook?: InputMaybe<Scalars["String"]["input"]>;
  readonly about_target_audience?: InputMaybe<Scalars["String"]["input"]>;
  readonly assetIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly description?: InputMaybe<Scalars["String"]["input"]>;
  readonly go_live_on?: InputMaybe<Scalars["String"]["input"]>;
  readonly objective_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly product_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly relatedBriefIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly status?: InputMaybe<BriefStatus>;
  readonly tagIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly title?: InputMaybe<Scalars["String"]["input"]>;
  readonly userIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
};

export type BriefSort = {
  readonly field: BriefSortField;
  readonly order: SortOrder;
};

export type BriefSortField = "CREATED_AT" | "GO_LIVE_ON" | "STATUS" | "TITLE";

export type BriefStatus = "Approved" | "Draft" | "Live" | "Review";

export type BriefTag = {
  readonly __typename: "BriefTag";
  readonly brief?: Maybe<Brief>;
  readonly brief_id?: Maybe<Scalars["Int"]["output"]>;
  readonly created_at: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
  readonly tag?: Maybe<Tag>;
  readonly tag_id?: Maybe<Scalars["Int"]["output"]>;
};

export type BriefTagInput = {
  readonly brief_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly tag_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Comment = {
  readonly __typename: "Comment";
  readonly assets?: Maybe<ReadonlyArray<Maybe<Asset>>>;
  readonly briefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly created_at: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
  readonly mentioned_users?: Maybe<ReadonlyArray<Maybe<User>>>;
  readonly text?: Maybe<Scalars["String"]["output"]>;
  readonly user?: Maybe<User>;
  readonly user_id?: Maybe<Scalars["Int"]["output"]>;
};

export type CommentInput = {
  readonly mentioned_user_ids?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly text?: InputMaybe<Scalars["String"]["input"]>;
  readonly user_id?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CommentMention = {
  readonly __typename: "CommentMention";
  readonly comment?: Maybe<Comment>;
  readonly comment_id: Scalars["Int"]["output"];
  readonly created_at: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
  readonly user?: Maybe<User>;
  readonly user_id: Scalars["Int"]["output"];
};

export type CommentMentionInput = {
  readonly comment_id: Scalars["Int"]["input"];
  readonly user_id: Scalars["Int"]["input"];
};

export type DateRangeInput = {
  readonly endDate?: InputMaybe<Scalars["String"]["input"]>;
  readonly startDate?: InputMaybe<Scalars["String"]["input"]>;
};

export type Media = {
  readonly __typename: "Media";
  readonly assets?: Maybe<ReadonlyArray<Maybe<Asset>>>;
  readonly created_at?: Maybe<Scalars["String"]["output"]>;
  readonly file_type?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["Int"]["output"];
  readonly thumbnailFor?: Maybe<ReadonlyArray<Maybe<Asset>>>;
  readonly url?: Maybe<Scalars["String"]["output"]>;
};

export type MediaInput = {
  readonly file: Scalars["Upload"]["input"];
};

export type MediaUploadResponse = {
  readonly __typename: "MediaUploadResponse";
  readonly created_at: Scalars["String"]["output"];
  readonly file_type: Scalars["String"]["output"];
  readonly id: Scalars["Int"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly s3_key: Scalars["String"]["output"];
  readonly size: Scalars["Int"]["output"];
  readonly url: Scalars["String"]["output"];
};

export type Mutation = {
  readonly __typename: "Mutation";
  readonly addCommentToAsset?: Maybe<Comment>;
  readonly addCommentToBrief?: Maybe<Comment>;
  readonly addMentionToComment?: Maybe<CommentMention>;
  readonly addUserToBrief?: Maybe<Scalars["Boolean"]["output"]>;
  readonly createAsset?: Maybe<Asset>;
  readonly createAssetComment?: Maybe<AssetComment>;
  readonly createAssetTag?: Maybe<AssetTag>;
  readonly createBrief?: Maybe<Brief>;
  readonly createBriefAsset?: Maybe<BriefAsset>;
  readonly createBriefComment?: Maybe<BriefComment>;
  readonly createBriefTag?: Maybe<BriefTag>;
  readonly createComment?: Maybe<Comment>;
  readonly createMedia?: Maybe<Media>;
  readonly createObjective?: Maybe<Objective>;
  readonly createProduct?: Maybe<Product>;
  readonly createTag?: Maybe<Tag>;
  readonly createUser?: Maybe<User>;
  readonly deleteAsset?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteAssetComment?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteAssetTag?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteBrief?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteBriefAsset?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteBriefComment?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteBriefTag?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteComment?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteMedia?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteObjective?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteProduct?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteTag?: Maybe<Scalars["Boolean"]["output"]>;
  readonly deleteUser?: Maybe<Scalars["Boolean"]["output"]>;
  readonly removeMentionFromComment?: Maybe<Scalars["Boolean"]["output"]>;
  readonly removeUserFromBrief?: Maybe<Scalars["Boolean"]["output"]>;
  readonly safeUpdateBrief?: Maybe<Brief>;
  readonly updateAsset?: Maybe<Asset>;
  readonly updateBrief?: Maybe<Brief>;
  readonly updateComment?: Maybe<Comment>;
  readonly updateMedia?: Maybe<Media>;
  readonly updateObjective?: Maybe<Objective>;
  readonly updateProduct?: Maybe<Product>;
  readonly updateTag?: Maybe<Tag>;
  readonly updateUser?: Maybe<User>;
  readonly uploadMedia: MediaUploadResponse;
};

export type MutationAddCommentToAssetArgs = {
  assetId: Scalars["Int"]["input"];
  commentInput: CommentInput;
};

export type MutationAddCommentToBriefArgs = {
  briefId: Scalars["Int"]["input"];
  commentInput: CommentInput;
};

export type MutationAddMentionToCommentArgs = {
  input: CommentMentionInput;
};

export type MutationAddUserToBriefArgs = {
  briefId: Scalars["Int"]["input"];
  userId: Scalars["Int"]["input"];
};

export type MutationCreateAssetArgs = {
  input: AssetInput;
};

export type MutationCreateAssetCommentArgs = {
  input: AssetCommentInput;
};

export type MutationCreateAssetTagArgs = {
  input: AssetTagInput;
};

export type MutationCreateBriefArgs = {
  input: BriefInput;
};

export type MutationCreateBriefAssetArgs = {
  input: BriefAssetInput;
};

export type MutationCreateBriefCommentArgs = {
  input: BriefCommentInput;
};

export type MutationCreateBriefTagArgs = {
  input: BriefTagInput;
};

export type MutationCreateCommentArgs = {
  input: CommentInput;
};

export type MutationCreateMediaArgs = {
  input: MediaInput;
};

export type MutationCreateObjectiveArgs = {
  input: ObjectiveInput;
};

export type MutationCreateProductArgs = {
  input: ProductInput;
};

export type MutationCreateTagArgs = {
  input: TagInput;
};

export type MutationCreateUserArgs = {
  input: UserInput;
};

export type MutationDeleteAssetArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteAssetCommentArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteAssetTagArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteBriefArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteBriefAssetArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteBriefCommentArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteBriefTagArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteCommentArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteMediaArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteObjectiveArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteProductArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteTagArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationDeleteUserArgs = {
  id: Scalars["Int"]["input"];
};

export type MutationRemoveMentionFromCommentArgs = {
  commentId: Scalars["Int"]["input"];
  userId: Scalars["Int"]["input"];
};

export type MutationRemoveUserFromBriefArgs = {
  briefId: Scalars["Int"]["input"];
  userId: Scalars["Int"]["input"];
};

export type MutationSafeUpdateBriefArgs = {
  id: Scalars["Int"]["input"];
  input: SafeBriefUpdateInput;
};

export type MutationUpdateAssetArgs = {
  id: Scalars["Int"]["input"];
  input: AssetUpdateInput;
};

export type MutationUpdateBriefArgs = {
  id: Scalars["Int"]["input"];
  input: BriefInput;
};

export type MutationUpdateCommentArgs = {
  id: Scalars["Int"]["input"];
  input: CommentInput;
};

export type MutationUpdateMediaArgs = {
  id: Scalars["Int"]["input"];
  input: MediaInput;
};

export type MutationUpdateObjectiveArgs = {
  id: Scalars["Int"]["input"];
  input: ObjectiveInput;
};

export type MutationUpdateProductArgs = {
  id: Scalars["Int"]["input"];
  input: ProductInput;
};

export type MutationUpdateTagArgs = {
  id: Scalars["Int"]["input"];
  input: TagInput;
};

export type MutationUpdateUserArgs = {
  id: Scalars["Int"]["input"];
  input: UserInput;
};

export type MutationUploadMediaArgs = {
  file: Scalars["Upload"]["input"];
};

export type Objective = {
  readonly __typename: "Objective";
  readonly briefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly created_at: Scalars["String"]["output"];
  readonly description?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["Int"]["output"];
  readonly name?: Maybe<Scalars["String"]["output"]>;
};

export type ObjectiveInput = {
  readonly description?: InputMaybe<Scalars["String"]["input"]>;
  readonly name?: InputMaybe<Scalars["String"]["input"]>;
};

export type PaginatedAssets = {
  readonly __typename: "PaginatedAssets";
  readonly assets: ReadonlyArray<Maybe<Asset>>;
  readonly currentPage: Scalars["Int"]["output"];
  readonly hasNextPage: Scalars["Boolean"]["output"];
  readonly hasPreviousPage: Scalars["Boolean"]["output"];
  readonly totalCount: Scalars["Int"]["output"];
  readonly totalPages: Scalars["Int"]["output"];
};

export type PaginatedBriefs = {
  readonly __typename: "PaginatedBriefs";
  readonly briefs: ReadonlyArray<Maybe<Brief>>;
  readonly currentPage: Scalars["Int"]["output"];
  readonly hasNextPage: Scalars["Boolean"]["output"];
  readonly hasPreviousPage: Scalars["Boolean"]["output"];
  readonly totalCount: Scalars["Int"]["output"];
  readonly totalPages: Scalars["Int"]["output"];
};

export type PaginatedUsers = {
  readonly __typename: "PaginatedUsers";
  readonly currentPage: Scalars["Int"]["output"];
  readonly hasNextPage: Scalars["Boolean"]["output"];
  readonly hasPreviousPage: Scalars["Boolean"]["output"];
  readonly totalCount: Scalars["Int"]["output"];
  readonly totalPages: Scalars["Int"]["output"];
  readonly users: ReadonlyArray<Maybe<User>>;
};

export type PaginationInput = {
  readonly page?: Scalars["Int"]["input"];
  readonly pageSize?: Scalars["Int"]["input"];
};

export type Product = {
  readonly __typename: "Product";
  readonly briefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly created_at: Scalars["String"]["output"];
  readonly description?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["Int"]["output"];
  readonly name?: Maybe<Scalars["String"]["output"]>;
};

export type ProductInput = {
  readonly description?: InputMaybe<Scalars["String"]["input"]>;
  readonly name?: InputMaybe<Scalars["String"]["input"]>;
};

export type Query = {
  readonly __typename: "Query";
  readonly getAsset?: Maybe<Asset>;
  readonly getAssetComment?: Maybe<AssetComment>;
  readonly getAssetComments?: Maybe<ReadonlyArray<Maybe<AssetComment>>>;
  readonly getAssetCommentsByAssetId?: Maybe<
    ReadonlyArray<Maybe<AssetComment>>
  >;
  readonly getAssetTag?: Maybe<AssetTag>;
  readonly getAssetTags?: Maybe<ReadonlyArray<Maybe<AssetTag>>>;
  readonly getAssetTagsByAssetId?: Maybe<ReadonlyArray<Maybe<AssetTag>>>;
  readonly getAssets: PaginatedAssets;
  readonly getBrief?: Maybe<Brief>;
  readonly getBriefAsset?: Maybe<BriefAsset>;
  readonly getBriefAssets?: Maybe<ReadonlyArray<Maybe<BriefAsset>>>;
  readonly getBriefAssetsByBriefId?: Maybe<ReadonlyArray<Maybe<BriefAsset>>>;
  readonly getBriefComment?: Maybe<BriefComment>;
  readonly getBriefComments?: Maybe<ReadonlyArray<Maybe<BriefComment>>>;
  readonly getBriefCommentsByBriefId?: Maybe<
    ReadonlyArray<Maybe<BriefComment>>
  >;
  readonly getBriefTag?: Maybe<BriefTag>;
  readonly getBriefTags?: Maybe<ReadonlyArray<Maybe<BriefTag>>>;
  readonly getBriefTagsByBriefId?: Maybe<ReadonlyArray<Maybe<BriefTag>>>;
  readonly getBriefUsers?: Maybe<ReadonlyArray<Maybe<User>>>;
  readonly getBriefs: PaginatedBriefs;
  readonly getComment?: Maybe<Comment>;
  readonly getCommentMentions?: Maybe<ReadonlyArray<Maybe<CommentMention>>>;
  readonly getComments?: Maybe<ReadonlyArray<Maybe<Comment>>>;
  readonly getMedia?: Maybe<Media>;
  readonly getMedias?: Maybe<ReadonlyArray<Maybe<Media>>>;
  readonly getObjective?: Maybe<Objective>;
  readonly getObjectives?: Maybe<ReadonlyArray<Maybe<Objective>>>;
  readonly getProduct?: Maybe<Product>;
  readonly getProducts?: Maybe<ReadonlyArray<Maybe<Product>>>;
  readonly getTag?: Maybe<Tag>;
  readonly getTags?: Maybe<ReadonlyArray<Maybe<Tag>>>;
  readonly getUser?: Maybe<User>;
  readonly getUserBriefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly getUsers: PaginatedUsers;
  readonly hello?: Maybe<Scalars["String"]["output"]>;
};

export type QueryGetAssetArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetAssetCommentArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetAssetCommentsByAssetIdArgs = {
  assetId: Scalars["Int"]["input"];
};

export type QueryGetAssetTagArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetAssetTagsByAssetIdArgs = {
  assetId: Scalars["Int"]["input"];
};

export type QueryGetAssetsArgs = {
  filters?: InputMaybe<AssetFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ReadonlyArray<InputMaybe<AssetSort>>>;
};

export type QueryGetBriefArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetBriefAssetArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetBriefAssetsByBriefIdArgs = {
  briefId: Scalars["Int"]["input"];
};

export type QueryGetBriefCommentArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetBriefCommentsByBriefIdArgs = {
  briefId: Scalars["Int"]["input"];
};

export type QueryGetBriefTagArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetBriefTagsByBriefIdArgs = {
  briefId: Scalars["Int"]["input"];
};

export type QueryGetBriefUsersArgs = {
  briefId: Scalars["Int"]["input"];
};

export type QueryGetBriefsArgs = {
  filters?: InputMaybe<BriefFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ReadonlyArray<InputMaybe<BriefSort>>>;
};

export type QueryGetCommentArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetCommentMentionsArgs = {
  commentId: Scalars["Int"]["input"];
};

export type QueryGetMediaArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetObjectiveArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetProductArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetTagArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetUserArgs = {
  id: Scalars["Int"]["input"];
};

export type QueryGetUserBriefsArgs = {
  userId: Scalars["Int"]["input"];
};

export type QueryGetUsersArgs = {
  filters?: InputMaybe<UserFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ReadonlyArray<InputMaybe<UserSort>>>;
};

export type SafeBriefUpdateInput = {
  readonly about_hook?: InputMaybe<Scalars["String"]["input"]>;
  readonly about_target_audience?: InputMaybe<Scalars["String"]["input"]>;
  readonly description?: InputMaybe<Scalars["String"]["input"]>;
  readonly go_live_on?: InputMaybe<Scalars["String"]["input"]>;
  readonly objective_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly product_id?: InputMaybe<Scalars["Int"]["input"]>;
  readonly status?: InputMaybe<BriefStatus>;
  readonly title?: InputMaybe<Scalars["String"]["input"]>;
};

export type SortOrder = "ASC" | "DESC";

export type Tag = {
  readonly __typename: "Tag";
  readonly assets?: Maybe<ReadonlyArray<Maybe<Asset>>>;
  readonly briefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly created_at?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["Int"]["output"];
  readonly name?: Maybe<Scalars["String"]["output"]>;
};

export type TagInput = {
  readonly name?: InputMaybe<Scalars["String"]["input"]>;
};

export type User = {
  readonly __typename: "User";
  readonly bio?: Maybe<Scalars["String"]["output"]>;
  readonly briefs?: Maybe<ReadonlyArray<Maybe<Brief>>>;
  readonly created_at: Scalars["String"]["output"];
  readonly email?: Maybe<Scalars["String"]["output"]>;
  readonly full_name?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["Int"]["output"];
  readonly phone_number?: Maybe<Scalars["String"]["output"]>;
  readonly profile_image?: Maybe<Scalars["String"]["output"]>;
};

export type UserFilters = {
  readonly briefIds?: InputMaybe<
    ReadonlyArray<InputMaybe<Scalars["Int"]["input"]>>
  >;
  readonly createdAt?: InputMaybe<DateRangeInput>;
  readonly email?: InputMaybe<Scalars["String"]["input"]>;
  readonly fullName?: InputMaybe<Scalars["String"]["input"]>;
  readonly search?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserInput = {
  readonly bio?: InputMaybe<Scalars["String"]["input"]>;
  readonly email?: InputMaybe<Scalars["String"]["input"]>;
  readonly full_name?: InputMaybe<Scalars["String"]["input"]>;
  readonly phone_number?: InputMaybe<Scalars["String"]["input"]>;
  readonly profile_image?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserSort = {
  readonly field: UserSortField;
  readonly order: SortOrder;
};

export type UserSortField = "CREATED_AT" | "EMAIL" | "FULL_NAME";

export type CreateAssetMutationVariables = Exact<{
  input: AssetInput;
}>;

export type CreateAssetMutationResult = {
  readonly __typename: "Mutation";
  readonly createAsset?: {
    readonly __typename: "Asset";
    readonly id: number;
    readonly name?: string | null;
    readonly description?: string | null;
    readonly media_id: number;
    readonly thumbnail_media_id?: number | null;
    readonly created_at: string;
    readonly media?: {
      readonly __typename: "Media";
      readonly id: number;
      readonly url?: string | null;
      readonly file_type?: string | null;
    } | null;
    readonly thumbnail?: {
      readonly __typename: "Media";
      readonly id: number;
      readonly url?: string | null;
      readonly file_type?: string | null;
    } | null;
  } | null;
};

export type UpdateAssetMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  input: AssetUpdateInput;
}>;

export type UpdateAssetMutationResult = {
  readonly __typename: "Mutation";
  readonly updateAsset?: {
    readonly __typename: "Asset";
    readonly id: number;
    readonly name?: string | null;
    readonly description?: string | null;
    readonly media_id: number;
    readonly thumbnail_media_id?: number | null;
    readonly created_at: string;
    readonly media?: {
      readonly __typename: "Media";
      readonly id: number;
      readonly url?: string | null;
      readonly file_type?: string | null;
    } | null;
    readonly thumbnail?: {
      readonly __typename: "Media";
      readonly id: number;
      readonly url?: string | null;
      readonly file_type?: string | null;
    } | null;
    readonly tags?: ReadonlyArray<{
      readonly __typename: "Tag";
      readonly id: number;
      readonly name?: string | null;
    } | null> | null;
    readonly comments?: ReadonlyArray<{
      readonly __typename: "Comment";
      readonly id: number;
      readonly text?: string | null;
      readonly created_at: string;
      readonly user?: {
        readonly __typename: "User";
        readonly id: number;
        readonly full_name?: string | null;
        readonly profile_image?: string | null;
      } | null;
    } | null> | null;
  } | null;
};

export type DeleteAssetMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type DeleteAssetMutationResult = {
  readonly __typename: "Mutation";
  readonly deleteAsset?: boolean | null;
};

export type AddCommentToBriefMutationVariables = Exact<{
  briefId: Scalars["Int"]["input"];
  commentInput: CommentInput;
}>;

export type AddCommentToBriefMutationResult = {
  readonly __typename: "Mutation";
  readonly addCommentToBrief?: {
    readonly __typename: "Comment";
    readonly id: number;
    readonly text?: string | null;
    readonly created_at: string;
    readonly user?: {
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null;
    readonly mentioned_users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
  } | null;
};

export type CreateBriefMutationVariables = Exact<{
  input: BriefInput;
}>;

export type CreateBriefMutationResult = {
  readonly __typename: "Mutation";
  readonly createBrief?: {
    readonly __typename: "Brief";
    readonly id: number;
    readonly title?: string | null;
    readonly description?: string | null;
    readonly created_at: string;
    readonly go_live_on?: string | null;
    readonly about_target_audience?: string | null;
    readonly about_hook?: string | null;
    readonly status?: BriefStatus | null;
    readonly product?: {
      readonly __typename: "Product";
      readonly id: number;
      readonly name?: string | null;
    } | null;
    readonly objective?: {
      readonly __typename: "Objective";
      readonly id: number;
      readonly name?: string | null;
    } | null;
    readonly users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
    readonly tags?: ReadonlyArray<{
      readonly __typename: "Tag";
      readonly id: number;
      readonly name?: string | null;
    } | null> | null;
    readonly assets?: ReadonlyArray<{
      readonly __typename: "Asset";
      readonly id: number;
      readonly name?: string | null;
      readonly description?: string | null;
      readonly media?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
        readonly file_type?: string | null;
      } | null;
      readonly thumbnail?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
      } | null;
    } | null> | null;
    readonly related_briefs?: ReadonlyArray<{
      readonly __typename: "Brief";
      readonly id: number;
      readonly title?: string | null;
      readonly status?: BriefStatus | null;
    } | null> | null;
    readonly comments?: ReadonlyArray<{
      readonly __typename: "Comment";
      readonly id: number;
      readonly text?: string | null;
      readonly created_at: string;
      readonly user?: {
        readonly __typename: "User";
        readonly id: number;
        readonly full_name?: string | null;
        readonly profile_image?: string | null;
      } | null;
    } | null> | null;
  } | null;
};

export type UpdateBriefMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  input: BriefInput;
}>;

export type UpdateBriefMutationResult = {
  readonly __typename: "Mutation";
  readonly updateBrief?: {
    readonly __typename: "Brief";
    readonly id: number;
    readonly title?: string | null;
    readonly description?: string | null;
    readonly created_at: string;
    readonly go_live_on?: string | null;
    readonly about_target_audience?: string | null;
    readonly about_hook?: string | null;
    readonly status?: BriefStatus | null;
    readonly product?: {
      readonly __typename: "Product";
      readonly id: number;
      readonly name?: string | null;
    } | null;
    readonly objective?: {
      readonly __typename: "Objective";
      readonly id: number;
      readonly name?: string | null;
    } | null;
    readonly users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
    readonly tags?: ReadonlyArray<{
      readonly __typename: "Tag";
      readonly id: number;
      readonly name?: string | null;
    } | null> | null;
    readonly assets?: ReadonlyArray<{
      readonly __typename: "Asset";
      readonly id: number;
      readonly name?: string | null;
      readonly description?: string | null;
      readonly media?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
        readonly file_type?: string | null;
      } | null;
      readonly thumbnail?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
      } | null;
    } | null> | null;
    readonly related_briefs?: ReadonlyArray<{
      readonly __typename: "Brief";
      readonly id: number;
      readonly title?: string | null;
      readonly status?: BriefStatus | null;
    } | null> | null;
    readonly comments?: ReadonlyArray<{
      readonly __typename: "Comment";
      readonly id: number;
      readonly text?: string | null;
      readonly created_at: string;
      readonly user?: {
        readonly __typename: "User";
        readonly id: number;
        readonly full_name?: string | null;
        readonly profile_image?: string | null;
      } | null;
    } | null> | null;
  } | null;
};

export type DeleteBriefMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type DeleteBriefMutationResult = {
  readonly __typename: "Mutation";
  readonly deleteBrief?: boolean | null;
};

export type SafeUpdateBriefMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  input: SafeBriefUpdateInput;
}>;

export type SafeUpdateBriefMutationResult = {
  readonly __typename: "Mutation";
  readonly safeUpdateBrief?: {
    readonly __typename: "Brief";
    readonly id: number;
    readonly title?: string | null;
    readonly description?: string | null;
    readonly created_at: string;
    readonly go_live_on?: string | null;
    readonly about_target_audience?: string | null;
    readonly about_hook?: string | null;
    readonly status?: BriefStatus | null;
    readonly product?: {
      readonly __typename: "Product";
      readonly id: number;
      readonly name?: string | null;
    } | null;
    readonly objective?: {
      readonly __typename: "Objective";
      readonly id: number;
      readonly name?: string | null;
    } | null;
  } | null;
};

export type CreateCommentMutationVariables = Exact<{
  input: CommentInput;
}>;

export type CreateCommentMutationResult = {
  readonly __typename: "Mutation";
  readonly createComment?: {
    readonly __typename: "Comment";
    readonly id: number;
    readonly text?: string | null;
    readonly created_at: string;
    readonly user?: {
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null;
    readonly mentioned_users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
  } | null;
};

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  input: CommentInput;
}>;

export type UpdateCommentMutationResult = {
  readonly __typename: "Mutation";
  readonly updateComment?: {
    readonly __typename: "Comment";
    readonly id: number;
    readonly text?: string | null;
    readonly created_at: string;
    readonly user?: {
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null;
    readonly mentioned_users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
  } | null;
};

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type DeleteCommentMutationResult = {
  readonly __typename: "Mutation";
  readonly deleteComment?: boolean | null;
};

export type AddMentionToCommentMutationVariables = Exact<{
  input: CommentMentionInput;
}>;

export type AddMentionToCommentMutationResult = {
  readonly __typename: "Mutation";
  readonly addMentionToComment?: {
    readonly __typename: "CommentMention";
    readonly id: number;
    readonly comment_id: number;
    readonly user_id: number;
    readonly created_at: string;
  } | null;
};

export type RemoveMentionFromCommentMutationVariables = Exact<{
  commentId: Scalars["Int"]["input"];
  userId: Scalars["Int"]["input"];
}>;

export type RemoveMentionFromCommentMutationResult = {
  readonly __typename: "Mutation";
  readonly removeMentionFromComment?: boolean | null;
};

export type UploadMediaMutationVariables = Exact<{
  file: Scalars["Upload"]["input"];
}>;

export type UploadMediaMutationResult = {
  readonly __typename: "Mutation";
  readonly uploadMedia: {
    readonly __typename: "MediaUploadResponse";
    readonly id: number;
    readonly url: string;
    readonly name: string;
    readonly file_type: string;
    readonly s3_key: string;
    readonly size: number;
    readonly created_at: string;
  };
};

export type DeleteMediaMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type DeleteMediaMutationResult = {
  readonly __typename: "Mutation";
  readonly deleteMedia?: boolean | null;
};

export type CreateUserMutationVariables = Exact<{
  input: UserInput;
}>;

export type CreateUserMutationResult = {
  readonly __typename: "Mutation";
  readonly createUser?: {
    readonly __typename: "User";
    readonly id: number;
    readonly full_name?: string | null;
    readonly email?: string | null;
    readonly bio?: string | null;
    readonly phone_number?: string | null;
    readonly profile_image?: string | null;
    readonly created_at: string;
  } | null;
};

export type UpdateUserMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  input: UserInput;
}>;

export type UpdateUserMutationResult = {
  readonly __typename: "Mutation";
  readonly updateUser?: {
    readonly __typename: "User";
    readonly id: number;
    readonly full_name?: string | null;
    readonly email?: string | null;
    readonly bio?: string | null;
    readonly phone_number?: string | null;
    readonly profile_image?: string | null;
    readonly created_at: string;
  } | null;
};

export type DeleteUserMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type DeleteUserMutationResult = {
  readonly __typename: "Mutation";
  readonly deleteUser?: boolean | null;
};

export type AddUserToBriefMutationVariables = Exact<{
  userId: Scalars["Int"]["input"];
  briefId: Scalars["Int"]["input"];
}>;

export type AddUserToBriefMutationResult = {
  readonly __typename: "Mutation";
  readonly addUserToBrief?: boolean | null;
};

export type RemoveUserFromBriefMutationVariables = Exact<{
  userId: Scalars["Int"]["input"];
  briefId: Scalars["Int"]["input"];
}>;

export type RemoveUserFromBriefMutationResult = {
  readonly __typename: "Mutation";
  readonly removeUserFromBrief?: boolean | null;
};

export type GetAssetsQueryVariables = Exact<{
  filters?: InputMaybe<AssetFilters>;
  sort?: InputMaybe<ReadonlyArray<AssetSort> | AssetSort>;
  pagination?: InputMaybe<PaginationInput>;
}>;

export type GetAssetsQueryResult = {
  readonly __typename: "Query";
  readonly getAssets: {
    readonly __typename: "PaginatedAssets";
    readonly totalCount: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly assets: ReadonlyArray<{
      readonly __typename: "Asset";
      readonly id: number;
      readonly name?: string | null;
      readonly description?: string | null;
      readonly created_at: string;
      readonly media?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
        readonly file_type?: string | null;
      } | null;
      readonly thumbnail?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
        readonly file_type?: string | null;
      } | null;
      readonly tags?: ReadonlyArray<{
        readonly __typename: "Tag";
        readonly id: number;
        readonly name?: string | null;
      } | null> | null;
      readonly comments?: ReadonlyArray<{
        readonly __typename: "Comment";
        readonly id: number;
        readonly text?: string | null;
        readonly created_at: string;
        readonly user?: {
          readonly __typename: "User";
          readonly id: number;
          readonly full_name?: string | null;
          readonly profile_image?: string | null;
        } | null;
      } | null> | null;
      readonly briefs?: ReadonlyArray<{
        readonly __typename: "Brief";
        readonly id: number;
        readonly title?: string | null;
        readonly description?: string | null;
        readonly status?: BriefStatus | null;
        readonly created_at: string;
      } | null> | null;
    } | null>;
  };
};

export type GetAssetQueryVariables = Exact<{
  getAssetId: Scalars["Int"]["input"];
}>;

export type GetAssetQueryResult = {
  readonly __typename: "Query";
  readonly getAsset?: {
    readonly __typename: "Asset";
    readonly id: number;
    readonly media_id: number;
    readonly name?: string | null;
    readonly description?: string | null;
    readonly thumbnail_media_id?: number | null;
    readonly created_at: string;
    readonly media?: {
      readonly __typename: "Media";
      readonly id: number;
      readonly url?: string | null;
      readonly file_type?: string | null;
      readonly created_at?: string | null;
    } | null;
    readonly thumbnail?: {
      readonly __typename: "Media";
      readonly id: number;
      readonly url?: string | null;
      readonly file_type?: string | null;
      readonly created_at?: string | null;
    } | null;
    readonly comments?: ReadonlyArray<{
      readonly __typename: "Comment";
      readonly id: number;
      readonly text?: string | null;
      readonly user?: {
        readonly __typename: "User";
        readonly id: number;
        readonly full_name?: string | null;
        readonly email?: string | null;
        readonly bio?: string | null;
        readonly phone_number?: string | null;
        readonly profile_image?: string | null;
        readonly created_at: string;
      } | null;
    } | null> | null;
    readonly tags?: ReadonlyArray<{
      readonly __typename: "Tag";
      readonly id: number;
      readonly name?: string | null;
    } | null> | null;
    readonly briefs?: ReadonlyArray<{
      readonly __typename: "Brief";
      readonly id: number;
      readonly title?: string | null;
      readonly about_hook?: string | null;
      readonly about_target_audience?: string | null;
      readonly created_at: string;
      readonly description?: string | null;
      readonly go_live_on?: string | null;
      readonly status?: BriefStatus | null;
    } | null> | null;
  } | null;
};

export type GetBriefDropDownsQueryVariables = Exact<{ [key: string]: never }>;

export type GetBriefDropDownsQueryResult = {
  readonly __typename: "Query";
  readonly getProducts?: ReadonlyArray<{
    readonly __typename: "Product";
    readonly id: number;
    readonly name?: string | null;
    readonly description?: string | null;
    readonly created_at: string;
  } | null> | null;
  readonly getObjectives?: ReadonlyArray<{
    readonly __typename: "Objective";
    readonly id: number;
    readonly name?: string | null;
    readonly description?: string | null;
    readonly created_at: string;
  } | null> | null;
  readonly getTags?: ReadonlyArray<{
    readonly __typename: "Tag";
    readonly created_at?: string | null;
    readonly id: number;
    readonly name?: string | null;
  } | null> | null;
};

export type GetBriefsQueryVariables = Exact<{
  pagination: PaginationInput;
  filters?: InputMaybe<BriefFilters>;
  sort?: InputMaybe<
    ReadonlyArray<InputMaybe<BriefSort>> | InputMaybe<BriefSort>
  >;
}>;

export type GetBriefsQueryResult = {
  readonly __typename: "Query";
  readonly getBriefs: {
    readonly __typename: "PaginatedBriefs";
    readonly totalCount: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly briefs: ReadonlyArray<{
      readonly __typename: "Brief";
      readonly id: number;
      readonly title?: string | null;
      readonly description?: string | null;
      readonly status?: BriefStatus | null;
      readonly created_at: string;
      readonly go_live_on?: string | null;
      readonly about_target_audience?: string | null;
      readonly about_hook?: string | null;
      readonly product?: {
        readonly __typename: "Product";
        readonly id: number;
        readonly name?: string | null;
        readonly description?: string | null;
      } | null;
      readonly objective?: {
        readonly __typename: "Objective";
        readonly id: number;
        readonly name?: string | null;
        readonly description?: string | null;
      } | null;
      readonly assets?: ReadonlyArray<{
        readonly __typename: "Asset";
        readonly id: number;
        readonly name?: string | null;
        readonly description?: string | null;
        readonly media_id: number;
        readonly thumbnail_media_id?: number | null;
        readonly created_at: string;
        readonly media?: {
          readonly __typename: "Media";
          readonly id: number;
          readonly url?: string | null;
          readonly file_type?: string | null;
        } | null;
        readonly thumbnail?: {
          readonly __typename: "Media";
          readonly id: number;
          readonly url?: string | null;
        } | null;
        readonly tags?: ReadonlyArray<{
          readonly __typename: "Tag";
          readonly id: number;
          readonly name?: string | null;
        } | null> | null;
      } | null> | null;
      readonly comments?: ReadonlyArray<{
        readonly __typename: "Comment";
        readonly id: number;
        readonly text?: string | null;
        readonly user_id?: number | null;
        readonly created_at: string;
        readonly user?: {
          readonly __typename: "User";
          readonly id: number;
          readonly full_name?: string | null;
          readonly email?: string | null;
          readonly profile_image?: string | null;
        } | null;
        readonly mentioned_users?: ReadonlyArray<{
          readonly __typename: "User";
          readonly id: number;
          readonly full_name?: string | null;
          readonly email?: string | null;
          readonly profile_image?: string | null;
        } | null> | null;
      } | null> | null;
      readonly tags?: ReadonlyArray<{
        readonly __typename: "Tag";
        readonly id: number;
        readonly name?: string | null;
      } | null> | null;
      readonly users?: ReadonlyArray<{
        readonly __typename: "User";
        readonly id: number;
        readonly full_name?: string | null;
        readonly email?: string | null;
        readonly profile_image?: string | null;
      } | null> | null;
      readonly related_briefs?: ReadonlyArray<{
        readonly __typename: "Brief";
        readonly id: number;
        readonly title?: string | null;
        readonly status?: BriefStatus | null;
      } | null> | null;
    } | null>;
  };
};

export type GetBriefQueryVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type GetBriefQueryResult = {
  readonly __typename: "Query";
  readonly getBrief?: {
    readonly __typename: "Brief";
    readonly id: number;
    readonly title?: string | null;
    readonly description?: string | null;
    readonly status?: BriefStatus | null;
    readonly created_at: string;
    readonly go_live_on?: string | null;
    readonly about_target_audience?: string | null;
    readonly about_hook?: string | null;
    readonly product?: {
      readonly __typename: "Product";
      readonly id: number;
      readonly name?: string | null;
      readonly description?: string | null;
    } | null;
    readonly objective?: {
      readonly __typename: "Objective";
      readonly id: number;
      readonly name?: string | null;
      readonly description?: string | null;
    } | null;
    readonly assets?: ReadonlyArray<{
      readonly __typename: "Asset";
      readonly id: number;
      readonly name?: string | null;
      readonly description?: string | null;
      readonly media_id: number;
      readonly thumbnail_media_id?: number | null;
      readonly created_at: string;
      readonly media?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
        readonly file_type?: string | null;
      } | null;
      readonly thumbnail?: {
        readonly __typename: "Media";
        readonly id: number;
        readonly url?: string | null;
      } | null;
      readonly tags?: ReadonlyArray<{
        readonly __typename: "Tag";
        readonly id: number;
        readonly name?: string | null;
      } | null> | null;
    } | null> | null;
    readonly comments?: ReadonlyArray<{
      readonly __typename: "Comment";
      readonly id: number;
      readonly text?: string | null;
      readonly user_id?: number | null;
      readonly created_at: string;
      readonly user?: {
        readonly __typename: "User";
        readonly id: number;
        readonly full_name?: string | null;
        readonly email?: string | null;
        readonly profile_image?: string | null;
      } | null;
      readonly mentioned_users?: ReadonlyArray<{
        readonly __typename: "User";
        readonly id: number;
        readonly full_name?: string | null;
        readonly email?: string | null;
        readonly profile_image?: string | null;
      } | null> | null;
    } | null> | null;
    readonly tags?: ReadonlyArray<{
      readonly __typename: "Tag";
      readonly id: number;
      readonly name?: string | null;
    } | null> | null;
    readonly users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly email?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
    readonly related_briefs?: ReadonlyArray<{
      readonly __typename: "Brief";
      readonly id: number;
      readonly title?: string | null;
      readonly status?: BriefStatus | null;
    } | null> | null;
  } | null;
};

export type GetCommentQueryVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type GetCommentQueryResult = {
  readonly __typename: "Query";
  readonly getComment?: {
    readonly __typename: "Comment";
    readonly id: number;
    readonly text?: string | null;
    readonly created_at: string;
    readonly user?: {
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null;
    readonly mentioned_users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
  } | null;
};

export type GetCommentsQueryVariables = Exact<{ [key: string]: never }>;

export type GetCommentsQueryResult = {
  readonly __typename: "Query";
  readonly getComments?: ReadonlyArray<{
    readonly __typename: "Comment";
    readonly id: number;
    readonly text?: string | null;
    readonly created_at: string;
    readonly user?: {
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null;
    readonly mentioned_users?: ReadonlyArray<{
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null> | null;
  } | null> | null;
};

export type GetCommentMentionsQueryVariables = Exact<{
  commentId: Scalars["Int"]["input"];
}>;

export type GetCommentMentionsQueryResult = {
  readonly __typename: "Query";
  readonly getCommentMentions?: ReadonlyArray<{
    readonly __typename: "CommentMention";
    readonly id: number;
    readonly user?: {
      readonly __typename: "User";
      readonly id: number;
      readonly full_name?: string | null;
      readonly profile_image?: string | null;
    } | null;
  } | null> | null;
};

export type GetTagsQueryVariables = Exact<{ [key: string]: never }>;

export type GetTagsQueryResult = {
  readonly __typename: "Query";
  readonly getTags?: ReadonlyArray<{
    readonly __typename: "Tag";
    readonly created_at?: string | null;
    readonly id: number;
    readonly name?: string | null;
  } | null> | null;
};

export type GetUsersQueryVariables = Exact<{
  filters?: InputMaybe<UserFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ReadonlyArray<InputMaybe<UserSort>> | InputMaybe<UserSort>>;
}>;

export type GetUsersQueryResult = {
  readonly __typename: "Query";
  readonly getUsers: {
    readonly __typename: "PaginatedUsers";
    readonly currentPage: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
    readonly totalCount: number;
    readonly totalPages: number;
    readonly users: ReadonlyArray<{
      readonly __typename: "User";
      readonly bio?: string | null;
      readonly created_at: string;
      readonly email?: string | null;
      readonly full_name?: string | null;
      readonly id: number;
      readonly phone_number?: string | null;
      readonly profile_image?: string | null;
    } | null>;
  };
};

export type GetUserQueryVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;

export type GetUserQueryResult = {
  readonly __typename: "Query";
  readonly getUser?: {
    readonly __typename: "User";
    readonly id: number;
    readonly full_name?: string | null;
    readonly email?: string | null;
    readonly bio?: string | null;
    readonly phone_number?: string | null;
    readonly profile_image?: string | null;
    readonly created_at: string;
    readonly briefs?: ReadonlyArray<{
      readonly __typename: "Brief";
      readonly id: number;
      readonly title?: string | null;
      readonly status?: BriefStatus | null;
    } | null> | null;
  } | null;
};

export type GetUserBriefsQueryVariables = Exact<{
  userId: Scalars["Int"]["input"];
}>;

export type GetUserBriefsQueryResult = {
  readonly __typename: "Query";
  readonly getUserBriefs?: ReadonlyArray<{
    readonly __typename: "Brief";
    readonly id: number;
    readonly title?: string | null;
    readonly description?: string | null;
    readonly status?: BriefStatus | null;
    readonly created_at: string;
  } | null> | null;
};

export const CreateAssetDocument = gql`
  mutation CreateAsset($input: AssetInput!) {
    createAsset(input: $input) {
      id
      name
      description
      media_id
      thumbnail_media_id
      created_at
      media {
        id
        url
        file_type
      }
      thumbnail {
        id
        url
        file_type
      }
    }
  }
`;
export type CreateAssetMutationFn = Apollo.MutationFunction<
  CreateAssetMutationResult,
  CreateAssetMutationVariables
>;

/**
 * __useCreateAssetMutation__
 *
 * To run a mutation, you first call `useCreateAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAssetMutation, { data, loading, error }] = useCreateAssetMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateAssetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateAssetMutationResult,
    CreateAssetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateAssetMutationResult,
    CreateAssetMutationVariables
  >(CreateAssetDocument, options);
}
export type CreateAssetMutationHookResult = ReturnType<
  typeof useCreateAssetMutation
>;
export type CreateAssetMutationResult =
  Apollo.MutationResult<CreateAssetMutationResult>;
export type CreateAssetMutationOptions = Apollo.BaseMutationOptions<
  CreateAssetMutationResult,
  CreateAssetMutationVariables
>;
export const UpdateAssetDocument = gql`
  mutation UpdateAsset($id: Int!, $input: AssetUpdateInput!) {
    updateAsset(id: $id, input: $input) {
      id
      name
      description
      media_id
      thumbnail_media_id
      created_at
      media {
        id
        url
        file_type
      }
      thumbnail {
        id
        url
        file_type
      }
      tags {
        id
        name
      }
      comments {
        id
        text
        user {
          id
          full_name
          profile_image
        }
        created_at
      }
      created_at
    }
  }
`;
export type UpdateAssetMutationFn = Apollo.MutationFunction<
  UpdateAssetMutationResult,
  UpdateAssetMutationVariables
>;

/**
 * __useUpdateAssetMutation__
 *
 * To run a mutation, you first call `useUpdateAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAssetMutation, { data, loading, error }] = useUpdateAssetMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAssetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateAssetMutationResult,
    UpdateAssetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateAssetMutationResult,
    UpdateAssetMutationVariables
  >(UpdateAssetDocument, options);
}
export type UpdateAssetMutationHookResult = ReturnType<
  typeof useUpdateAssetMutation
>;
export type UpdateAssetMutationResult =
  Apollo.MutationResult<UpdateAssetMutationResult>;
export type UpdateAssetMutationOptions = Apollo.BaseMutationOptions<
  UpdateAssetMutationResult,
  UpdateAssetMutationVariables
>;
export const DeleteAssetDocument = gql`
  mutation DeleteAsset($id: Int!) {
    deleteAsset(id: $id)
  }
`;
export type DeleteAssetMutationFn = Apollo.MutationFunction<
  DeleteAssetMutationResult,
  DeleteAssetMutationVariables
>;

/**
 * __useDeleteAssetMutation__
 *
 * To run a mutation, you first call `useDeleteAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAssetMutation, { data, loading, error }] = useDeleteAssetMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteAssetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteAssetMutationResult,
    DeleteAssetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteAssetMutationResult,
    DeleteAssetMutationVariables
  >(DeleteAssetDocument, options);
}
export type DeleteAssetMutationHookResult = ReturnType<
  typeof useDeleteAssetMutation
>;
export type DeleteAssetMutationResult =
  Apollo.MutationResult<DeleteAssetMutationResult>;
export type DeleteAssetMutationOptions = Apollo.BaseMutationOptions<
  DeleteAssetMutationResult,
  DeleteAssetMutationVariables
>;
export const AddCommentToBriefDocument = gql`
  mutation AddCommentToBrief($briefId: Int!, $commentInput: CommentInput!) {
    addCommentToBrief(briefId: $briefId, commentInput: $commentInput) {
      id
      text
      created_at
      user {
        id
        full_name
        profile_image
      }
      mentioned_users {
        id
        full_name
        profile_image
      }
    }
  }
`;
export type AddCommentToBriefMutationFn = Apollo.MutationFunction<
  AddCommentToBriefMutationResult,
  AddCommentToBriefMutationVariables
>;

/**
 * __useAddCommentToBriefMutation__
 *
 * To run a mutation, you first call `useAddCommentToBriefMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCommentToBriefMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCommentToBriefMutation, { data, loading, error }] = useAddCommentToBriefMutation({
 *   variables: {
 *      briefId: // value for 'briefId'
 *      commentInput: // value for 'commentInput'
 *   },
 * });
 */
export function useAddCommentToBriefMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddCommentToBriefMutationResult,
    AddCommentToBriefMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddCommentToBriefMutationResult,
    AddCommentToBriefMutationVariables
  >(AddCommentToBriefDocument, options);
}
export type AddCommentToBriefMutationHookResult = ReturnType<
  typeof useAddCommentToBriefMutation
>;
export type AddCommentToBriefMutationResult =
  Apollo.MutationResult<AddCommentToBriefMutationResult>;
export type AddCommentToBriefMutationOptions = Apollo.BaseMutationOptions<
  AddCommentToBriefMutationResult,
  AddCommentToBriefMutationVariables
>;
export const CreateBriefDocument = gql`
  mutation CreateBrief($input: BriefInput!) {
    createBrief(input: $input) {
      id
      title
      description
      created_at
      go_live_on
      about_target_audience
      about_hook
      status
      product {
        id
        name
      }
      objective {
        id
        name
      }
      users {
        id
        full_name
        profile_image
      }
      tags {
        id
        name
      }
      assets {
        id
        name
        description
        media {
          id
          url
          file_type
        }
        thumbnail {
          id
          url
        }
      }
      related_briefs {
        id
        title
        status
      }
      comments {
        id
        text
        user {
          id
          full_name
          profile_image
        }
        created_at
      }
    }
  }
`;
export type CreateBriefMutationFn = Apollo.MutationFunction<
  CreateBriefMutationResult,
  CreateBriefMutationVariables
>;

/**
 * __useCreateBriefMutation__
 *
 * To run a mutation, you first call `useCreateBriefMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBriefMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBriefMutation, { data, loading, error }] = useCreateBriefMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateBriefMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateBriefMutationResult,
    CreateBriefMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateBriefMutationResult,
    CreateBriefMutationVariables
  >(CreateBriefDocument, options);
}
export type CreateBriefMutationHookResult = ReturnType<
  typeof useCreateBriefMutation
>;
export type CreateBriefMutationResult =
  Apollo.MutationResult<CreateBriefMutationResult>;
export type CreateBriefMutationOptions = Apollo.BaseMutationOptions<
  CreateBriefMutationResult,
  CreateBriefMutationVariables
>;
export const UpdateBriefDocument = gql`
  mutation UpdateBrief($id: Int!, $input: BriefInput!) {
    updateBrief(id: $id, input: $input) {
      id
      title
      description
      created_at
      go_live_on
      about_target_audience
      about_hook
      status
      product {
        id
        name
      }
      objective {
        id
        name
      }
      users {
        id
        full_name
        profile_image
      }
      tags {
        id
        name
      }
      assets {
        id
        name
        description
        media {
          id
          url
          file_type
        }
        thumbnail {
          id
          url
        }
      }
      related_briefs {
        id
        title
        status
      }
      comments {
        id
        text
        user {
          id
          full_name
          profile_image
        }
        created_at
      }
    }
  }
`;
export type UpdateBriefMutationFn = Apollo.MutationFunction<
  UpdateBriefMutationResult,
  UpdateBriefMutationVariables
>;

/**
 * __useUpdateBriefMutation__
 *
 * To run a mutation, you first call `useUpdateBriefMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBriefMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBriefMutation, { data, loading, error }] = useUpdateBriefMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateBriefMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateBriefMutationResult,
    UpdateBriefMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateBriefMutationResult,
    UpdateBriefMutationVariables
  >(UpdateBriefDocument, options);
}
export type UpdateBriefMutationHookResult = ReturnType<
  typeof useUpdateBriefMutation
>;
export type UpdateBriefMutationResult =
  Apollo.MutationResult<UpdateBriefMutationResult>;
export type UpdateBriefMutationOptions = Apollo.BaseMutationOptions<
  UpdateBriefMutationResult,
  UpdateBriefMutationVariables
>;
export const DeleteBriefDocument = gql`
  mutation DeleteBrief($id: Int!) {
    deleteBrief(id: $id)
  }
`;
export type DeleteBriefMutationFn = Apollo.MutationFunction<
  DeleteBriefMutationResult,
  DeleteBriefMutationVariables
>;

/**
 * __useDeleteBriefMutation__
 *
 * To run a mutation, you first call `useDeleteBriefMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBriefMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBriefMutation, { data, loading, error }] = useDeleteBriefMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteBriefMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteBriefMutationResult,
    DeleteBriefMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteBriefMutationResult,
    DeleteBriefMutationVariables
  >(DeleteBriefDocument, options);
}
export type DeleteBriefMutationHookResult = ReturnType<
  typeof useDeleteBriefMutation
>;
export type DeleteBriefMutationResult =
  Apollo.MutationResult<DeleteBriefMutationResult>;
export type DeleteBriefMutationOptions = Apollo.BaseMutationOptions<
  DeleteBriefMutationResult,
  DeleteBriefMutationVariables
>;
export const SafeUpdateBriefDocument = gql`
  mutation SafeUpdateBrief($id: Int!, $input: SafeBriefUpdateInput!) {
    safeUpdateBrief(id: $id, input: $input) {
      id
      title
      description
      created_at
      go_live_on
      about_target_audience
      about_hook
      status
      product {
        id
        name
      }
      objective {
        id
        name
      }
    }
  }
`;
export type SafeUpdateBriefMutationFn = Apollo.MutationFunction<
  SafeUpdateBriefMutationResult,
  SafeUpdateBriefMutationVariables
>;

/**
 * __useSafeUpdateBriefMutation__
 *
 * To run a mutation, you first call `useSafeUpdateBriefMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSafeUpdateBriefMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [safeUpdateBriefMutation, { data, loading, error }] = useSafeUpdateBriefMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSafeUpdateBriefMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SafeUpdateBriefMutationResult,
    SafeUpdateBriefMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SafeUpdateBriefMutationResult,
    SafeUpdateBriefMutationVariables
  >(SafeUpdateBriefDocument, options);
}
export type SafeUpdateBriefMutationHookResult = ReturnType<
  typeof useSafeUpdateBriefMutation
>;
export type SafeUpdateBriefMutationResult =
  Apollo.MutationResult<SafeUpdateBriefMutationResult>;
export type SafeUpdateBriefMutationOptions = Apollo.BaseMutationOptions<
  SafeUpdateBriefMutationResult,
  SafeUpdateBriefMutationVariables
>;
export const CreateCommentDocument = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      text
      created_at
      user {
        id
        full_name
        profile_image
      }
      mentioned_users {
        id
        full_name
        profile_image
      }
    }
  }
`;
export type CreateCommentMutationFn = Apollo.MutationFunction<
  CreateCommentMutationResult,
  CreateCommentMutationVariables
>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateCommentMutationResult,
    CreateCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateCommentMutationResult,
    CreateCommentMutationVariables
  >(CreateCommentDocument, options);
}
export type CreateCommentMutationHookResult = ReturnType<
  typeof useCreateCommentMutation
>;
export type CreateCommentMutationResult =
  Apollo.MutationResult<CreateCommentMutationResult>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<
  CreateCommentMutationResult,
  CreateCommentMutationVariables
>;
export const UpdateCommentDocument = gql`
  mutation UpdateComment($id: Int!, $input: CommentInput!) {
    updateComment(id: $id, input: $input) {
      id
      text
      created_at
      user {
        id
        full_name
        profile_image
      }
      mentioned_users {
        id
        full_name
        profile_image
      }
    }
  }
`;
export type UpdateCommentMutationFn = Apollo.MutationFunction<
  UpdateCommentMutationResult,
  UpdateCommentMutationVariables
>;

/**
 * __useUpdateCommentMutation__
 *
 * To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCommentMutationResult,
    UpdateCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCommentMutationResult,
    UpdateCommentMutationVariables
  >(UpdateCommentDocument, options);
}
export type UpdateCommentMutationHookResult = ReturnType<
  typeof useUpdateCommentMutation
>;
export type UpdateCommentMutationResult =
  Apollo.MutationResult<UpdateCommentMutationResult>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<
  UpdateCommentMutationResult,
  UpdateCommentMutationVariables
>;
export const DeleteCommentDocument = gql`
  mutation DeleteComment($id: Int!) {
    deleteComment(id: $id)
  }
`;
export type DeleteCommentMutationFn = Apollo.MutationFunction<
  DeleteCommentMutationResult,
  DeleteCommentMutationVariables
>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCommentMutationResult,
    DeleteCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCommentMutationResult,
    DeleteCommentMutationVariables
  >(DeleteCommentDocument, options);
}
export type DeleteCommentMutationHookResult = ReturnType<
  typeof useDeleteCommentMutation
>;
export type DeleteCommentMutationResult =
  Apollo.MutationResult<DeleteCommentMutationResult>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<
  DeleteCommentMutationResult,
  DeleteCommentMutationVariables
>;
export const AddMentionToCommentDocument = gql`
  mutation AddMentionToComment($input: CommentMentionInput!) {
    addMentionToComment(input: $input) {
      id
      comment_id
      user_id
      created_at
    }
  }
`;
export type AddMentionToCommentMutationFn = Apollo.MutationFunction<
  AddMentionToCommentMutationResult,
  AddMentionToCommentMutationVariables
>;

/**
 * __useAddMentionToCommentMutation__
 *
 * To run a mutation, you first call `useAddMentionToCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMentionToCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMentionToCommentMutation, { data, loading, error }] = useAddMentionToCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddMentionToCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddMentionToCommentMutationResult,
    AddMentionToCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddMentionToCommentMutationResult,
    AddMentionToCommentMutationVariables
  >(AddMentionToCommentDocument, options);
}
export type AddMentionToCommentMutationHookResult = ReturnType<
  typeof useAddMentionToCommentMutation
>;
export type AddMentionToCommentMutationResult =
  Apollo.MutationResult<AddMentionToCommentMutationResult>;
export type AddMentionToCommentMutationOptions = Apollo.BaseMutationOptions<
  AddMentionToCommentMutationResult,
  AddMentionToCommentMutationVariables
>;
export const RemoveMentionFromCommentDocument = gql`
  mutation RemoveMentionFromComment($commentId: Int!, $userId: Int!) {
    removeMentionFromComment(commentId: $commentId, userId: $userId)
  }
`;
export type RemoveMentionFromCommentMutationFn = Apollo.MutationFunction<
  RemoveMentionFromCommentMutationResult,
  RemoveMentionFromCommentMutationVariables
>;

/**
 * __useRemoveMentionFromCommentMutation__
 *
 * To run a mutation, you first call `useRemoveMentionFromCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMentionFromCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMentionFromCommentMutation, { data, loading, error }] = useRemoveMentionFromCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRemoveMentionFromCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveMentionFromCommentMutationResult,
    RemoveMentionFromCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemoveMentionFromCommentMutationResult,
    RemoveMentionFromCommentMutationVariables
  >(RemoveMentionFromCommentDocument, options);
}
export type RemoveMentionFromCommentMutationHookResult = ReturnType<
  typeof useRemoveMentionFromCommentMutation
>;
export type RemoveMentionFromCommentMutationResult =
  Apollo.MutationResult<RemoveMentionFromCommentMutationResult>;
export type RemoveMentionFromCommentMutationOptions =
  Apollo.BaseMutationOptions<
    RemoveMentionFromCommentMutationResult,
    RemoveMentionFromCommentMutationVariables
  >;
export const UploadMediaDocument = gql`
  mutation UploadMedia($file: Upload!) {
    uploadMedia(file: $file) {
      id
      url
      name
      file_type
      s3_key
      size
      created_at
    }
  }
`;
export type UploadMediaMutationFn = Apollo.MutationFunction<
  UploadMediaMutationResult,
  UploadMediaMutationVariables
>;

/**
 * __useUploadMediaMutation__
 *
 * To run a mutation, you first call `useUploadMediaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadMediaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadMediaMutation, { data, loading, error }] = useUploadMediaMutation({
 *   variables: {
 *      file: // value for 'file'
 *   },
 * });
 */
export function useUploadMediaMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UploadMediaMutationResult,
    UploadMediaMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UploadMediaMutationResult,
    UploadMediaMutationVariables
  >(UploadMediaDocument, options);
}
export type UploadMediaMutationHookResult = ReturnType<
  typeof useUploadMediaMutation
>;
export type UploadMediaMutationResult =
  Apollo.MutationResult<UploadMediaMutationResult>;
export type UploadMediaMutationOptions = Apollo.BaseMutationOptions<
  UploadMediaMutationResult,
  UploadMediaMutationVariables
>;
export const DeleteMediaDocument = gql`
  mutation DeleteMedia($id: Int!) {
    deleteMedia(id: $id)
  }
`;
export type DeleteMediaMutationFn = Apollo.MutationFunction<
  DeleteMediaMutationResult,
  DeleteMediaMutationVariables
>;

/**
 * __useDeleteMediaMutation__
 *
 * To run a mutation, you first call `useDeleteMediaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMediaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMediaMutation, { data, loading, error }] = useDeleteMediaMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteMediaMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteMediaMutationResult,
    DeleteMediaMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteMediaMutationResult,
    DeleteMediaMutationVariables
  >(DeleteMediaDocument, options);
}
export type DeleteMediaMutationHookResult = ReturnType<
  typeof useDeleteMediaMutation
>;
export type DeleteMediaMutationResult =
  Apollo.MutationResult<DeleteMediaMutationResult>;
export type DeleteMediaMutationOptions = Apollo.BaseMutationOptions<
  DeleteMediaMutationResult,
  DeleteMediaMutationVariables
>;
export const CreateUserDocument = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      full_name
      email
      bio
      phone_number
      profile_image
      created_at
    }
  }
`;
export type CreateUserMutationFn = Apollo.MutationFunction<
  CreateUserMutationResult,
  CreateUserMutationVariables
>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateUserMutationResult,
    CreateUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateUserMutationResult,
    CreateUserMutationVariables
  >(CreateUserDocument, options);
}
export type CreateUserMutationHookResult = ReturnType<
  typeof useCreateUserMutation
>;
export type CreateUserMutationResult =
  Apollo.MutationResult<CreateUserMutationResult>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<
  CreateUserMutationResult,
  CreateUserMutationVariables
>;
export const UpdateUserDocument = gql`
  mutation UpdateUser($id: Int!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      full_name
      email
      bio
      phone_number
      profile_image
      created_at
    }
  }
`;
export type UpdateUserMutationFn = Apollo.MutationFunction<
  UpdateUserMutationResult,
  UpdateUserMutationVariables
>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserMutationResult,
    UpdateUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserMutationResult,
    UpdateUserMutationVariables
  >(UpdateUserDocument, options);
}
export type UpdateUserMutationHookResult = ReturnType<
  typeof useUpdateUserMutation
>;
export type UpdateUserMutationResult =
  Apollo.MutationResult<UpdateUserMutationResult>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserMutationResult,
  UpdateUserMutationVariables
>;
export const DeleteUserDocument = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;
export type DeleteUserMutationFn = Apollo.MutationFunction<
  DeleteUserMutationResult,
  DeleteUserMutationVariables
>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteUserMutationResult,
    DeleteUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteUserMutationResult,
    DeleteUserMutationVariables
  >(DeleteUserDocument, options);
}
export type DeleteUserMutationHookResult = ReturnType<
  typeof useDeleteUserMutation
>;
export type DeleteUserMutationResult =
  Apollo.MutationResult<DeleteUserMutationResult>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<
  DeleteUserMutationResult,
  DeleteUserMutationVariables
>;
export const AddUserToBriefDocument = gql`
  mutation AddUserToBrief($userId: Int!, $briefId: Int!) {
    addUserToBrief(userId: $userId, briefId: $briefId)
  }
`;
export type AddUserToBriefMutationFn = Apollo.MutationFunction<
  AddUserToBriefMutationResult,
  AddUserToBriefMutationVariables
>;

/**
 * __useAddUserToBriefMutation__
 *
 * To run a mutation, you first call `useAddUserToBriefMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserToBriefMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserToBriefMutation, { data, loading, error }] = useAddUserToBriefMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      briefId: // value for 'briefId'
 *   },
 * });
 */
export function useAddUserToBriefMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddUserToBriefMutationResult,
    AddUserToBriefMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddUserToBriefMutationResult,
    AddUserToBriefMutationVariables
  >(AddUserToBriefDocument, options);
}
export type AddUserToBriefMutationHookResult = ReturnType<
  typeof useAddUserToBriefMutation
>;
export type AddUserToBriefMutationResult =
  Apollo.MutationResult<AddUserToBriefMutationResult>;
export type AddUserToBriefMutationOptions = Apollo.BaseMutationOptions<
  AddUserToBriefMutationResult,
  AddUserToBriefMutationVariables
>;
export const RemoveUserFromBriefDocument = gql`
  mutation RemoveUserFromBrief($userId: Int!, $briefId: Int!) {
    removeUserFromBrief(userId: $userId, briefId: $briefId)
  }
`;
export type RemoveUserFromBriefMutationFn = Apollo.MutationFunction<
  RemoveUserFromBriefMutationResult,
  RemoveUserFromBriefMutationVariables
>;

/**
 * __useRemoveUserFromBriefMutation__
 *
 * To run a mutation, you first call `useRemoveUserFromBriefMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserFromBriefMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserFromBriefMutation, { data, loading, error }] = useRemoveUserFromBriefMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      briefId: // value for 'briefId'
 *   },
 * });
 */
export function useRemoveUserFromBriefMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveUserFromBriefMutationResult,
    RemoveUserFromBriefMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemoveUserFromBriefMutationResult,
    RemoveUserFromBriefMutationVariables
  >(RemoveUserFromBriefDocument, options);
}
export type RemoveUserFromBriefMutationHookResult = ReturnType<
  typeof useRemoveUserFromBriefMutation
>;
export type RemoveUserFromBriefMutationResult =
  Apollo.MutationResult<RemoveUserFromBriefMutationResult>;
export type RemoveUserFromBriefMutationOptions = Apollo.BaseMutationOptions<
  RemoveUserFromBriefMutationResult,
  RemoveUserFromBriefMutationVariables
>;
export const GetAssetsDocument = gql`
  query GetAssets(
    $filters: AssetFilters
    $sort: [AssetSort!]
    $pagination: PaginationInput
  ) {
    getAssets(filters: $filters, sort: $sort, pagination: $pagination) {
      assets {
        id
        name
        description
        media {
          id
          url
          file_type
        }
        thumbnail {
          id
          url
          file_type
        }
        tags {
          id
          name
        }
        comments {
          id
          text
          user {
            id
            full_name
            profile_image
          }
          created_at
        }
        briefs {
          id
          title
          description
          status
          created_at
        }
        created_at
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
`;

/**
 * __useGetAssetsQuery__
 *
 * To run a query within a React component, call `useGetAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssetsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      sort: // value for 'sort'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetAssetsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAssetsQueryResult,
    GetAssetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAssetsQueryResult, GetAssetsQueryVariables>(
    GetAssetsDocument,
    options,
  );
}
export function useGetAssetsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAssetsQueryResult,
    GetAssetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAssetsQueryResult, GetAssetsQueryVariables>(
    GetAssetsDocument,
    options,
  );
}
export function useGetAssetsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAssetsQueryResult,
        GetAssetsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetAssetsQueryResult, GetAssetsQueryVariables>(
    GetAssetsDocument,
    options,
  );
}
export type GetAssetsQueryHookResult = ReturnType<typeof useGetAssetsQuery>;
export type GetAssetsLazyQueryHookResult = ReturnType<
  typeof useGetAssetsLazyQuery
>;
export type GetAssetsSuspenseQueryHookResult = ReturnType<
  typeof useGetAssetsSuspenseQuery
>;
export type GetAssetsQueryResult = Apollo.QueryResult<
  GetAssetsQueryResult,
  GetAssetsQueryVariables
>;
export function refetchGetAssetsQuery(variables?: GetAssetsQueryVariables) {
  return { query: GetAssetsDocument, variables: variables };
}
export const GetAssetDocument = gql`
  query GetAsset($getAssetId: Int!) {
    getAsset(id: $getAssetId) {
      id
      media_id
      name
      description
      thumbnail_media_id
      created_at
      media {
        id
        url
        file_type
        created_at
      }
      thumbnail {
        id
        url
        file_type
        created_at
      }
      comments {
        id
        text
        user {
          id
          full_name
          email
          bio
          phone_number
          profile_image
          created_at
        }
      }
      tags {
        id
        name
      }
      briefs {
        id
        title
        about_hook
        about_target_audience
        created_at
        description
        go_live_on
        status
      }
    }
  }
`;

/**
 * __useGetAssetQuery__
 *
 * To run a query within a React component, call `useGetAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssetQuery({
 *   variables: {
 *      getAssetId: // value for 'getAssetId'
 *   },
 * });
 */
export function useGetAssetQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAssetQueryResult,
    GetAssetQueryVariables
  > &
    ({ variables: GetAssetQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAssetQueryResult, GetAssetQueryVariables>(
    GetAssetDocument,
    options,
  );
}
export function useGetAssetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAssetQueryResult,
    GetAssetQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAssetQueryResult, GetAssetQueryVariables>(
    GetAssetDocument,
    options,
  );
}
export function useGetAssetSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAssetQueryResult,
        GetAssetQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetAssetQueryResult, GetAssetQueryVariables>(
    GetAssetDocument,
    options,
  );
}
export type GetAssetQueryHookResult = ReturnType<typeof useGetAssetQuery>;
export type GetAssetLazyQueryHookResult = ReturnType<
  typeof useGetAssetLazyQuery
>;
export type GetAssetSuspenseQueryHookResult = ReturnType<
  typeof useGetAssetSuspenseQuery
>;
export type GetAssetQueryResult = Apollo.QueryResult<
  GetAssetQueryResult,
  GetAssetQueryVariables
>;
export function refetchGetAssetQuery(variables: GetAssetQueryVariables) {
  return { query: GetAssetDocument, variables: variables };
}
export const GetBriefDropDownsDocument = gql`
  query GetBriefDropDowns {
    getProducts {
      id
      name
      description
      created_at
    }
    getObjectives {
      id
      name
      description
      created_at
    }
    getTags {
      created_at
      id
      name
    }
  }
`;

/**
 * __useGetBriefDropDownsQuery__
 *
 * To run a query within a React component, call `useGetBriefDropDownsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBriefDropDownsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBriefDropDownsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBriefDropDownsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetBriefDropDownsQueryResult,
    GetBriefDropDownsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetBriefDropDownsQueryResult,
    GetBriefDropDownsQueryVariables
  >(GetBriefDropDownsDocument, options);
}
export function useGetBriefDropDownsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBriefDropDownsQueryResult,
    GetBriefDropDownsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetBriefDropDownsQueryResult,
    GetBriefDropDownsQueryVariables
  >(GetBriefDropDownsDocument, options);
}
export function useGetBriefDropDownsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBriefDropDownsQueryResult,
        GetBriefDropDownsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetBriefDropDownsQueryResult,
    GetBriefDropDownsQueryVariables
  >(GetBriefDropDownsDocument, options);
}
export type GetBriefDropDownsQueryHookResult = ReturnType<
  typeof useGetBriefDropDownsQuery
>;
export type GetBriefDropDownsLazyQueryHookResult = ReturnType<
  typeof useGetBriefDropDownsLazyQuery
>;
export type GetBriefDropDownsSuspenseQueryHookResult = ReturnType<
  typeof useGetBriefDropDownsSuspenseQuery
>;
export type GetBriefDropDownsQueryResult = Apollo.QueryResult<
  GetBriefDropDownsQueryResult,
  GetBriefDropDownsQueryVariables
>;
export function refetchGetBriefDropDownsQuery(
  variables?: GetBriefDropDownsQueryVariables,
) {
  return { query: GetBriefDropDownsDocument, variables: variables };
}
export const GetBriefsDocument = gql`
  query GetBriefs(
    $pagination: PaginationInput!
    $filters: BriefFilters
    $sort: [BriefSort]
  ) {
    getBriefs(pagination: $pagination, filters: $filters, sort: $sort) {
      briefs {
        id
        title
        description
        status
        created_at
        go_live_on
        about_target_audience
        about_hook
        product {
          id
          name
          description
        }
        objective {
          id
          name
          description
        }
        assets {
          id
          name
          description
          media_id
          thumbnail_media_id
          created_at
          media {
            id
            url
            file_type
          }
          thumbnail {
            id
            url
          }
          tags {
            id
            name
          }
        }
        comments {
          id
          text
          user_id
          created_at
          user {
            id
            full_name
            email
            profile_image
          }
          mentioned_users {
            id
            full_name
            email
            profile_image
          }
        }
        tags {
          id
          name
        }
        users {
          id
          full_name
          email
          profile_image
        }
        related_briefs {
          id
          title
          status
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
`;

/**
 * __useGetBriefsQuery__
 *
 * To run a query within a React component, call `useGetBriefsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBriefsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBriefsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *      filters: // value for 'filters'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetBriefsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBriefsQueryResult,
    GetBriefsQueryVariables
  > &
    (
      | { variables: GetBriefsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetBriefsQueryResult, GetBriefsQueryVariables>(
    GetBriefsDocument,
    options,
  );
}
export function useGetBriefsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBriefsQueryResult,
    GetBriefsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetBriefsQueryResult, GetBriefsQueryVariables>(
    GetBriefsDocument,
    options,
  );
}
export function useGetBriefsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBriefsQueryResult,
        GetBriefsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetBriefsQueryResult, GetBriefsQueryVariables>(
    GetBriefsDocument,
    options,
  );
}
export type GetBriefsQueryHookResult = ReturnType<typeof useGetBriefsQuery>;
export type GetBriefsLazyQueryHookResult = ReturnType<
  typeof useGetBriefsLazyQuery
>;
export type GetBriefsSuspenseQueryHookResult = ReturnType<
  typeof useGetBriefsSuspenseQuery
>;
export type GetBriefsQueryResult = Apollo.QueryResult<
  GetBriefsQueryResult,
  GetBriefsQueryVariables
>;
export function refetchGetBriefsQuery(variables: GetBriefsQueryVariables) {
  return { query: GetBriefsDocument, variables: variables };
}
export const GetBriefDocument = gql`
  query GetBrief($id: Int!) {
    getBrief(id: $id) {
      id
      title
      description
      status
      created_at
      go_live_on
      about_target_audience
      about_hook
      product {
        id
        name
        description
      }
      objective {
        id
        name
        description
      }
      assets {
        id
        name
        description
        media_id
        thumbnail_media_id
        created_at
        media {
          id
          url
          file_type
        }
        thumbnail {
          id
          url
        }
        tags {
          id
          name
        }
      }
      comments {
        id
        text
        user_id
        created_at
        user {
          id
          full_name
          email
          profile_image
        }
        mentioned_users {
          id
          full_name
          email
          profile_image
        }
      }
      tags {
        id
        name
      }
      users {
        id
        full_name
        email
        profile_image
      }
      related_briefs {
        id
        title
        status
      }
    }
  }
`;

/**
 * __useGetBriefQuery__
 *
 * To run a query within a React component, call `useGetBriefQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBriefQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBriefQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetBriefQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBriefQueryResult,
    GetBriefQueryVariables
  > &
    ({ variables: GetBriefQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetBriefQueryResult, GetBriefQueryVariables>(
    GetBriefDocument,
    options,
  );
}
export function useGetBriefLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBriefQueryResult,
    GetBriefQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetBriefQueryResult, GetBriefQueryVariables>(
    GetBriefDocument,
    options,
  );
}
export function useGetBriefSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetBriefQueryResult,
        GetBriefQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetBriefQueryResult, GetBriefQueryVariables>(
    GetBriefDocument,
    options,
  );
}
export type GetBriefQueryHookResult = ReturnType<typeof useGetBriefQuery>;
export type GetBriefLazyQueryHookResult = ReturnType<
  typeof useGetBriefLazyQuery
>;
export type GetBriefSuspenseQueryHookResult = ReturnType<
  typeof useGetBriefSuspenseQuery
>;
export type GetBriefQueryResult = Apollo.QueryResult<
  GetBriefQueryResult,
  GetBriefQueryVariables
>;
export function refetchGetBriefQuery(variables: GetBriefQueryVariables) {
  return { query: GetBriefDocument, variables: variables };
}
export const GetCommentDocument = gql`
  query GetComment($id: Int!) {
    getComment(id: $id) {
      id
      text
      created_at
      user {
        id
        full_name
        profile_image
      }
      mentioned_users {
        id
        full_name
        profile_image
      }
    }
  }
`;

/**
 * __useGetCommentQuery__
 *
 * To run a query within a React component, call `useGetCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCommentQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCommentQueryResult,
    GetCommentQueryVariables
  > &
    (
      | { variables: GetCommentQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCommentQueryResult, GetCommentQueryVariables>(
    GetCommentDocument,
    options,
  );
}
export function useGetCommentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentQueryResult,
    GetCommentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCommentQueryResult, GetCommentQueryVariables>(
    GetCommentDocument,
    options,
  );
}
export function useGetCommentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCommentQueryResult,
        GetCommentQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCommentQueryResult,
    GetCommentQueryVariables
  >(GetCommentDocument, options);
}
export type GetCommentQueryHookResult = ReturnType<typeof useGetCommentQuery>;
export type GetCommentLazyQueryHookResult = ReturnType<
  typeof useGetCommentLazyQuery
>;
export type GetCommentSuspenseQueryHookResult = ReturnType<
  typeof useGetCommentSuspenseQuery
>;
export type GetCommentQueryResult = Apollo.QueryResult<
  GetCommentQueryResult,
  GetCommentQueryVariables
>;
export function refetchGetCommentQuery(variables: GetCommentQueryVariables) {
  return { query: GetCommentDocument, variables: variables };
}
export const GetCommentsDocument = gql`
  query GetComments {
    getComments {
      id
      text
      created_at
      user {
        id
        full_name
        profile_image
      }
      mentioned_users {
        id
        full_name
        profile_image
      }
    }
  }
`;

/**
 * __useGetCommentsQuery__
 *
 * To run a query within a React component, call `useGetCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCommentsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCommentsQueryResult,
    GetCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCommentsQueryResult, GetCommentsQueryVariables>(
    GetCommentsDocument,
    options,
  );
}
export function useGetCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentsQueryResult,
    GetCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCommentsQueryResult, GetCommentsQueryVariables>(
    GetCommentsDocument,
    options,
  );
}
export function useGetCommentsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCommentsQueryResult,
        GetCommentsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCommentsQueryResult,
    GetCommentsQueryVariables
  >(GetCommentsDocument, options);
}
export type GetCommentsQueryHookResult = ReturnType<typeof useGetCommentsQuery>;
export type GetCommentsLazyQueryHookResult = ReturnType<
  typeof useGetCommentsLazyQuery
>;
export type GetCommentsSuspenseQueryHookResult = ReturnType<
  typeof useGetCommentsSuspenseQuery
>;
export type GetCommentsQueryResult = Apollo.QueryResult<
  GetCommentsQueryResult,
  GetCommentsQueryVariables
>;
export function refetchGetCommentsQuery(variables?: GetCommentsQueryVariables) {
  return { query: GetCommentsDocument, variables: variables };
}
export const GetCommentMentionsDocument = gql`
  query GetCommentMentions($commentId: Int!) {
    getCommentMentions(commentId: $commentId) {
      id
      user {
        id
        full_name
        profile_image
      }
    }
  }
`;

/**
 * __useGetCommentMentionsQuery__
 *
 * To run a query within a React component, call `useGetCommentMentionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentMentionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentMentionsQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useGetCommentMentionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCommentMentionsQueryResult,
    GetCommentMentionsQueryVariables
  > &
    (
      | { variables: GetCommentMentionsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCommentMentionsQueryResult,
    GetCommentMentionsQueryVariables
  >(GetCommentMentionsDocument, options);
}
export function useGetCommentMentionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentMentionsQueryResult,
    GetCommentMentionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCommentMentionsQueryResult,
    GetCommentMentionsQueryVariables
  >(GetCommentMentionsDocument, options);
}
export function useGetCommentMentionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCommentMentionsQueryResult,
        GetCommentMentionsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCommentMentionsQueryResult,
    GetCommentMentionsQueryVariables
  >(GetCommentMentionsDocument, options);
}
export type GetCommentMentionsQueryHookResult = ReturnType<
  typeof useGetCommentMentionsQuery
>;
export type GetCommentMentionsLazyQueryHookResult = ReturnType<
  typeof useGetCommentMentionsLazyQuery
>;
export type GetCommentMentionsSuspenseQueryHookResult = ReturnType<
  typeof useGetCommentMentionsSuspenseQuery
>;
export type GetCommentMentionsQueryResult = Apollo.QueryResult<
  GetCommentMentionsQueryResult,
  GetCommentMentionsQueryVariables
>;
export function refetchGetCommentMentionsQuery(
  variables: GetCommentMentionsQueryVariables,
) {
  return { query: GetCommentMentionsDocument, variables: variables };
}
export const GetTagsDocument = gql`
  query GetTags {
    getTags {
      created_at
      id
      name
    }
  }
`;

/**
 * __useGetTagsQuery__
 *
 * To run a query within a React component, call `useGetTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTagsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTagsQueryResult,
    GetTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTagsQueryResult, GetTagsQueryVariables>(
    GetTagsDocument,
    options,
  );
}
export function useGetTagsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTagsQueryResult,
    GetTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTagsQueryResult, GetTagsQueryVariables>(
    GetTagsDocument,
    options,
  );
}
export function useGetTagsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTagsQueryResult,
        GetTagsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetTagsQueryResult, GetTagsQueryVariables>(
    GetTagsDocument,
    options,
  );
}
export type GetTagsQueryHookResult = ReturnType<typeof useGetTagsQuery>;
export type GetTagsLazyQueryHookResult = ReturnType<typeof useGetTagsLazyQuery>;
export type GetTagsSuspenseQueryHookResult = ReturnType<
  typeof useGetTagsSuspenseQuery
>;
export type GetTagsQueryResult = Apollo.QueryResult<
  GetTagsQueryResult,
  GetTagsQueryVariables
>;
export function refetchGetTagsQuery(variables?: GetTagsQueryVariables) {
  return { query: GetTagsDocument, variables: variables };
}
export const GetUsersDocument = gql`
  query GetUsers(
    $filters: UserFilters
    $pagination: PaginationInput
    $sort: [UserSort]
  ) {
    getUsers(filters: $filters, pagination: $pagination, sort: $sort) {
      currentPage
      hasNextPage
      hasPreviousPage
      totalCount
      totalPages
      users {
        bio
        created_at
        email
        full_name
        id
        phone_number
        profile_image
      }
    }
  }
`;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUsersQueryResult,
    GetUsersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUsersQueryResult, GetUsersQueryVariables>(
    GetUsersDocument,
    options,
  );
}
export function useGetUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUsersQueryResult,
    GetUsersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUsersQueryResult, GetUsersQueryVariables>(
    GetUsersDocument,
    options,
  );
}
export function useGetUsersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUsersQueryResult,
        GetUsersQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUsersQueryResult, GetUsersQueryVariables>(
    GetUsersDocument,
    options,
  );
}
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<
  typeof useGetUsersLazyQuery
>;
export type GetUsersSuspenseQueryHookResult = ReturnType<
  typeof useGetUsersSuspenseQuery
>;
export type GetUsersQueryResult = Apollo.QueryResult<
  GetUsersQueryResult,
  GetUsersQueryVariables
>;
export function refetchGetUsersQuery(variables?: GetUsersQueryVariables) {
  return { query: GetUsersDocument, variables: variables };
}
export const GetUserDocument = gql`
  query GetUser($id: Int!) {
    getUser(id: $id) {
      id
      full_name
      email
      bio
      phone_number
      profile_image
      created_at
      briefs {
        id
        title
        status
      }
    }
  }
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserQueryResult,
    GetUserQueryVariables
  > &
    ({ variables: GetUserQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQueryResult, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserQueryResult,
    GetUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQueryResult, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
export function useGetUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserQueryResult,
        GetUserQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserQueryResult, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<
  typeof useGetUserSuspenseQuery
>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQueryResult,
  GetUserQueryVariables
>;
export function refetchGetUserQuery(variables: GetUserQueryVariables) {
  return { query: GetUserDocument, variables: variables };
}
export const GetUserBriefsDocument = gql`
  query GetUserBriefs($userId: Int!) {
    getUserBriefs(userId: $userId) {
      id
      title
      description
      status
      created_at
    }
  }
`;

/**
 * __useGetUserBriefsQuery__
 *
 * To run a query within a React component, call `useGetUserBriefsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserBriefsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserBriefsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserBriefsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserBriefsQueryResult,
    GetUserBriefsQueryVariables
  > &
    (
      | { variables: GetUserBriefsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserBriefsQueryResult, GetUserBriefsQueryVariables>(
    GetUserBriefsDocument,
    options,
  );
}
export function useGetUserBriefsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserBriefsQueryResult,
    GetUserBriefsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserBriefsQueryResult,
    GetUserBriefsQueryVariables
  >(GetUserBriefsDocument, options);
}
export function useGetUserBriefsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserBriefsQueryResult,
        GetUserBriefsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserBriefsQueryResult,
    GetUserBriefsQueryVariables
  >(GetUserBriefsDocument, options);
}
export type GetUserBriefsQueryHookResult = ReturnType<
  typeof useGetUserBriefsQuery
>;
export type GetUserBriefsLazyQueryHookResult = ReturnType<
  typeof useGetUserBriefsLazyQuery
>;
export type GetUserBriefsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserBriefsSuspenseQuery
>;
export type GetUserBriefsQueryResult = Apollo.QueryResult<
  GetUserBriefsQueryResult,
  GetUserBriefsQueryVariables
>;
export function refetchGetUserBriefsQuery(
  variables: GetUserBriefsQueryVariables,
) {
  return { query: GetUserBriefsDocument, variables: variables };
}
