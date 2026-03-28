import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { ClaudeModule } from '../claude/claude.module';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  imports: [ClaudeModule, SpotifyModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule {}
