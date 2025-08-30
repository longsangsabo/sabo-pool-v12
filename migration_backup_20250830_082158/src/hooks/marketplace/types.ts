export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description: string | undefined;
  category: string | undefined;
  condition: string | undefined;
  price: number;
  original_price?: number | null;
  brand?: string | undefined;
  model?: string | undefined;
  specifications?: any;
  images: string[] | null;
  location: string | undefined;
  status: string;
  views_count: number | null;
  favorites_count: number | null;
  created_at: string;
  updated_at: string;
  seller?: {
    id: string;
    full_name: string | undefined;
    nickname: string | undefined;
    avatar_url: string | undefined;
    club_id: string | undefined;
    province_id: string | undefined;
    provinces?: {
      name: string;
      region: string | undefined;
    } | null;
    total_items?: number;
    avg_response_time?: number;
  } | null;
  marketplace_reviews?: {
    rating: number;
    review_text: string | undefined;
  }[];
  shipping_available?: boolean;
}
