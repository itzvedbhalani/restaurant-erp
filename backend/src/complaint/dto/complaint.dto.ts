import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Hygiene' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 'Kitchen cleaning missed' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'The cleaning schedule was not followed in the pastry section today.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'HIGH' })
  @IsNotEmpty()
  @IsString()
  priority: string; // LOW, MEDIUM, HIGH, CRITICAL

  @ApiProperty({ example: 'staff-user-uuid' })
  @IsNotEmpty()
  @IsString()
  reporterId: string;
}

export class ResolveComplaintDto {
  @ApiProperty({ example: 'resolved-user-uuid' })
  @IsNotEmpty()
  @IsString()
  resolvedById: string;

  @ApiProperty({ example: 'Assigned crew to clean the pastry area immediately and updated log books.' })
  @IsNotEmpty()
  @IsString()
  resolutionNotes: string;
}

export class AddCommentDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'I will inspect this area in 10 minutes.' })
  @IsNotEmpty()
  @IsString()
  comment: string;
}

export class UpdateComplaintStatusDto {
  @ApiProperty({ example: 'IN_PROGRESS' }) // OPEN, IN_PROGRESS, RESOLVED
  @IsNotEmpty()
  @IsString()
  status: string;
}
