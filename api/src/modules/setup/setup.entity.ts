import { ApiProperty } from '@nestjs/swagger';
import { IsArray, MinLength } from 'class-validator';

export class SetupDto {
  constructor(partial: Partial<SetupDto>) {
    Object.assign(this, partial);
  }
  @ApiProperty({
    type: String,
    required: true,
  })
  hostName: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  mapifyApiKey: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  leafletTiles: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  postgresUser: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  postgresPassword: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  postgresDb: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  postgresHostName: string;

  @ApiProperty({
    required: true,
  })
  postgresPort: number;
  
  @ApiProperty({
    type: String,
    required: true,
  })
  smtpUrl: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsArray({})
  allowedDomains: string[];
}