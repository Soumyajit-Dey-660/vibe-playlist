import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyAuthService } from './spotify.auth.service';

@Module({
  providers: [SpotifyService, SpotifyAuthService],
  exports: [SpotifyService],
})
export class SpotifyModule {}
