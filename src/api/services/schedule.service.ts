import {
  GetNoCyclicDetailsType,
  NoneCyclicScheduleListDataModel,
} from '@/utils/models/none-cyclic.schedule';
import { GetCyclicDetailsType, ScheduleListDataModel } from '@/utils/models/schedule';
import { CreateEditNonCylicScheduleValidation } from '@/utils/validation/non-cyclic';
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

  static getCyclicScheduleDetails(scheduleId: string): Promise<GetCyclicDetailsType> {
    return $apiClient.get<GetCyclicDetailsType>(`/schedules/cyclic/${scheduleId}`);
  }

  // NONE-CYCLIC
  static noneCyclicList(params?: QueryParams): Promise<NoneCyclicScheduleListDataModel> {
    return $apiClient.get<NoneCyclicScheduleListDataModel>('/schedules/none-cyclic/list', {
      params,
    });
  }

  static createNoneCyclicSchedule(data: CreateEditNonCylicScheduleValidation) {
    return $apiClient.post('/schedules/none-cyclic', data);
  }

  static updateNoneCyclicSchedule(data: CreateEditNonCylicScheduleValidation) {
    return $apiClient.patch(`/schedules/none-cyclic/${data.id}`, data);
  }

  static deleteNoneCyclicScheduleById(scheduleId: string) {
    return $apiClient.delete(`/schedules/none-cyclic/${scheduleId}`);
  }

  static createNoCyclicThematicPlan(scheduleId: string, input: AddEditThematicPlanValidation) {
    return $apiClient.post(`/schedules/${scheduleId}/no-cyclic/thematic-plan`, input);
  }

  static editNoneCyclicThematicPlan(scheduleId: string, input: AddEditThematicPlanValidation) {
    return $apiClient.patch(`/schedules/none-cyclic/${scheduleId}/thematic-plan`, input);
  }

  static getNoCyclicScheduleDetails(scheduleId: string): Promise<GetNoCyclicDetailsType> {
    return $apiClient.get<GetNoCyclicDetailsType>(`/schedules/none-cyclic/${scheduleId}`);
  }
}
