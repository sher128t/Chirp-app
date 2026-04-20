import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  pronouns?: string;
}

