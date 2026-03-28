import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { SpotifyAuthService } from './spotify.auth.service';
import { SpotifyTrack } from './interfaces/spotify-track.interface';

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyApiTrack[];
  };
}

interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  external_urls: { spotify: string };
  preview_url: string | null;
  duration_ms: number;
  popularity: number;
}

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);

  constructor(private readonly authService: SpotifyAuthService) {}

  async searchTracks(query: string, limit = 5): Promise<SpotifyTrack[]> {
    try {
      return await this.doSearch(query, limit);
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response) {
        this.logger.error(
          `Spotify ${axiosErr.response.status} for query "${query}": ${JSON.stringify(axiosErr.response.data)}`,
        );
        if (axiosErr.response.status === 401) {
          this.logger.warn('Spotify token expired mid-flight, retrying...');
          return this.doSearch(query, limit, true);
        }
      }
      throw err;
    }
  }

  private async doSearch(
    query: string,
    limit: number,
    forceRefresh = false,
  ): Promise<SpotifyTrack[]> {
    const token = forceRefresh
      ? await this.authService['fetchNewToken']()
      : await this.authService.getAccessToken();

    const response = await axios.get<SpotifySearchResponse>(
      'https://api.spotify.com/v1/search',
      {
        params: { q: query, type: 'track', limit, market: 'US' },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response.data.tracks.items.map((item) => this.mapTrack(item));
  }

  private mapTrack(item: SpotifyApiTrack): SpotifyTrack {
    const image300 =
      item.album.images.find((img) => img.width === 300) ??
      item.album.images[0];

    return {
      id: item.id,
      name: item.name,
      artist: item.artists[0]?.name ?? 'Unknown Artist',
      artists: item.artists.map((a) => a.name),
      album: item.album.name,
      albumArtUrl: image300?.url ?? '',
      spotifyUrl: item.external_urls.spotify,
      previewUrl: item.preview_url,
      durationMs: item.duration_ms,
      popularity: item.popularity,
    };
  }
}
