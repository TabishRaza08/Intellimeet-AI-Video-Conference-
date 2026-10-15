/**
 * Speech Recognition and Live Transcription Service
 */

export interface SpeechRecognitionResultPayload {
  text: string;
  isFinal: boolean;
}

export class LiveSpeechTranscriptionService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback?: (result: SpeechRecognitionResultPayload) => void;
  private onErrorCallback?: (error: string) => void;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript.trim() && this.onResultCallback) {
            this.onResultCallback({ text: finalTranscript.trim(), isFinal: true });
          } else if (interimTranscript.trim() && this.onResultCallback) {
            this.onResultCallback({ text: interimTranscript.trim(), isFinal: false });
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.warn('SpeechRecognition error:', event.error);
            if (this.onErrorCallback) {
              this.onErrorCallback(event.error);
            }
          }
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {
              // ignore restart race condition
            }
          }
        };
      } catch (err) {
        console.warn('Could not initialize SpeechRecognition:', err);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onResult: (result: SpeechRecognitionResultPayload) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) return false;
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.isListening = true;

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      return false;
    }
  }

  public stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore
      }
    }
  }
}

// Enterprise simulation script snippets with User 2..5
export const SIMULATED_ENTERPRISE_TURNS = [
  {
    speakerId: 'peer-1',
    speakerName: 'User 2',
    speakerRole: 'Participant',
    speakerAvatar: 'U2',
    text: "Let's ensure the autoscaling threshold triggers at 70% CPU so we don't encounter throttling during peak traffic.",
  },
  {
    speakerId: 'peer-3',
    speakerName: 'User 4',
    speakerRole: 'Participant',
    speakerAvatar: 'U4',
    text: "Agreed. I ran latency benchmarks and confirmed sustained chunk processing times under 350ms.",
  },
  {
    speakerId: 'peer-2',
    speakerName: 'User 3',
    speakerRole: 'Participant',
    speakerAvatar: 'U3',
    text: "That aligns with the spec. Auto-exporting the extracted action items with assignees pre-filled will keep the team aligned.",
  },
  {
    speakerId: 'peer-4',
    speakerName: 'User 5',
    speakerRole: 'Participant',
    speakerAvatar: 'U5',
    text: "From a compliance standpoint, that's verified. The audit logs will record timestamps before processing audio buffers.",
  },
  {
    speakerId: 'peer-1',
    speakerName: 'User 2',
    speakerRole: 'Participant',
    speakerAvatar: 'U2',
    text: "Let's mark this decision as approved and proceed with sprint deliverables.",
  },
];
