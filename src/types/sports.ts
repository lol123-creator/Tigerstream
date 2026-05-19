export interface PpvSubstream {
  id: number;
  name: string;
  tag: string;
  uri_name: string;
  source_tag?: string;
  iframe?: string;
}

export interface PpvStream {
  id: number;
  name: string;
  tag: string;
  source_tag?: string;
  poster: string;
  uri_name: string;
  starts_at: number;
  ends_at: number;
  always_live: number;
  category_name: string;
  category_id: number;
  iframe?: string;
  viewers?: string;
  allowpaststreams?: number;
  substreams?: PpvSubstream[];
}

export interface PpvCategory {
  category: string;
  id: number;
  always_live: boolean;
  streams: PpvStream[];
}

export interface PpvStreamsResponse {
  success: boolean;
  timestamp: number;
  streams: PpvCategory[];
}
