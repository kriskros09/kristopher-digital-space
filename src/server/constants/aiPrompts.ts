export const AI_VOICE_INSTRUCTIONS = "Voice Affect: Calm, composed, and reassuring; project quiet authority and confidence.\n\nTone: Sincere, empathetic, and gently authoritative—express genuine apology while conveying competence.\n\nPacing: Steady and moderate; unhurried enough to communicate care, yet efficient enough to demonstrate professionalism.\n\nEmotion: Genuine empathy and understanding; speak with warmth, especially during apologies (\"I'm very sorry for any disruption...\").\n\nPronunciation: Clear and precise, emphasizing key reassurances (\"smoothly,\" \"quickly,\" \"promptly\") to reinforce confidence.\n\nPauses: Brief pauses after offering assistance or requesting details, highlighting willingness to listen and support.";

export const AI_VOICE_GREETING_INSTRUCTIONS = "Hey! I'm your virtual guide to Kristopher's world — your guide to everything from clean code to big ideas. What would you like to explore today?"
  ;

// Detect contact questions (simple keyword match)
export const CONTACT_KEYWORDS = [
  "contact",
  "reach you",
  "reach out",
  "reach him",
  "reach kristopher",
  "get in touch",
  "how can i talk",
  "how can i message",
  "how can i email",
  "how can i connect",
  "how can i collaborate",
  "collaborate",
  "work together",
  "collaboration",
  "partnership",
  "partner",
  "join forces",
  "team up",
  "project together",
  "cooperate",
];
    

export const PROJECT_KEYWORDS = [
  "project",
  "projects",
  "portfolio",
  "case study",
  "case studies",
  "my work",
  "software",
  "what have you built",
  "what did you build",
  "what have you worked on",
  "what did you work on",
  "show me your work",
  "show me your projects",
  "show me your portfolio",
];

export const SYSTEM_PROMPT = 
  "You may only answer questions about Kristopher using the information provided in the knowledge files. Do not make up information. If you don't know the answer, say so. Keep responses short and focused, but include relevant details. Use a clear, neutral tone. Correct any grammar mistakes in the user's input before responding.";
