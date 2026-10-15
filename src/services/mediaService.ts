/**
 * Media and Audio Visualizer Utilities for WebRTC & Local Media Streams
 */

export interface MediaState {
  stream: MediaStream | null;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
}

export async function initLocalUserMedia(
  audioEnabled = true,
  videoEnabled = true
): Promise<{ stream: MediaStream | null; error?: string }> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { stream: null, error: 'Media devices API not supported in this browser' };
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: audioEnabled,
      video: videoEnabled
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          }
        : false,
    });

    return { stream };
  } catch (err: any) {
    console.warn('getUserMedia request warning:', err.name, err.message);
    return {
      stream: null,
      error:
        err.name === 'NotAllowedError'
          ? 'Camera/microphone access was denied or blocked in your browser settings.'
          : err.name === 'NotFoundError'
          ? 'No camera or microphone hardware found.'
          : err.message || 'Could not access media devices',
    };
  }
}

export async function initScreenShare(): Promise<{ stream: MediaStream | null; error?: string }> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return { stream: null, error: 'Screen sharing is not supported by this browser.' };
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' } as any,
      audio: false,
    });
    return { stream };
  } catch (err: any) {
    console.warn('getDisplayMedia error:', err);
    return { stream: null, error: err.message || 'Screen sharing cancelled' };
  }
}

export function createAudioAnalyser(
  stream: MediaStream,
  onVolumeChange: (volume: number) => void
): { cleanup: () => void } {
  try {
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return { cleanup: () => {} };

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return { cleanup: () => {} };

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Normalize to 0 - 100
      const normalizedVolume = Math.min(100, Math.round((average / 255) * 160));
      onVolumeChange(normalizedVolume);
      animationFrameId = requestAnimationFrame(checkVolume);
    };

    checkVolume();

    return {
      cleanup: () => {
        cancelAnimationFrame(animationFrameId);
        try {
          source.disconnect();
          analyser.disconnect();
          audioContext.close();
        } catch (e) {
          // ignore
        }
      },
    };
  } catch (e) {
    console.warn('Audio analyser setup error:', e);
    return { cleanup: () => {} };
  }
}
