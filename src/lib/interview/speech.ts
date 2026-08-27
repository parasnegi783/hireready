export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

interface STTHandle {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function createSTT(
  onResult: (transcript: string, isFinal: boolean) => void,
  onEnd: () => void,
  onError: (msg: string) => void,
): STTHandle {
  if (typeof window === "undefined") {
    return { start: () => {}, stop: () => {}, isSupported: false };
  }

  const SR =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SR) {
    onError("Speech recognition is not supported in this browser");
    return { start: () => {}, stop: () => {}, isSupported: false };
  }

  const recognition = new SR() as any;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript, true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onend = () => onEnd();
  recognition.onerror = (event: any) => {
    if (event.error !== "aborted") {
      onError(`Speech recognition error: ${event.error}`);
    }
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch {}
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {}
    },
    isSupported: true,
  };
}
