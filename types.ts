export enum Author {
  USER = 'user',
  BOT = 'bot',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface MessageImage {
  url: string;      // Blob URL for display
  base64: string;   // Base64 data for API
  mimeType: string; // Mime type for API
}

export interface Message {
  author: Author;
  text: string;
  sources?: GroundingSource[];
  image?: MessageImage;
  isError?: boolean;
}