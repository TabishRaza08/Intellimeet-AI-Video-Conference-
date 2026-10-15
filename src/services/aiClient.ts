import { MeetingSummary, TranscriptEntry } from '../types/meeting';

export interface CopilotResponse {
  answer: string;
  poweredBy: string;
}

export async function requestMeetingSummary(
  transcript: TranscriptEntry[],
  meetingTitle: string,
  agenda: string[] = []
): Promise<{ summary: MeetingSummary; poweredBy: string }> {
  try {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        meetingTitle,
        agenda,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const json = await res.json();
    return {
      summary: json.data,
      poweredBy: json.poweredBy || 'Gemini 3.8 Flash',
    };
  } catch (err: any) {
    console.error('Failed to request summary from backend:', err);
    throw err;
  }
}

export async function askAiCopilot(
  query: string,
  transcript: TranscriptEntry[],
  meetingTitle: string
): Promise<CopilotResponse> {
  try {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        transcript,
        meetingTitle,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const json = await res.json();
    return {
      answer: json.answer,
      poweredBy: json.poweredBy || 'Gemini 3.8 Flash',
    };
  } catch (err: any) {
    console.error('Failed to ask AI Copilot:', err);
    throw err;
  }
}

export async function generateAiAgenda(
  topic: string,
  durationMinutes = 30,
  participants: string[] = []
) {
  try {
    const res = await fetch('/api/ai/generate-agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, durationMinutes, participants }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Failed to generate agenda:', err);
    throw err;
  }
}

export async function getBackendHealth(): Promise<{ hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      return { hasGeminiKey: Boolean(data.hasGeminiKey) };
    }
  } catch (e) {
    // ignore
  }
  return { hasGeminiKey: false };
}
