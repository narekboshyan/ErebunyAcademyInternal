import { Prisma, Teacher } from '@prisma/client';
import { User } from '@prisma/client';
import { TeacherResolver } from '@/lib/prisma/resolvers/teacher.resolver';

export type TeachersListModel = Prisma.PromiseReturnType<typeof TeacherResolver.list>;

export interface TeacherModel extends User {
  teacher: Teacher;
}
