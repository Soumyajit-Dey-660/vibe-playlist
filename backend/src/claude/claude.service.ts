import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { MoodAnalysis } from './interfaces/mood-analysis.interface';

const MOOD_ANALYSIS_PROMPT = `You are analyzing a hand-drawn sketch from an HTML canvas to infer the drawer's current emotional state and map it to music.

STEP 1 — Identify what was drawn (if anything recognizable): a face, an animal, abstract scribbles, geometric shapes, words, etc. If unrecognizable, treat it as pure emotional expression.

STEP 2 — Read the drawing's emotional signal using these cues:
  - SUBJECT MATTER: dark/violent imagery (skulls, storms) = heavy; nature/peaceful objects = calm; chaotic scribbles = unsettled
  - LINE QUALITY: jagged, sharp, scratchy = tense/aggressive; flowing, rounded = calm/open; trembling/broken = anxious/fragile
  - STROKE PRESSURE & DENSITY: heavy overlapping strokes = high intensity; light sparse marks = quiet/reflective
  - SPATIAL USE: fills the whole canvas = expansive/extroverted; huddled in corner = withdrawn/introverted
  - STRUCTURE: rigid geometry = controlled; loose organic forms = emotional/expressive; spirals = introspective; spikes/zigzags = agitated

STEP 3 — Map to music using Spotify-friendly search terms.

CRITICAL RULES for searchTerms — these are passed directly to the Spotify search API, so they MUST return real results:
  - Use GENRE NAMES that Spotify recognizes: "dark ambient", "post-rock", "lo-fi hip hop", "heavy metal", "cinematic orchestral", "industrial electronic", "doom metal", "neo-soul", "shoegaze", "trap"
  - Use MOOD + GENRE combos: "intense dark electronic", "melancholic post-rock", "aggressive metal", "calm acoustic", "epic orchestral"
  - Use ARTIST-STYLE descriptors: "Massive Attack style", "Nine Inch Nails type", "Hans Zimmer cinematic"
  - NEVER use abstract poetic phrases ("electric storm energy", "liquid midnight"), metaphors, or invented labels as search terms — Spotify won't find anything
  - For high-energy dark moods (storms, chaos): prefer "heavy metal", "industrial", "dark techno", "hard rock", "aggressive electronic"
  - For calm moods: prefer "ambient", "lo-fi", "acoustic", "chillout", "meditation"

Return ONLY valid JSON — no markdown, no explanation:
{
  "moodLabel": "exactly ONE word — either what was drawn or the dominant mood (e.g. 'Thunder', 'Rain', 'Rage', 'Drift', 'Bliss', 'Chaos')",
  "subject": "What appears to be drawn, or 'abstract' if unrecognizable",
  "interpretation": "2-3 sentences: what the drawing communicates emotionally and why",
  "genres": ["3-5 specific Spotify genre strings, e.g. 'lo-fi hip hop', 'post-punk', 'dark ambient', 'bedroom pop'"],
  "searchTerms": ["6-8 concrete Spotify search queries that WILL return results, e.g. 'dark ambient', 'aggressive heavy metal', 'melancholic post-rock', 'Nine Inch Nails', 'intense cinematic orchestral'"],
  "energy": "low | medium | high",
  "valence": "dark | neutral | bright",
  "tempo": "slow | medium | fast"
}`;

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('app.openaiApiKey') ?? '',
    });
    this.model = this.configService.get<string>('app.openaiModel') ?? 'gpt-4o';
  }

  async analyzeMoodFromImage(imageBase64: string): Promise<MoodAnalysis> {
    const base64Data = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    this.logger.log(`Analyzing mood with model: ${this.model}`);

    const response = await this.openai.chat.completions.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content:
            'You are a music curator AI with deep expertise in emotional intelligence and music theory. Always respond with valid JSON only, no markdown fences, no extra text.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: base64Data },
            },
            {
              type: 'text',
              text: MOOD_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new UnprocessableEntityException('OpenAI returned no text content');
    }

    const jsonString = this.extractJson(textContent);
    try {
      const parsed = JSON.parse(jsonString) as MoodAnalysis;
      this.logger.log(
        `Mood analysis: ${parsed.moodLabel} (${parsed.energy} energy)`,
      );
      return parsed;
    } catch {
      this.logger.error(`Failed to parse OpenAI response: ${textContent}`);
      throw new UnprocessableEntityException(
        'Failed to parse mood analysis from OpenAI response',
      );
    }
  }

  private extractJson(raw: string): string {
    // Strip markdown code fences: ```json ... ``` or ``` ... ```
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return fenced[1].trim();

    // Fallback: extract the first {...} block in case of leading/trailing prose
    const braceMatch = raw.match(/\{[\s\S]*\}/);
    if (braceMatch) return braceMatch[0];

    return raw.trim();
  }
}
