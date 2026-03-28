import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { PlaylistService, PlaylistResponse } from './playlist.service';
import { GeneratePlaylistDto } from './dto/generate-playlist.dto';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() dto: GeneratePlaylistDto): Promise<PlaylistResponse> {
    return this.playlistService.generate(dto);
  }
}
