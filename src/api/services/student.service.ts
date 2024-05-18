import { StudentsExamListModel, StudentsListModel } from '@/utils/models/student';
import $apiClient from '../axiosClient';
import { QueryParams } from '../types/common';

export class StudentService {
  static list(params: QueryParams) {
    return $apiClient.get<StudentsListModel>('/students/list', { params });
  }
  static getStudentsByStudentGradeGroupId(id: string) {
    return $apiClient.get<StudentsExamListModel>(`/students/student-grade-group/${id}`);
  }
}
