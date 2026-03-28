import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SpotifyAuthService {
  private readonly logger = new Logger(SpotifyAuthService.name);
  private tokenCache: { token: string; expiresAt: number } | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 60_000) {
      return this.tokenCache.token;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.fetchNewToken().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async fetchNewToken(): Promise<string> {
    const clientId = this.configService.get<string>('app.spotifyClientId');
    const clientSecret = this.configService.get<string>(
      'app.spotifyClientSecret',
    );
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    this.logger.log('Fetching new Spotify access token');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, expires_in } = response.data as {
      access_token: string;
      expires_in: number;
    };

    this.tokenCache = {
      token: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    };

    return access_token;
  }
}
