import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Track } from './interfaces/itunes-track.interface';

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesApiTrack[];
}

interface ItunesApiTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackViewUrl: string;
  previewUrl?: string;
  trackTimeMillis: number;
}

@Injectable()
export class ItunesService {
  private readonly logger = new Logger(ItunesService.name);

  async searchTracks(query: string, limit = 5): Promise<Track[]> {
    const response = await axios.get<ItunesSearchResponse>(
      'https://itunes.apple.com/search',
      {
        params: {
          term: query,
          media: 'music',
          entity: 'song',
          limit,
        },
      },
    );

    return response.data.results.map((item) => this.mapTrack(item));
  }

  private mapTrack(item: ItunesApiTrack): Track {
    const artworkUrl = item.artworkUrl100?.replace('100x100', '300x300') ?? '';

    return {
      id: String(item.trackId),
      name: item.trackName,
      artist: item.artistName,
      artists: [item.artistName],
      album: item.collectionName ?? '',
      albumArtUrl: artworkUrl,
      trackUrl: item.trackViewUrl ?? '',
      previewUrl: item.previewUrl ?? null,
      durationMs: item.trackTimeMillis ?? 0,
    };
  }
}
