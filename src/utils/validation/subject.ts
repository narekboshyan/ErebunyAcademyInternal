import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEditSubjectValidation {
  @IsString()
  @IsNotEmpty({ message: 'subjectTitleMessage' })
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;
}
