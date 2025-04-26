export interface Asset {
  id: number;
  media_id: number;
  name: string | null;
  description: string | null;
  thumbnail_media_id: number | null;
  created_at: string;
}

export interface AssetComment {
  id: number;
  created_at: string;
  asset_id: number | null;
  comment_id: number | null;
}

export interface AssetTag {
  id: number;
  tag_id: number | null;
  asset_id: number | null;
  created_at: string;
}

export enum BriefStatus {
  Draft = 'Draft',
  Review = 'Review',
  Approved = 'Approved',
  Live = 'Live'
}

export interface Brief {
  id: number;
  created_at: string;
  // Adding common brief fields since they're referenced in relationships
  title?: string | null;
  description?: string | null;
  go_live_on?: string | null;
  about_target_audience?: string | null;
  about_hook?: string | null;
  product_id?: number | null;
  objective_id?: number | null;
  status?: BriefStatus | null;
}

export interface BriefAsset {
  id: number;
  brief_id: number | null;
  asset_id: number | null;
  created_at: string;
}

export interface BriefComment {
  id: number;
  created_at: string;
  brief_id: number | null;
  comment_id: number | null;
}

export interface BriefTag {
  id: number;
  brief_id: number | null;
  tag_id: number | null;
  created_at: string;
}

export interface Comment {
  id: number;
  // Adding common comment fields since they're referenced
  text?: string | null;
  user_id?: number | null;
  created_at: string;
}

export interface Tag {
  id: number;
  // Adding common tag fields
  name?: string | null;
  created_at?: string;
}

export interface Media {
  id: number;
  // Adding common media fields
  url?: string | null;
  type?: string | null;
  created_at?: string;
}

export interface Product {
  id: number;
  created_at: string;
  name: string | null;
  description: string | null;
}

export interface Objective {
  id: number;
  name: string | null;
  description: string | null;
  created_at: string;
} 