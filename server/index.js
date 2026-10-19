import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Study Material Studio API', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Study Material Studio Backend API',
    endpoints: {
      health: 'GET /api/health',
      synthesize: 'POST /api/synthesize'
    }
  });
});

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

// Synthesis endpoint
app.post('/api/synthesize', async (req, res) => {
  try {
    const { type = 'Study Guide', topic, sourceMaterial = '', provider = 'demo', apiKey, model } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const effectiveApiKey = apiKey || (provider === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY);

    // If OpenAI requested and key available
    if (provider === 'openai' && effectiveApiKey) {
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify({
          model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: buildSystemPrompt(type) },
            { role: 'user', content: buildUserPrompt(type, topic, sourceMaterial) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!openAiRes.ok) {
        const err = await openAiRes.text();
        return res.status(openAiRes.status).json({ error: `OpenAI error: ${err}` });
      }

      const data = await openAiRes.json();
      const content = data.choices[0]?.message?.content;
      return res.json(JSON.parse(content));
    }

    // If Gemini requested and key available
    if (provider === 'gemini' && effectiveApiKey) {
      const geminiModel = model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${effectiveApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: buildSystemPrompt(type) }] },
            contents: [{ parts: [{ text: buildUserPrompt(type, topic, sourceMaterial) }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          }),
        }
      );

      if (!geminiRes.ok) {
        const err = await geminiRes.text();
        return res.status(geminiRes.status).json({ error: `Gemini error: ${err}` });
      }

      const data = await geminiRes.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.json(JSON.parse(rawText));
    }

    // Fallback demo synthesis response
    return res.json({
      studyGuide: {
        title: `${topic} — Synthesis Study Guide`,
        sections: [
          {
            id: 's1',
            heading: '1. Executive Conceptual Architecture & Key Definitions',
            body: `This study guide breaks down **${topic}** into its core mechanistic components.\n\n- **Core Definition**: Fundamental principles governing ${topic}.\n- **Primary Objective**: Conceptual mastery and retention of key relationships.\n\n> 💡 **Self-Check**: Can you define the primary drivers of ${topic} without consulting your notes?`
          },
          {
            id: 's2',
            heading: '2. Deep Dive Analysis & Mechanistic Flow',
            body: `### Key Principles\n1. Initial conditions and operational parameters.\n2. Intermediate transformation steps.\n3. Output stabilization and equilibrium.\n\n\`\`\`text\nInput Stage ──> Intermediate Processing ──> Output State\n\`\`\``
          },
          {
            id: 's3',
            heading: '3. Common Pitfalls & High-Frequency Exam Traps',
            body: `- ⚠️ **Trap 1**: Confusing correlation with causal mechanisms.\n- ⚠️ **Trap 2**: Overlooking edge-case boundary conditions.\n\n> ⚠️ **Verification Checklist**: Ensure all source references conform to course syllabus criteria.`
          }
        ]
      },
      revisionCard: {
        title: `${topic} — Quick Revision Card`,
        sections: [
          {
            label: '⚡ Core Rules & Equations',
            content: `• First Principle of ${topic}\n• Conservation & Equivalence relationships\n• Critical ratios: α/β ≤ 1.0`
          },
          {
            label: '🔑 High-Yield Vocabulary',
            content: `• Substrate / Baseline: Initial frame of reference\n• Kinetic Equilibrium: Dynamic state balance\n• Rate-Limiting Step: Bottleneck determining overall throughput`
          },
          {
            label: '⚠️ Critical Pitfalls',
            content: `• Neglecting boundary constraints\n• Sign inversion errors during derivation\n• Conflating steady-state with static rest`
          },
          {
            label: '🧠 Rapid Recall Mnemonics',
            content: `• Remember **P-A-C-E**: Parameter, Action, Check, Execute\n• Verify dimensional units before final answer`
          }
        ]
      }
    });
  } catch (err) {
    console.error('Synthesis error:', err);
    res.status(500).json({ error: err.message || 'Server error during synthesis' });
  }
});

app.listen(PORT, () => {
  console.log(`Study Material Studio backend running on port ${PORT}`);
});
