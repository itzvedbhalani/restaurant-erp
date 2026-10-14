import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupOwnerDto {
  @ApiProperty({ example: 'owner@myrestaurant.com', description: 'Must be a real, reachable email — an OTP is sent here' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Restaurant Owner Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'owner@myrestaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482913' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'owner@myrestaurant.com' })
  @IsEmail()
  email: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'admin@restaurant.com',
    description:
      'A real email for owners, or a system-issued login ID for staff/site-owner accounts (e.g. "raj.waiter@tasty-bites.com" or "tomsiteowner")',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@restaurant.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4...' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
