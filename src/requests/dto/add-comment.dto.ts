import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment text is required' })
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  text: string;
}
