import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class AuthResponseDto {
  token: string;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isAdmin: boolean;
  };
} 