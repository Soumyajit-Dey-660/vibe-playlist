import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class GeneratePlaylistDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^data:image\/png;base64,/, {
    message: 'imageBase64 must be a valid PNG data URL',
  })
  imageBase64: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(30)
  trackCount?: number;
}
