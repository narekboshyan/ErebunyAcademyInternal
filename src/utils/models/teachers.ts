import { Prisma, Teacher, User } from '@prisma/client';
import { TeacherResolver } from '@/lib/prisma/resolvers/teacher.resolver';

export type TeachersListModel = Prisma.PromiseReturnType<typeof TeacherResolver.list>;

export type TeacherDataModel = Prisma.PromiseReturnType<typeof TeacherResolver.getTeachers>;

export interface TeacherModel extends User {
  teacher: Teacher;
}

export type TeacherCyclicScheduleListType = Prisma.PromiseReturnType<
  typeof TeacherResolver.getTeacherSchedules
>;

export type TeacherScheduleListType = Prisma.PromiseReturnType<
  typeof TeacherResolver.getSelectedTeacherSchedules
>;

export type TeacherScheduleListSingleType =
  TeacherCyclicScheduleListType extends (infer SingleType)[] ? SingleType : never;

export type TeacherListModel = Awaited<ReturnType<typeof TeacherResolver.list>>['users'];

export type TeacherModelSingle = TeacherListModel extends (infer SingleType)[] ? SingleType : never;
