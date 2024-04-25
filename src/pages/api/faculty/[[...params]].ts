import {
  Body,
  Catch,
  createHandler,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from 'next-api-decorators';
import { exceptionHandler } from '@/lib/prisma/error';
import { Faculty } from '@prisma/client';
import { FacultyResolver } from '@/lib/prisma/resolvers/faculty';

@Catch(exceptionHandler)
class FacultyHandler {
  @Get('/:id')
  getFacultyById(@Param('id') id: string) {
    return FacultyResolver.getFacultyById(+id);
  }

  @Get('/list')
  getFacultyList() {
    return FacultyResolver.getFacultyList();
  }

  @Delete('/:id')
  deleteFaculty(@Param('id') id: string) {
    return FacultyResolver.deleteFacultyById(+id);
  }

  @Post()
  createFaculty(@Body(ValidationPipe) input: Pick<Faculty, 'title' | 'description'>) {
    return FacultyResolver.createFaculty(input);
  }

  @Patch('/:facultyId')
  updateFaculty(
    @Param('facultyId') facultyId: string,
    @Body(ValidationPipe) input: Partial<Pick<Faculty, 'title' | 'description'>>,
  ) {
    return FacultyResolver.updateFacultyById(+facultyId, input);
  }
}

export default createHandler(FacultyHandler);
