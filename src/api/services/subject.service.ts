import $apiClient from '../axiosClient';

export class SubjectService {
  static getSubjectList() {
    return $apiClient.get('/subjects/list');
  }
}
