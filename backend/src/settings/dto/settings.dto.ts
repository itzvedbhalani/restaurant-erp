import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingItemDto {
  @ApiProperty({ example: 'gst_rate' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ example: '5.0' })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiProperty({ example: 'NUMBER', required: false })
  @IsOptional()
  @IsString()
  type?: string; // STRING, NUMBER, BOOLEAN, JSON
}

export class BatchUpdateSettingsDto {
  @ApiProperty({ type: [UpdateSettingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingItemDto)
  settings: UpdateSettingItemDto[];
}
