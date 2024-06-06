import { LanguageTypeEnum } from '@prisma/client';
import {
  Body,
  Catch,
  createHandler,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from 'next-api-decorators';
import { SortingType } from '@/api/types/common';
import { exceptionHandler } from '@/lib/prisma/error';
import { AdminGuard } from '@/lib/prisma/guards/admin';
import { StudentGuard } from '@/lib/prisma/guards/student';
import { ExamsResolver } from '@/lib/prisma/resolvers/exam.resolver';
import { CreateExamValidation, OptionalExamValidation } from '@/utils/validation/exam';

@Catch(exceptionHandler)
class ExamsHandler {
  @Get('/list')
  _list(
    @Query('offset') skip: string,
    @Query('limit') take: string,
    @Query('search') search: string,
    @Query('sorting') sorting: SortingType[],
  ) {
    return ExamsResolver.list(+skip, +take, search, sorting);
  }

  //@AdminGuard()
  @Get('/:id')
  _getExamById(@Param('id') id?: string) {
    return ExamsResolver.getExamDataById(id);
  }

  @AdminGuard()
  @Get('/translation/:examId/:language')
  _getExamTranslationByExamId(
    @Param('examId') examId: string,
    @Param('language') language: LanguageTypeEnum,
  ) {
    return ExamsResolver.getExamTranslationByExamIdAndLanguage(examId, language);
  }

  @AdminGuard()
  @Delete('/:examId')
  _deleteExamById(@Param('examId') examId: string) {
    return ExamsResolver.deleteExamById(examId);
  }

  @AdminGuard()
  @Patch('/translation/:examId/:language')
  _updateExamTranslationByExamId(
    @Param('examId') examId: string,
    @Param('language') language: LanguageTypeEnum,
    @Body(ValidationPipe) input: OptionalExamValidation,
  ) {
    return ExamsResolver.updateExamTranslation(examId, language, input);
  }

  @AdminGuard()
  @Post('/translation/:examId/:language')
  _createExamTranslation(
    @Param('examId') examId: string,
    @Param('language') language: LanguageTypeEnum,
    @Body(ValidationPipe) input: OptionalExamValidation,
  ) {
    return ExamsResolver.createExamTranslation(examId, language, input);
  }

  @StudentGuard()
  @Get('/translation/:translationId')
  getTestQuestion(
    @Param('translationId') translationId: string,
    @Query('testQuestionId') testQuestionId?: string,
  ) {
    return ExamsResolver.getTestQuestion(translationId, testQuestionId);
  }

  @Post()
  _createExam(@Body(ValidationPipe) input: CreateExamValidation) {
    return ExamsResolver.createExam(input);
  }
}

export default createHandler(ExamsHandler);
