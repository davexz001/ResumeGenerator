import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration for backend token verification
const supabaseUrlRaw = process.env.VITE_SUPABASE_URL;
const supabaseAnonKeyRaw = process.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

const supabase = isValidUrl(supabaseUrlRaw) && supabaseAnonKeyRaw && supabaseAnonKeyRaw !== 'YOUR_SUPABASE_ANON_KEY'
  ? createClient(supabaseUrlRaw as string, supabaseAnonKeyRaw) 
  : null;

async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase configuration is missing on server.' });
    return;
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === SECURE AI GENERATION ROUTE ===
  // Note: Platform security constraints require the Gemini API key to remain server-side.
  // This is the ONLY backend route, acting merely as a secure proxy. Custom Auth and DB are handled via Supabase SDK.
  app.post('/api/generate', authenticateToken, async (req: Request, res: Response) => {
    const { prompt, type } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = "You are a professional resume writer. Rewrite the provided text to be impactful, professional, and action-oriented. Provide ONLY the final rewritten text without conversational filler, markdown formatting blocks, or bullet points unless requested. Keep it concise.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Please rewrite this ${type} content for a resume:\n\n${prompt}`,
        config: {
           systemInstruction,
           temperature: 0.7
        }
      });
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: 'AI generation failed' });
    }
  });

  app.post('/api/generate-template', authenticateToken, async (req: Request, res: Response) => {
    const { prompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are an expert Frontend Developer and Designer. The user wants to search for/create a resume template based on a description: "${prompt}". 
Write a complete, responsive HTML resume template using plain HTML and a <style> block for custom CSS. Do NOT use Tailwind CSS classes. Use Handlebars {{variables}} for data injection.
Available Handlebars variables: 
{{personalInfo.name}}, {{personalInfo.email}}, {{personalInfo.phone}}, {{personalInfo.location}}, {{personalInfo.linkedin}}, {{personalInfo.summary}}
{{#each experience}} {{company}}, {{role}}, {{duration}}, {{description}} {{/each}}
{{#each education}} {{school}}, {{degree}}, {{graduationDate}} {{/each}}
{{#each skills}} {{name}} {{/each}}

IMPORTANT: Return HTML code only. Do not enclose it in \`\`\`html or markdown blocks. Provide ONLY the raw HTML string with internal <style> block.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
           systemInstruction,
           temperature: 0.7,
           tools: [{ googleSearch: {} }] // Allow it to search for real design inspiration
        }
      });
      
      let html = response.text || '';
      // Strip markdown code blocks if the model fails to follow instructions
      if (html.startsWith('```')) {
        html = html.replace(/^```(html)?\n/, '').replace(/\n```$/, '');
      }
      
      res.json({ result: html });
    } catch (error: any) {
      console.error("AI Template Error:", error);
      res.status(500).json({ error: 'AI template generation failed' });
    }
  });

  // Vite Middleware for UI
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
