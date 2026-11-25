import { useState, type FormEvent, type ReactNode } from "react";
import "./PinGate.css";

const STORAGE_KEY = "salon_privado_unlocked";

interface PinGateProps {
  children: ReactNode;
}

export function PinGate({ children }: PinGateProps) {
  const expectedPin = (import.meta.env.VITE_SALON_PIN as string | undefined)?.trim();

  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (!expectedPin) return true;
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) {
    return <>{children}</>;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin.trim() === expectedPin) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setError(false);
      setUnlocked(true);
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <main className="pin-stage" aria-label="Accès protégé par code PIN">
      <form className="frame-mat pin-card" onSubmit={handleSubmit}>
        <p className="frame-tag pin-eyebrow">SALON PRIVÉ</p>
        <h1 className="pin-title">Code d&apos;accès</h1>

        <input
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={12}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (error) setError(false);
          }}
          placeholder="••••"
          aria-label="Code PIN"
          className="pin-input"
          autoFocus
        />

        {error && <p className="pin-error">Code incorrect</p>}

        <div className="frame-controls">
          <button type="submit">Déverrouiller</button>
        </div>
      </form>
    </main>
  );
}