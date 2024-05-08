import { Prisma, StudentGradeGroup } from '@prisma/client';
import { StudentGradeGroupResolver } from '@/lib/prisma/resolvers/student-grade-group.resolver';

export interface StudentGradeGroupModel extends StudentGradeGroup {}

export type StudentGradeGroupSignupListModel = Prisma.PromiseReturnType<
  typeof StudentGradeGroupResolver.getStudentGradeGroupList
>;

export type StudentGradeGroupAdminListModel = Prisma.PromiseReturnType<
  typeof StudentGradeGroupResolver.list
>;
