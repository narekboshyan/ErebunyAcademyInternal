import cron from 'node-cron';
import { CronResolver } from '../../src/lib/prisma/resolvers/cron.resolver';
import { Logger } from '../../src/utils/logger';
import { CronExpression } from '../cron-exression';

const task = async () => {
  Logger.cron('Checking Exam status ');
  CronResolver.checkExamStatus().catch(err => Logger.err(err));
};

cron.schedule(
  CronExpression.EVERY_30_SECONDS,
  () => {
    setTimeout(task, 2000);
  },
  {
    scheduled: true,
    timezone: 'Asia/Yerevan',
  },
);
