import { useState, type FormEvent } from "react";

interface AddMemoryModalProps {
  onUpload: (
    file: File,
    caption: string,
    dateLabel: string,
    location?: string
  ) => Promise<void>;
  onClose: () => void;
}

export function AddMemoryModal({ onUpload, onClose }: AddMemoryModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [dateLabel, setDateLabel] = useState("25 Novembre 2026");
  const [location, setLocation] = useState("Madrid");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !caption.trim()) return;
    setSubmitting(true);
    try {
      await onUpload(file, caption.trim(), dateLabel.trim(), location.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="frame-mat modal-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 style={{ marginTop: 0, fontWeight: 500 }}>Nouveau souvenir</h2>

        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <input
          type="text"
          placeholder="Légende..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Date (ex: 25 Novembre 2026)"
          value={dateLabel}
          onChange={(e) => setDateLabel(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Lieu (optionnel)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="frame-controls">
          <button type="button" onClick={onClose} disabled={submitting}>
            Annuler
          </button>
          <button type="submit" disabled={submitting || !file}>
            {submitting ? "Envoi..." : "Ajouter au cadre"}
          </button>
        </div>
      </form>
    </div>
  );
}