import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/records/';

export interface MedicalRecordData {
  patientId?: number;
  recordType: string;
  encryptedContent: string;
  fileName?: string;
  contentType?: string;
}

class MedicalRecordService {
  getPatientRecords(patientId: number) {
    return axios.get(API_URL + `patient/${patientId}`, { headers: authHeader() });
  }

  getDoctorRecords() {
    return axios.get(API_URL + 'doctor', { headers: authHeader() });
  }

  uploadMedicalRecord(recordData: MedicalRecordData) {
    return axios.post(API_URL + 'upload', recordData, { headers: authHeader() });
  }

  decryptRecord(recordId: number, password: string) {
    return axios.post(
      API_URL + `decrypt/${recordId}`,
      { password },
      { headers: authHeader() }
    );
  }
}

export default new MedicalRecordService(); 