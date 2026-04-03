import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { ClaudeModule } from '../claude/claude.module';
import { ItunesModule } from '../itunes/itunes.module';

@Module({
  imports: [ClaudeModule, ItunesModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule {}
