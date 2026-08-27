export function createAudioMonitor() {
  let secondVoiceEvents = 0;
  let analyser: AnalyserNode | null = null;
  let audioCtx: AudioContext | null = null;
  let rafId: number | null = null;
  let active = false;
  let userSpeaking = false;
  let speechEnergyFrames = 0;

  const SPEECH_THRESHOLD = 30;
  const FRAMES_FOR_DETECTION = 15; // ~1.5s at 10 fps

  function analyze() {
    if (!active || !analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // Speech band: roughly 300-3000 Hz (bins depend on sample rate)
    const sampleRate = audioCtx?.sampleRate || 44100;
    const binSize = sampleRate / (analyser.fftSize || 2048);
    const lowBin = Math.floor(300 / binSize);
    const highBin = Math.min(Math.floor(3000 / binSize), data.length - 1);

    let sum = 0;
    for (let i = lowBin; i <= highBin; i++) {
      sum += data[i];
    }
    const avg = sum / (highBin - lowBin + 1);

    if (!userSpeaking && avg > SPEECH_THRESHOLD) {
      speechEnergyFrames++;
      if (speechEnergyFrames >= FRAMES_FOR_DETECTION) {
        secondVoiceEvents++;
        speechEnergyFrames = 0;
      }
    } else {
      speechEnergyFrames = 0;
    }

    rafId = requestAnimationFrame(() => {
      setTimeout(analyze, 100); // ~10 fps
    });
  }

  return {
    start(stream: MediaStream) {
      try {
        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        active = true;
        secondVoiceEvents = 0;
        analyze();
      } catch (e) {
        console.warn("Audio monitor failed to start:", e);
      }
    },

    stop() {
      active = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      audioCtx?.close().catch(() => {});
      analyser = null;
      audioCtx = null;
    },

    setUserSpeaking(speaking: boolean) {
      userSpeaking = speaking;
      speechEnergyFrames = 0;
    },

    getEvents() {
      return secondVoiceEvents;
    },
  };
}
