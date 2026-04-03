import { Injectable, Logger } from '@nestjs/common';
import { ClaudeService } from '../claude/claude.service';
import { ItunesService } from '../itunes/itunes.service';
import { GeneratePlaylistDto } from './dto/generate-playlist.dto';
import { Track } from '../itunes/interfaces/itunes-track.interface';
import { MoodAnalysis } from '../claude/interfaces/mood-analysis.interface';

export interface PlaylistResponse {
  mood: Omit<MoodAnalysis, 'searchTerms'>;
  tracks: Track[];
  generatedAt: string;
}

@Injectable()
export class PlaylistService {
  private readonly logger = new Logger(PlaylistService.name);

  constructor(
    private readonly claudeService: ClaudeService,
    private readonly itunesService: ItunesService,
  ) {}

  async generate(dto: GeneratePlaylistDto): Promise<PlaylistResponse> {
    const targetCount = dto.trackCount ?? 20;

    // Step 1: Claude analyzes the drawing
    const mood = await this.claudeService.analyzeMoodFromImage(dto.imageBase64);
    this.logger.log(
      `Mood: ${mood.moodLabel} | Search terms: ${mood.searchTerms.join(', ')}`,
    );

    // Step 2: Search iTunes — searchTerms first, then fall back to genres if needed
    const searchTrack = (term: string, limit: number) =>
      this.itunesService.searchTracks(term, limit).catch((err) => {
        this.logger.warn(
          `Search failed for "${term}": ${(err as Error).message}`,
        );
        return [] as Track[];
      });

    const tracksPerQuery = Math.ceil(targetCount / mood.searchTerms.length) + 2;
    const primaryResults = await Promise.all(
      mood.searchTerms.map(async (term) => {
        const results = await searchTrack(term, tracksPerQuery);
        this.logger.log(`  [itunes] "${term}" → ${results.length} tracks`);
        return results;
      }),
    );

    const dedup = (batches: Track[][]): Track[] => {
      const seen = new Set<string>();
      const out: Track[] = [];
      for (const batch of batches) {
        for (const track of batch) {
          if (!seen.has(track.id)) {
            seen.add(track.id);
            out.push(track);
          }
        }
      }
      return out;
    };

    let all = dedup(primaryResults);
    this.logger.log(`Primary search total: ${all.length} unique tracks`);

    // If searchTerms yielded too few results, supplement with genre searches
    if (all.length < targetCount && mood.genres.length > 0) {
      this.logger.warn(
        `Only ${all.length} tracks from searchTerms — falling back to genres: ${mood.genres.join(', ')}`,
      );
      const genreResults = await Promise.all(
        mood.genres.map(async (g) => {
          const results = await searchTrack(g, tracksPerQuery);
          this.logger.log(
            `  [itunes genre] "${g}" → ${results.length} tracks`,
          );
          return results;
        }),
      );
      all = dedup([...primaryResults, ...genreResults]);
      this.logger.log(`After genre fallback: ${all.length} unique tracks`);
    }

    const shuffled = this.shuffle(all).slice(0, targetCount);
    this.logger.log(
      `Returning ${shuffled.length} tracks for mood: ${mood.moodLabel}`,
    );

    const { searchTerms: _omit, ...moodWithoutTerms } = mood;
    void _omit;

    return {
      mood: moodWithoutTerms,
      tracks: shuffled,
      generatedAt: new Date().toISOString(),
    };
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
