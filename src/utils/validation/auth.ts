import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class SignInFormValidation {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password' })
  password: string;
}

export class AttachmentValidation {
  @IsNotEmpty({ message: 'Mime type is required' })
  mimetype: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Key is required' })
  key: string;

  @IsString()
  @IsNotEmpty({ message: 'Key is required' })
  attachmentKey: string;
}

export class UserSignupValidation {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 20)
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Length(6, 20)
  confirmPassword: string;
}

export class TeacherSignUpValidation extends UserSignupValidation {
  @IsString()
  @IsNotEmpty({ message: 'Profession is required' })
  profession: string;

  @IsString()
  @IsNotEmpty({ message: 'Working place is required' })
  workPlace: string;

  @IsString()
  @IsNotEmpty({ message: 'Scientific activity is required' })
  scientificActivity: string;

  @IsString()
  @IsNotEmpty()
  teachingSubjectId: string;
}

export class StudentSignUpValidation extends UserSignupValidation {
  @IsString()
  @IsNotEmpty({ message: 'Student grade is required' })
  studentGradeId: string;

  @IsString()
  @IsOptional()
  studentGradeGroupId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Faculty is required' })
  facultyId: string;

  @ValidateNested()
  attachment: AttachmentValidation;
}

export class ForgotPasswordStep1Validation {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ForgotPasswordStep2Validation {
  @IsString()
  @IsNotEmpty()
  @Length(4)
  otpPassword: string;
}

export class ResendEmailValidation extends ForgotPasswordStep1Validation {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;
}

export class ForgotPasswordStep3Validation {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  confirmPassword: string;

  @IsNumber()
  @IsNotEmpty()
  confirmationCode: number;
}
