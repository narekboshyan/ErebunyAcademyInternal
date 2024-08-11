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

  @Post('/schedules/:scheduleId')
  createStudentAddentanceRecord(
    @Param('scheduleId') scheduleId: string,
    @Body(ValidationPipe) input: CreateStudentAttentdanceRecordValidation,
    @CurrentUser() user: NonNullable<User>,
    @Query('lessonOfTheDay') lessonOfTheDay: string,
  ) {
    return AcademicRegisterResolver.createStudentAddentanceRecord(
      scheduleId,
      input,
      user,
      lessonOfTheDay,
    );
  }
}

export default createHandler(AcademicRegisterHandler);
