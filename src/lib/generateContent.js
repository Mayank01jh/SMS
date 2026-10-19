/**
 * Real AI generation via OpenAI or Gemini API.
 * Falls back to demo content when no API key is configured.
 */

import { loadSettings } from './storage.js';

// ── Prompt builders ────────────────────────────────────────

function buildSystemPrompt(type) {
  return `You are Study Material Studio, an AI that creates structured, academically rigorous study materials.
Your role is to help students UNDERSTAND concepts deeply — not to write work they'll submit as their own.
Always:
- Use clear headings and structure
- Distinguish between generated explanation and cited source material
- Include self-check questions
- Flag uncertain claims with "> ⚠️ Verify this claim"
- Use **bold** for key terms, bullet points for lists

For "${type}" format your response as JSON with this exact structure:
{
  "studyGuide": {
    "title": "string",
    "sections": [
      { "id": "s1", "heading": "string", "body": "string (markdown)" }
    ]
  },
  "revisionCard": {
    "title": "string",
    "sections": [
      { "label": "string", "content": "string" }
    ]
  }
}`;
}

function buildUserPrompt(type, topic, sourceMaterial) {
  let prompt = `Create a ${type} for the topic: "${topic}"`;
  if (sourceMaterial && sourceMaterial.trim()) {
    prompt += `\n\nSource material provided by the student (prioritize this; cite it explicitly):\n---\n${sourceMaterial.slice(0, 4000)}\n---`;
  }
  return prompt;
}

// ── OpenAI ────────────────────────────────────────────────

async function generateWithOpenAI(settings, type, topic, sourceMaterial, onProgress) {
  onProgress({ label: 'Connecting to OpenAI…', pct: 10 });
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.openaiModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(type) },
        { role: 'user', content: buildUserPrompt(type, topic, sourceMaterial) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3500,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error ${response.status}`);
  }

  onProgress({ label: 'Processing response…', pct: 85 });
  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed;
}

// ── Gemini ────────────────────────────────────────────────

async function generateWithGemini(settings, type, topic, sourceMaterial, onProgress) {
  const model = settings.geminiModel || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`;

  onProgress({ label: 'Connecting to Gemini…', pct: 10 });

  const prompt = buildSystemPrompt(type) + '\n\n' + buildUserPrompt(type, topic, sourceMaterial);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 3500,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error ${response.status}`);
  }

  onProgress({ label: 'Processing response…', pct: 85 });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}

// ── Demo fallback ─────────────────────────────────────────

function buildDemoContent(type, topic, sourceMaterial) {
  const hasSrc = sourceMaterial && sourceMaterial.trim().length > 10;

  const guideBase = {
    'concept-guide': {
      title: `Concept Guide: ${topic}`,
      sections: [
        { id: 's1', heading: '1. Overview', body: `${topic} is a foundational concept with broad applications. This guide breaks it down so you can understand, apply, and discuss it confidently.\n\n${hasSrc ? `From your source material: "${sourceMaterial.slice(0, 200).trim()}…"` : 'This guide draws on standard academic explanations.'}` },
        { id: 's2', heading: '2. Core Definitions', body: `**${topic}** refers to the set of principles, mechanisms and relationships that govern its domain.\n\nKey related terms:\n- **Term A**: The foundational unit or building block\n- **Term B**: The process by which Term A transforms\n- **Term C**: The measurable output or effect` },
        { id: 's3', heading: '3. Conceptual Explanation', body: `To understand ${topic}, consider three layers:\n\n**Layer 1 — Structural**: What components exist and how are they arranged?\n\n**Layer 2 — Functional**: What does each component do and how do they interact?\n\n**Layer 3 — Dynamic**: How does the system behave over time or under change?` },
        { id: 's4', heading: '4. Worked Example', body: `**Scenario**: Applying ${topic} in a real-world context.\n\n*Step 1* — Identify the key variables at play\n*Step 2* — Apply the core definition to classify what is happening\n*Step 3* — Predict the outcome using the relationships described above\n*Step 4* — Verify against known benchmarks\n\n> ⚠️ This example is illustrative. Verify against your specific course materials.` },
        { id: 's5', heading: '5. Common Misconceptions', body: `Many learners confuse ${topic} with adjacent concepts:\n\n- It is **not** the same as [related term] — which focuses on a different aspect\n- The mechanism is **not** always linear; feedback loops matter\n- Memorising definitions is **insufficient** — contextual application is what assessments test` },
        { id: 's6', heading: '6. Self-Check Questions', body: `Test your understanding:\n\n1. In your own words, what is ${topic}?\n2. What are the three main components?\n3. How would you distinguish it from a closely related concept?\n4. Apply the worked example to a different context. Does the same logic hold?\n5. What question do you still have? Write it down and look it up.` },
      ],
    },
    'practice-breakdown': {
      title: `Practice Breakdown: ${topic}`,
      sections: [
        { id: 's1', heading: '1. Understanding the Problem', body: `Before solving problems involving ${topic}:\n\n- Identify what is being asked (the expected output)\n- List all given information\n- Note constraints or conditions\n- Ask: which concept or formula applies?` },
        { id: 's2', heading: '2. Step-by-Step Method', body: `**Step 1** — Restate what you need to find\n**Step 2** — Choose the relevant method or formula\n**Step 3** — Substitute known values\n**Step 4** — Solve, showing all working\n**Step 5** — Check: does the answer make sense?\n\n> ⚠️ Paste source material to get worked examples tailored to your actual question set.` },
        { id: 's3', heading: '3. Common Error Patterns', body: `Students frequently lose marks on ${topic} problems by:\n\n- Skipping Step 1 (missing what is actually asked)\n- Applying the wrong formula for the context\n- Arithmetic errors in substitution\n- Not checking the final answer against reasonable bounds` },
        { id: 's4', heading: '4. Practice Problems', body: `Attempt each before checking:\n\n**Q1** — Straightforward application of core method\n**Q2** — Slight variation requiring one extra step\n**Q3** — Multi-step problem combining two ideas\n\nWrite your working on paper first. Compare process, not just answer.` },
        { id: 's5', heading: '5. Self-Check', body: `1. Which step was hardest? Why?\n2. Could you solve Q3 a different way?\n3. What would change if one constraint were different?\n4. Explain your method to a peer — can they follow it?\n5. Where would this appear on your assessment?` },
      ],
    },
    'topic-brief': {
      title: `Topic Brief: ${topic}`,
      sections: [
        { id: 's1', heading: 'What it is', body: `${topic} refers to [core definition]. It matters because [reason for significance in the field].\n${hasSrc ? `\nFrom your source material: "${sourceMaterial.slice(0, 180).trim()}…"` : ''}` },
        { id: 's2', heading: 'Key Points', body: `• **Point 1**: The most fundamental idea\n• **Point 2**: How it works or what drives it\n• **Point 3**: Its measurable effect or output\n• **Point 4**: Where you will encounter it (theory, application, assessment)\n• **Point 5**: What distinguishes it from the most commonly confused concept` },
        { id: 's3', heading: 'Context', body: `${topic} fits within [broader field/subject]. It relates to [adjacent concept A] and contrasts with [adjacent concept B].\n\nIn assessments, it typically appears as [typical question type].` },
        { id: 's4', heading: 'Self-Check', body: `1. Can you define ${topic} without looking?\n2. What are the three most important facts?\n3. How would you answer a short essay question?\n4. What do you not fully understand yet? Make that your next search.` },
      ],
    },
  };

  const cardBase = {
    'concept-guide': {
      title: `Revision Card: ${topic}`,
      sections: [
        { label: '⚡ One-line definition', content: `${topic} is [core mechanism] that [key function] within [context].` },
        { label: '🔑 Key points', content: '• Point 1: Core structural component\n• Point 2: Key functional relationship\n• Point 3: Dynamic behaviour under change\n• Point 4: Common application or test context' },
        { label: '📌 Watch out for', content: `• Confusing ${topic} with [related term]\n• Ignoring feedback effects\n• Over-simplifying the dynamic layer` },
        { label: '✅ You know it when…', content: `You can explain ${topic} to someone who has never heard of it, and give an example they understand.` },
      ],
    },
    'practice-breakdown': {
      title: `Revision Card: ${topic}`,
      sections: [
        { label: '📐 Method at a glance', content: '1. Read → 2. Identify → 3. Choose method → 4. Solve → 5. Check' },
        { label: '⚡ Key formula / rule', content: `Core relationship for ${topic}: [Formula or rule here]` },
        { label: '❌ Avoid', content: "• Skipping 'does this answer make sense?'\n• Copying steps without understanding\n• Moving on before checking all sub-parts" },
        { label: '✅ Ready when…', content: 'You can solve a complex problem cold, with full working, inside time limits.' },
      ],
    },
    'topic-brief': {
      title: `Revision Card: ${topic}`,
      sections: [
        { label: '📌 In one sentence', content: `${topic} is [definition] that [function/significance].` },
        { label: '5 facts to remember', content: '1. \n2. \n3. \n4. \n5. ' },
        { label: '🔗 Connects to', content: '[Concept A] · [Concept B] · [Concept C]' },
        { label: '✅ Quick self-test', content: `Close this card and write the definition of ${topic} from memory. Then check.` },
      ],
    },
  };

  return {
    studyGuide: guideBase[type] || guideBase['concept-guide'],
    revisionCard: cardBase[type] || cardBase['concept-guide'],
  };
}

// ── Main export ───────────────────────────────────────────

export async function generateContent({ type, topic, sourceMaterial }, onProgress) {
  const settings = loadSettings();
  const hasKey = settings.apiKey && settings.apiKey.trim().length > 10;
  const provider = settings.apiProvider;

  // Demo mode — staged delay
  if (!hasKey || provider === 'demo') {
    const stages = [
      { label: 'Analysing topic…', pct: 15 },
      { label: 'Structuring sections…', pct: 35 },
      { label: 'Generating study guide…', pct: 65 },
      { label: 'Building revision card…', pct: 85 },
      { label: 'Finalising…', pct: 95 },
    ];
    for (const s of stages) {
      onProgress(s);
      await new Promise((r) => setTimeout(r, 420 + Math.random() * 280));
    }
    const content = buildDemoContent(type, topic, sourceMaterial);
    onProgress({ label: 'Done!', pct: 100 });
    await new Promise((r) => setTimeout(r, 200));
    return { type, topic, generatedAt: new Date().toISOString(), ...content };
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    try {
      onProgress({ label: 'Connecting to backend API…', pct: 20 });
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          topic,
          sourceMaterial,
          provider: settings.apiProvider,
          apiKey: settings.apiKey,
          model: settings.apiProvider === 'openai' ? settings.openaiModel : settings.geminiModel,
        }),
      });
      if (res.ok) {
        const content = await res.json();
        onProgress({ label: 'Finalizing…', pct: 95 });
        return { type, topic, generatedAt: new Date().toISOString(), ...content };
      }
    } catch (e) {
      console.warn('Backend call failed, falling back to client-side synthesis:', e);
    }
  }

  // Real API
  try {
    onProgress({ label: `Connecting to ${provider === 'openai' ? 'OpenAI' : 'Gemini'}…`, pct: 5 });
    let content;
    if (provider === 'gemini') {
      content = await generateWithGemini(settings, type, topic, sourceMaterial, onProgress);
    } else {
      content = await generateWithOpenAI(settings, type, topic, sourceMaterial, onProgress);
    }

    // Validate and normalise
    if (!content.studyGuide || !content.revisionCard) {
      throw new Error('Unexpected response format from AI provider');
    }
    // Ensure section IDs
    content.studyGuide.sections = content.studyGuide.sections.map((s, i) => ({
      id: s.id || `s${i + 1}`,
      ...s,
    }));

    onProgress({ label: 'Done!', pct: 100 });
    await new Promise((r) => setTimeout(r, 200));
    return { type, topic, generatedAt: new Date().toISOString(), ...content };
  } catch (err) {
    throw err;
  }
}
