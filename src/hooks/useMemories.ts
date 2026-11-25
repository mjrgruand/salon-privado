import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { INITIAL_MEMORIES } from "../data/memories";

export interface MemoryItem {
  id: string;
  image_url: string;
  caption: string;
  date_label: string;
  location?: string | null;
  created_at: string;
}

export function useMemories() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let active = true;

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: true });

      if (!active) return;

      if (!error && data && data.length > 0) {
        setMemories(data);
      } else {
        setMemories(INITIAL_MEMORIES);
      }
    } catch {
      if (active) setMemories(INITIAL_MEMORIES);
    } finally {
      if (active) setLoading(false);
    }
  };

  fetchAll();

  const channel = supabase
    .channel("memories-live")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "memories" },
      (payload) => {
        setMemories((prev) => [...prev, payload.new as MemoryItem]);
      }
    )
    .subscribe();

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}, []);

  const uploadMemory = async (
    file: File,
    caption: string,
    dateLabel: string,
    location?: string
  ) => {
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("memories")
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("memories")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("memories").insert({
      image_url: urlData.publicUrl,
      caption,
      date_label: dateLabel,
      location: location || null,
    });

    if (insertError) throw insertError;
  };

  return { memories, loading, uploadMemory };
}