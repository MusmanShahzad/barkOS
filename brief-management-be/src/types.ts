export interface User {
  id: number;
  full_name?: string;
  email?: string;
  bio?: string;
  phone_number?: string;
  profile_image?: string;
  created_at: string;
}

export interface Asset {
  id: number;
  media_id: number;
  name?: string;
  description?: string;
  thumbnail_media_id?: number;
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
  title?: string;
  description?: string;
  created_at: string;
  go_live_on?: string;
  about_target_audience?: string;
  about_hook?: string;
  status?: BriefStatus;
  product_id?: number;
  objective_id?: number;
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
  text?: string;
  user_id?: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name?: string;
  created_at?: string;
}

export interface Media {
  id: number;
  url?: string;
  type?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name?: string;
  description?: string;
  created_at: string;
}

export interface Objective {
  id: number;
  name?: string;
  description?: string;
  created_at: string;
}

export interface Context {
  token?: string;
} 