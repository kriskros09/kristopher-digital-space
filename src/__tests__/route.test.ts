/**
 * @jest-environment node
 */
import { POST } from '../app/api/chat/route';
import { NextRequest } from 'next/server';

process.env.OPENAI_API_KEY_PRIVATE = 'test-key';

jest.mock('@/lib/knowledge', () => ({
  getKnowledge: jest.fn().mockResolvedValue({
    about: 'about',
    links: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      portfolio: 'https://your-portfolio.com',
    },
    markdown: 'about\n\n## Links\n- [LinkedIn](https://linkedin.com)\n- [GitHub](https://github.com)\n- [Portfolio](https://your-portfolio.com)',
  }),
}));

jest.mock('@/lib/projects', () => ({
  getProjects: jest.fn().mockResolvedValue([{ name: 'Test Project', slug: 'test' }]),
}));

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: function OpenAI() {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'AI response' } }],
            }),
          },
        },
      };
    },
  };
});

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
  });
});

describe('/api/chat', () => {
  it('returns error for invalid request', async () => {
    const req = makeRequest({ tts: true }); // boolean, should be string
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('returns project-list for project keyword', async () => {
    const req = makeRequest({ message: 'show me your projects', tts: 'true' });
    const res = await POST(req);
    const data = await res.json();
    expect(data.type).toBe('project-list');
    expect(Array.isArray(data.projects)).toBe(true);
  });

  it('returns contact-info for contact keyword', async () => {
    const req = makeRequest({ message: 'how can I contact you?', tts: 'true' });
    const res = await POST(req);
    const data = await res.json();
    expect(data.type).toBe('contact-info');
    expect(Array.isArray(data.contacts)).toBe(true);
  });

  it('returns aiMessage for normal message', async () => {
    const req = makeRequest({ message: 'hello', tts: 'true' });
    const res = await POST(req);
    const data = await res.json();
    expect(data.aiMessage).toBe('AI response');
  });
}); 