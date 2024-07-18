import { AttachmentTypeEnum, ThematicSubPlanTypeEnum } from '@prisma/client';
import { SortingType } from '@/api/types/common';
import { CreateEditScheduleValidation } from '@/utils/validation/schedule';
import { orderBy } from './utils/common';
import prisma from '..';

export class ScheduleResolver {
  static list(skip: number, take: number, search: string, sorting: SortingType[]) {
    return Promise.all([
      prisma.schedule.count({
        where: {
          OR: [{ title: { contains: search, mode: 'insensitive' } }],
        },
      }),
      prisma.schedule.findMany({
        where: {
          OR: [{ title: { contains: search, mode: 'insensitive' } }],
        },
        include: {
          thematicPlan: {
            include: {
              thematicPlanDescription: true,
            },
          },
          scheduleTeachers: {
            select: {
              teacherId: true,
            },
          },
          attachment: {
            select: {
              key: true,
              title: true,
              mimetype: true,
            },
          },
        },

        orderBy: sorting ? orderBy(sorting) : undefined,
        skip,
        take,
      }),
    ]).then(([count, schedules]) => ({
      count,
      schedules,
    }));
  }

  static async createSchedule(data: CreateEditScheduleValidation) {
    const {
      title,
      description,
      practicalClass,
      theoreticalClass,
      totalHours,
      startDayDate,
      endDayDate,
      teacherId,
      links,
      subjectId,
      examDate,
      attachments,
    } = data;

    const thematicPlans = [
      {
        totalHours: +practicalClass.totalHours,
        type: ThematicSubPlanTypeEnum.PRACTICAL,
        thematicPlanDescription: {
          create: practicalClass.classDescriptionRow.map(row => ({
            title: row.title,
            hour: row.hour,
          })),
        },
      },
      {
        totalHours: +theoreticalClass.totalHours,
        type: ThematicSubPlanTypeEnum.THEORETICAL,
        thematicPlanDescription: {
          create: theoreticalClass.classDescriptionRow.map(row => ({
            title: row.title,
            hour: row.hour,
          })),
        },
      },
    ];

    const createdSchedule = await prisma.schedule.create({
      data: {
        title,
        description,
        totalHours: +totalHours,
        startDayDate: new Date(startDayDate),
        endDayDate: new Date(endDayDate),
        isAssessment: data.isAssessment,
        subjectId: data.subjectId,
        links: links.map(({ link }) => link),
        thematicPlan: {
          create: thematicPlans,
        },
        scheduleTeachers: {
          create: {
            teacherId,
            subjectId,
          },
        },
        examDate: new Date(examDate),
      },
      select: {
        id: true,
      },
    });

    if (attachments) {
      await prisma.attachment.createMany({
        data: attachments.map(attachment => ({
          title: attachment.title,
          key: attachment.key,
          scheduleId: createdSchedule.id,
          type: AttachmentTypeEnum.FILE,
          mimetype: attachment.mimetype,
        })),
      });
    }

    return createdSchedule;
  }
}
