export async function fetchAbout() {
  const res = await fetch('/api/knowledge/about');
  if (!res.ok) throw new Error('Failed to fetch about');
  return res.json();
}

export async function fetchOpenAi(systemPrompt: string, userPrompt: string) {
  const res = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  });
  if (!res.ok) throw new Error('Failed to fetch OpenAI response');
  return res.json();
}

export async function fetchTTS(text: string) {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to fetch TTS');
  return res.json();
}

export async function sendChatMessage(message: string, tts: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, tts }),
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
} 