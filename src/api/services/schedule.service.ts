import { ScheduleListDataModel } from '@/utils/models/schedule';
import {
  AddEditThematicPlanValidation,
  CreateEditScheduleValidation,
} from '@/utils/validation/schedule';
import $apiClient from '../axiosClient';
import { QueryParams } from '../types/common';

export class ScheduleService {
  static list(params?: QueryParams): Promise<ScheduleListDataModel> {
    return $apiClient.get<ScheduleListDataModel>('/schedules/list', { params });
  }

  static createSchedule(data: CreateEditScheduleValidation) {
    return $apiClient.post('/schedules', data);
  }

  static updateSchedule(data: CreateEditScheduleValidation) {
    return $apiClient.patch(`/schedules/${data.id}`, data);
  }

  static deleteScheduleById(scheduleId: string) {
    return $apiClient.delete(`/schedules/${scheduleId}`);
  }

  static createThematicPlan(scheduleId: string, input: AddEditThematicPlanValidation) {
    return $apiClient.post(`/schedules/${scheduleId}/thematic-plan`, input);
  }

  static editThematicPlan(scheduleId: string, input: AddEditThematicPlanValidation) {
    return $apiClient.patch(`/schedules/${scheduleId}/thematic-plan`, input);
  }
}
