import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/doctors/';

class DoctorService {
  getAssignedPatients() {
    return axios.get(API_URL + 'patients', { headers: authHeader() });
  }

  getAvailablePatients() {
    return axios.get(API_URL + 'available-patients', { headers: authHeader() });
  }

  assignPatient(patientId: number) {
    return axios.post(API_URL + `assign/${patientId}`, {}, { headers: authHeader() });
  }

  unassignPatient(patientId: number) {
    return axios.post(API_URL + `unassign/${patientId}`, {}, { headers: authHeader() });
  }
}

export default new DoctorService(); 