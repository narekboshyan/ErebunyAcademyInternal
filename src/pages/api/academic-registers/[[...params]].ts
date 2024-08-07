import {
  Body,
  Catch,
  createHandler,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from 'next-api-decorators';
import { User } from 'next-auth';
import { CurrentUser } from '@/lib/prisma/decorators/current-user.decorator';
import { exceptionHandler } from '@/lib/prisma/error';
import { AcademicRegisterResolver } from '@/lib/prisma/resolvers/academic-register.resolver';
import { CreateStudentAttentdanceRecordValidation } from '@/utils/validation/academic-register';

@Catch(exceptionHandler)
class AcademicRegisterHandler {
  @Get('/list')
  getCyclicList(@CurrentUser() user: NonNullable<User>) {
    return AcademicRegisterResolver.list(user);
  }

  @Post('/:courseGroupId')
  createStudentAddentanceRecord(
    @Param('courseGroupId') courseGroupId: string,
    @Query('lessonOfTheDay') lessonOfTheDay: string,
    @Body(ValidationPipe) input: CreateStudentAttentdanceRecordValidation,
    @CurrentUser() user: NonNullable<User>,
  ) {
    return AcademicRegisterResolver.createStudentAddentanceRecord(
      courseGroupId,
      input,
      user,
      lessonOfTheDay,
    );
  }
}

export default createHandler(AcademicRegisterHandler);
