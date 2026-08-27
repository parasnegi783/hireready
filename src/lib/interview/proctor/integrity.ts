import type { IntegritySignals } from "@/types";
import type { FaceSignals } from "./face";

export function computeIntegrity(
  faceSignals: FaceSignals,
  tabSwitchCount: number,
  secondVoiceEvents: number,
): IntegritySignals {
  let score = 100;

  // Tab switches: -10 each, capped at -40
  score -= Math.min(tabSwitchCount * 10, 40);

  // Multiple faces: -5 each, capped at -20
  score -= Math.min(faceSignals.multipleFacesEvents * 5, 20);

  // Look-aways: -2 each, capped at -20
  score -= Math.min(faceSignals.lookAwayCount * 2, 20);

  // No face: -5 per 10 seconds, capped at -15
  score -= Math.min(Math.floor(faceSignals.noFaceSeconds / 10) * 5, 15);

  // Second voice: -3 each, capped at -15
  score -= Math.min(secondVoiceEvents * 3, 15);

  return {
    lookAwayCount: faceSignals.lookAwayCount,
    lookAwaySeconds: Math.round(faceSignals.lookAwaySeconds),
    multipleFacesEvents: faceSignals.multipleFacesEvents,
    noFaceSeconds: Math.round(faceSignals.noFaceSeconds),
    tabSwitchCount,
    secondVoiceEvents,
    integrityScore: Math.max(0, Math.min(100, score)),
  };
}
