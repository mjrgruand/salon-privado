import { useEffect, useState, useCallback } from "react";
import { useMemories } from "../hooks/useMemories";
import { AddMemoryModal } from "./AddMemory";
import "./PhotoFrame.css";

interface PhotoFrameProps {
  startDateIso: string; // ex: "2026-10-25"
  autoplayIntervalMs?: number;
}

function getDaysTogether(startDateIso: string): number {
  const start = new Date(`${startDateIso}T00:00:00`).getTime();
  const now = Date.now();
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
}

export function PhotoFrame({
  startDateIso,
  autoplayIntervalMs = 6000,
}: PhotoFrameProps) {
  const { memories, loading, uploadMemory } = useMemories();
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const total = memories.length;
  const safeIndex = total > 0 ? index % total : 0;
  const current = memories[safeIndex];
  const daysCount = getDaysTogether(startDateIso);

  const next = useCallback(() => {
    if (total === 0) return;
    setIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!isPlaying || total <= 1 || isModalOpen) return;
    const timer = window.setInterval(next, autoplayIntervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, total, autoplayIntervalMs, next, isModalOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, isModalOpen]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <section className="frame-stage" aria-label="Chargement du cadre">
        <span className="frame-tag">SALON PRIVÉ · CHARGEMENT...</span>
      </section>
    );
  }

  if (!current) return null;

  return (
    <section
      className={`frame-stage ${isFullscreen ? "frame-stage--immersive" : ""}`}
      aria-label="Cadre photo privé"
    >
      <header className="frame-header">
        <span className="frame-tag">SALON PRIVÉ · I MOIS</span>
        <span className="frame-counter">{daysCount} JOURS</span>
      </header>

      <div className="frame-mat">
        <div className="frame-bezel">
          <img
            src={current.image_url}
            alt={current.caption}
            className="frame-photo"
          />
        </div>

        <footer className="frame-caption-block">
          <p className="frame-caption">{current.caption}</p>
          <div className="frame-meta">
            <span>{current.date_label}</span>
            {current.location && <span>· {current.location}</span>}
            <span>
              · {safeIndex + 1} / {total}
            </span>
          </div>
        </footer>
      </div>

      <div className="frame-controls">
        <button type="button" onClick={prev} aria-label="Photo précédente">
          Précédent
        </button>
        <button type="button" onClick={() => setIsPlaying((p) => !p)}>
          {isPlaying ? "Pause" : "Lecture"}
        </button>
        <button type="button" onClick={next} aria-label="Photo suivante">
          Suivant
        </button>
        <button type="button" onClick={toggleFullscreen}>
          {isFullscreen ? "Quitter plein écran" : "Mode cadre"}
        </button>
        <button type="button" onClick={() => setIsModalOpen(true)}>
          Ajouter
        </button>
      </div>

      {isModalOpen && (
        <AddMemoryModal
          onUpload={uploadMemory}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}