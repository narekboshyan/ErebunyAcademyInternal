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
import { SortingType } from '@/api/types/common';
import { exceptionHandler } from '@/lib/prisma/error';
import { ExamsResolver } from '@/lib/prisma/resolvers/exam.resolver';
import { CreateExamValidation, ExamValidation } from '@/utils/validation/exam';

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

  @Get('/:id')
  _getExamById(@Param('id') id: string) {
    return ExamsResolver.getExamDataById(id);
  }
  @Post('/:examId')
  _createExamTranslation(
    @Body(ValidationPipe) input: ExamValidation,
    @Param('examId') examId?: string,
  ) {
    return ExamsResolver.createExamTranslation(input, examId);
  }

  @Post()
  _createExam(@Body(ValidationPipe) input: CreateExamValidation) {
    return ExamsResolver.createExam(input);
  }
}

export default createHandler(ExamsHandler);
