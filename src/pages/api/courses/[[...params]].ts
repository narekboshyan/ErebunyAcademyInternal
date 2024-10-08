import { Course } from '@prisma/client';
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
import { CourseResolver } from '@/lib/prisma/resolvers/course.resolver';
import { CreateEditCourseValidation } from '@/utils/validation/courses';

@Catch(exceptionHandler)
class CourseHandler {
  @AdminGuard()
  @Get('/list')
  getStudentGradeList(
    @Query('offset') skip: string,
    @Query('limit') take: string,
    @Query('search') search: string,
    @Query('sorting') sorting: SortingType[],
  ) {
    return CourseResolver.list(+skip, +take, search, sorting);
  }

  @Get('')
  getCourses() {
    return CourseResolver.getCoursesList();
  }

  @Get('/faculty/:facultyId')
  getCoursesByFacultyId(@Param('facultyId') facultyId: string) {
    return CourseResolver.getCoursesListByFacultyId(facultyId);
  }

  @AdminGuard()
  @Get('/:id')
  getCourseById(@Param('id') id: string) {
    return CourseResolver.getCourseById(id);
  }

  @AdminGuard()
  @Delete('/:id')
  deleteCourse(@Param('id') id: string) {
    return CourseResolver.deleteCourseById(id);
  }

  @AdminGuard()
  @Post()
  createCourse(@Body(ValidationPipe) input: CreateEditCourseValidation) {
    return CourseResolver.createCourse(input);
  }

  @AdminGuard()
  @Patch('/:courseId')
  updateCourse(
    @Param('courseId') courseId: string,
    @Body(ValidationPipe) input: Partial<Pick<Course, 'title' | 'description'>>,
  ) {
    return CourseResolver.updateCourseById(courseId, input);
  }
}

export default createHandler(CourseHandler);
