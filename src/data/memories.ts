export interface MemoryItem {
  id: string;
  image_url: string;
  caption: string;
  date_label: string;
  location?: string | null;
  created_at: string;
}

export const INITIAL_MEMORIES: MemoryItem[] = [
 
];