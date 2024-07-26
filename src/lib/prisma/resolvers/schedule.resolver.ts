import { AttachmentTypeEnum, ThematicSubPlanTypeEnum } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { SortingType } from '@/api/types/common';
import { CreateEditNonCylicScheduleValidation } from '@/utils/validation/non-cyclic';
import {
  AddEditThematicPlanValidation,
  CreateEditScheduleValidation,
} from '@/utils/validation/schedule';
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

  static async createThematicPlan(scheduleId: string, data: AddEditThematicPlanValidation) {
    const { practicalClass, theoreticalClass } = data;

    prisma.thematicPlan
      .create({
        data: {
          scheduleId,
          totalHours: +practicalClass.totalHours,
          type: ThematicSubPlanTypeEnum.PRACTICAL,
          thematicPlanDescription: {
            create: practicalClass.classDescriptionRow.map(row => ({
              title: row.title,
              hour: row.hour,
            })),
          },
        },
      })
      .catch(console.error);

    return prisma.thematicPlan.create({
      data: {
        scheduleId,
        totalHours: +theoreticalClass.totalHours,
        type: ThematicSubPlanTypeEnum.THEORETICAL,
        thematicPlanDescription: {
          create: theoreticalClass.classDescriptionRow.map(row => ({
            title: row.title,
            hour: row.hour,
          })),
        },
      },
    });
  }

  static async updateThematicPlan(scheduleId: string, data: AddEditThematicPlanValidation) {
    await prisma.thematicPlan.deleteMany({
      where: { scheduleId },
    });

    return ScheduleResolver.createThematicPlan(scheduleId, data);
  }

  static async createSchedule(data: CreateEditScheduleValidation) {
    const {
      title,
      description,
      totalHours,
      startDayDate,
      endDayDate,
      teacherId,
      links,
      subjectId,
      examDate,
      attachments,
    } = data;

    const createdSchedule = await prisma.schedule.create({
      data: {
        courseGroupId: data.courseGroupId,
        title,
        description,
        examType: data.examType,
        totalHours: +totalHours,
        startDayDate: new Date(startDayDate),
        endDayDate: new Date(endDayDate),
        isAssessment: data.isAssessment,
        subjectId: data.subjectId,
        links: links.map(({ link }) => link),
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

  static async updateSchedule(id: string, data: CreateEditScheduleValidation) {
    const {
      title,
      description,
      totalHours,
      startDayDate,
      endDayDate,
      teacherId,
      links,
      subjectId,
      examDate,
      attachments,
      examType,
      courseGroupId,
    } = data;

    const schedule = await prisma.schedule.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return prisma.$transaction(async prisma => {
      await prisma.thematicPlan.deleteMany({
        where: { scheduleId: schedule.id },
      });

      await prisma.scheduleTeacher.deleteMany({
        where: { scheduleId: schedule.id },
      });

      const updatedSchedule = await prisma.schedule.update({
        where: {
          id: schedule.id,
        },
        data: {
          title,
          description,
          examType,
          courseGroupId,
          totalHours: +totalHours,
          startDayDate: new Date(startDayDate),
          endDayDate: new Date(endDayDate),
          isAssessment: data.isAssessment,
          subjectId: data.subjectId,
          links: {
            set: links.map(({ link }) => link),
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

      const existingAttachments = await prisma.attachment.findMany({
        where: {
          scheduleId: schedule.id,
        },
      });

      const existingAttachmentKeys = new Set(existingAttachments.map(att => att.key));
      const newAttachmentKeys = new Set(attachments?.map(att => att.key) || []);

      const attachmentsToDelete = existingAttachments.filter(
        att => !newAttachmentKeys.has(att.key),
      );

      for (const attachment of attachmentsToDelete) {
        const filePath = path.join(process.cwd(), 'uploads', attachment.key);
        if (filePath) {
          await fs.promises.unlink(filePath);
        }
      }

      await prisma.attachment.deleteMany({
        where: {
          key: {
            in: attachmentsToDelete.map(att => att.key),
          },
        },
      });

      const attachmentsToCreate = attachments?.filter(att => !existingAttachmentKeys.has(att.key));

      if (attachmentsToCreate?.length) {
        await prisma.attachment.createMany({
          data: attachmentsToCreate.map(attachment => ({
            title: attachment.title,
            key: attachment.key,
            scheduleId: updatedSchedule.id,
            type: AttachmentTypeEnum.FILE,
            mimetype: attachment.mimetype,
          })),
        });
      }

      return updatedSchedule;
    });
  }

  static async deleteSchedule(id: string) {
    const schedule = await prisma.schedule.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        attachment: true,
      },
    });

    for (const attachment of schedule.attachment) {
      const filePath = path.join(process.cwd(), 'uploads', attachment.key);
      try {
        await fs.promises.access(filePath);
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      }
    }

    return prisma.schedule.delete({
      where: {
        id: schedule.id,
      },
    });
  }

  static nonCycleSchedulelist(skip: number, take: number, search: string, sorting: SortingType[]) {
    return Promise.all([
      prisma.nonCyclicSchedule.count({
        where: {
          OR: [{ title: { contains: search, mode: 'insensitive' } }],
        },
      }),
      prisma.nonCyclicSchedule.findMany({
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

  static async deleteNonCyclicSchedule(id: string) {
    const nonCyclicSchedule = await prisma.nonCyclicSchedule.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        attachment: true,
      },
    });

    for (const attachment of nonCyclicSchedule.attachment) {
      const filePath = path.join(process.cwd(), 'uploads', attachment.key);
      try {
        await fs.promises.access(filePath);
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      }
    }

    return prisma.nonCyclicSchedule.delete({
      where: {
        id: nonCyclicSchedule.id,
      },
    });
  }

  static async createNonCyclicSchedule(data: CreateEditNonCylicScheduleValidation) {
    const {
      availableDay,
      period,
      description,
      totalHours,
      teacherId,
      links,
      subjectId,
      title,
      attachments,
      courseGroupId,
    } = data;

    const createdSchedule = await prisma.nonCyclicSchedule.create({
      data: {
        title,
        courseGroupId,
        period,
        availableDay,
        description,
        examType: data.examType,
        totalHours: +totalHours,
        subjectId: data.subjectId,
        links: links.map(({ link }) => link),
        scheduleTeachers: {
          create: {
            teacherId,
            subjectId,
          },
        },
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
          nonCyclicScheduleId: createdSchedule.id,
          type: AttachmentTypeEnum.FILE,
          mimetype: attachment.mimetype,
        })),
      });
    }

    return createdSchedule;
  }

  static async updateNonCycleSchedule(id: string, data: CreateEditNonCylicScheduleValidation) {
    const {
      availableDay,
      period,
      description,
      totalHours,
      teacherId,
      links,
      subjectId,
      title,
      attachments,
      courseGroupId,
      examType,
    } = data;

    const nonCycleSchedule = await prisma.nonCyclicSchedule.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return prisma.$transaction(async prisma => {
      await prisma.thematicPlan.deleteMany({
        where: { nonCyclicScheduleId: nonCycleSchedule.id },
      });

      await prisma.scheduleTeacher.deleteMany({
        where: { nonCyclicScheduleId: nonCycleSchedule.id },
      });

      const updatedSchedule = await prisma.nonCyclicSchedule.update({
        where: {
          id: nonCycleSchedule.id,
        },
        data: {
          courseGroupId,
          availableDay,
          period,
          title,
          description,
          examType,
          totalHours: +totalHours,
          subjectId: data.subjectId,
          links: {
            set: links.map(({ link }) => link),
          },
          scheduleTeachers: {
            create: {
              teacherId,
              subjectId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const existingAttachments = await prisma.attachment.findMany({
        where: {
          nonCyclicScheduleId: nonCycleSchedule.id,
        },
      });

      const existingAttachmentKeys = new Set(existingAttachments.map(att => att.key));
      const newAttachmentKeys = new Set(attachments?.map(att => att.key) || []);

      const attachmentsToDelete = existingAttachments.filter(
        att => !newAttachmentKeys.has(att.key),
      );

      for (const attachment of attachmentsToDelete) {
        const filePath = path.join(process.cwd(), 'uploads', attachment.key);
        if (filePath) {
          await fs.promises.unlink(filePath);
        }
      }

      await prisma.attachment.deleteMany({
        where: {
          key: {
            in: attachmentsToDelete.map(att => att.key),
          },
        },
      });

      const attachmentsToCreate = attachments?.filter(att => !existingAttachmentKeys.has(att.key));

      if (attachmentsToCreate?.length) {
        await prisma.attachment.createMany({
          data: attachmentsToCreate.map(attachment => ({
            title: attachment.title,
            key: attachment.key,
            nonCycleSchedule: updatedSchedule.id,
            type: AttachmentTypeEnum.FILE,
            mimetype: attachment.mimetype,
          })),
        });
      }

      return updatedSchedule;
    });
  }

  static async createNonCyclicThematicPlan(
    nonCyclicScheduleId: string,
    data: AddEditThematicPlanValidation,
  ) {
    const { practicalClass, theoreticalClass } = data;

    prisma.thematicPlan
      .create({
        data: {
          nonCyclicScheduleId,
          totalHours: +practicalClass.totalHours,
          type: ThematicSubPlanTypeEnum.PRACTICAL,
          thematicPlanDescription: {
            create: practicalClass.classDescriptionRow.map(row => ({
              title: row.title,
              hour: row.hour,
            })),
          },
        },
      })
      .catch(console.error);

    return prisma.thematicPlan.create({
      data: {
        nonCyclicScheduleId,
        totalHours: +theoreticalClass.totalHours,
        type: ThematicSubPlanTypeEnum.THEORETICAL,
        thematicPlanDescription: {
          create: theoreticalClass.classDescriptionRow.map(row => ({
            title: row.title,
            hour: row.hour,
          })),
        },
      },
    });
  }

  static async updateNonCyclicThematicPlan(
    nonCyclicScheduleId: string,
    data: AddEditThematicPlanValidation,
  ) {
    await prisma.thematicPlan.deleteMany({
      where: { nonCyclicScheduleId },
    });

    return ScheduleResolver.createNonCyclicThematicPlan(nonCyclicScheduleId, data);
  }
}
