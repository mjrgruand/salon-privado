import { PinGate } from "./components/PinGate";
import { PhotoFrame } from "./components/PhotoFrame";

export function App() {
  return (
    <PinGate>
      <PhotoFrame startDateIso="2026-10-10" />
    </PinGate>
  );
}

export default App;