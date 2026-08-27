export interface FaceSignals {
  lookAwayCount: number;
  lookAwaySeconds: number;
  multipleFacesEvents: number;
  noFaceSeconds: number;
}

export function createFaceMonitor() {
  let signals: FaceSignals = {
    lookAwayCount: 0,
    lookAwaySeconds: 0,
    multipleFacesEvents: 0,
    noFaceSeconds: 0,
  };

  let active = false;
  let faceLandmarker: unknown = null;
  let rafId: number | null = null;
  let frameCount = 0;
  let lastTimestamp = 0;

  // Gaze tracking state
  let gazeOffStart = 0;
  let gazeIsOff = false;
  // No-face tracking state
  let noFaceStart = 0;
  let noFaceActive = false;

  const GAZE_YAW_THRESHOLD = 25; // degrees
  const GAZE_OFF_MIN_DURATION = 1.5; // seconds
  const NO_FACE_MIN_DURATION = 2; // seconds

  async function loadMediaPipe() {
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 2,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: true,
      });

      return true;
    } catch (e) {
      console.warn("MediaPipe face detection unavailable:", e);
      return false;
    }
  }

  function processFrame(video: HTMLVideoElement) {
    if (!active || !faceLandmarker) return;

    frameCount++;
    // Throttle to ~8 fps
    if (frameCount % 4 !== 0) {
      rafId = requestAnimationFrame(() => processFrame(video));
      return;
    }

    const now = performance.now();
    const deltaSeconds = lastTimestamp ? (now - lastTimestamp) / 1000 : 0;
    lastTimestamp = now;

    try {
      const lm = faceLandmarker as {
        detectForVideo: (
          video: HTMLVideoElement,
          timestamp: number,
        ) => {
          faceLandmarks: unknown[][];
          facialTransformationMatrixes: { data: Float32Array }[];
        };
      };

      const results = lm.detectForVideo(video, now);
      const faceCount = results.faceLandmarks?.length || 0;

      // Multiple faces
      if (faceCount > 1) {
        signals.multipleFacesEvents++;
      }

      // No face
      if (faceCount === 0) {
        if (!noFaceActive) {
          noFaceActive = true;
          noFaceStart = now;
        } else if ((now - noFaceStart) / 1000 >= NO_FACE_MIN_DURATION) {
          signals.noFaceSeconds += deltaSeconds;
        }
      } else {
        noFaceActive = false;
      }

      // Gaze estimation from transformation matrix
      if (faceCount >= 1 && results.facialTransformationMatrixes?.length) {
        const matrix = results.facialTransformationMatrixes[0].data;
        // Extract yaw from rotation matrix (approximate)
        const yawRad = Math.atan2(matrix[8], matrix[0]);
        const yawDeg = Math.abs(yawRad * (180 / Math.PI));

        if (yawDeg > GAZE_YAW_THRESHOLD) {
          if (!gazeIsOff) {
            gazeIsOff = true;
            gazeOffStart = now;
          } else if ((now - gazeOffStart) / 1000 >= GAZE_OFF_MIN_DURATION) {
            if ((now - gazeOffStart) / 1000 < GAZE_OFF_MIN_DURATION + 0.2) {
              signals.lookAwayCount++;
            }
            signals.lookAwaySeconds += deltaSeconds;
          }
        } else {
          gazeIsOff = false;
        }
      }
    } catch (e) {
      console.warn("Face detection frame error:", e);
    }

    rafId = requestAnimationFrame(() => processFrame(video));
  }

  return {
    async start(video: HTMLVideoElement): Promise<boolean> {
      const loaded = await loadMediaPipe();
      if (!loaded) return false;

      signals = {
        lookAwayCount: 0,
        lookAwaySeconds: 0,
        multipleFacesEvents: 0,
        noFaceSeconds: 0,
      };
      active = true;
      frameCount = 0;
      lastTimestamp = 0;
      gazeIsOff = false;
      noFaceActive = false;

      rafId = requestAnimationFrame(() => processFrame(video));
      return true;
    },

    stop() {
      active = false;
      if (rafId != null) cancelAnimationFrame(rafId);
    },

    getSignals(): FaceSignals {
      return { ...signals };
    },
  };
}
