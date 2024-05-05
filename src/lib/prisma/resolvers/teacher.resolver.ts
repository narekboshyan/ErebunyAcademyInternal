import { Subject } from '@prisma/client';
import { NotFoundException } from 'next-api-decorators';
import prisma from '..';

export class SubjectResolver {
  static createSubject(data: Pick<Subject, 'title' | 'description'>) {
    return prisma.subject.create({ data });
  }

  static getSubjectById(id: string) {
    return prisma.subject
      .findUnique({
        where: { id },
      })
      .then(res => {
        if (!res) {
          throw new NotFoundException('Subject was not found');
        }
        return res;
      });
  }

  static getSubjects() {
    return prisma.subject.findMany({
      select: {
        id: true,
        title: true,
      },
    });
  }

  static async updateSubjectById(id: string, data: Partial<Subject>) {
    const subject = await this.getSubjectById(id);

    return prisma.subject.update({
      where: {
        id: subject.id,
      },
      data,
    });
  }

  static async deleteSubjectById(id: string) {
    const subject = await this.getSubjectById(id);
    return prisma.subject.delete({
      where: {
        id: subject.id,
      },
    });
  }
}
