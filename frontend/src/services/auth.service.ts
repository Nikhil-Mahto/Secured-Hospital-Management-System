import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  contactNumber?: string;
  address?: string;
  specialty?: string;
  licenseNumber?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

class AuthService {
  login(username: string, password: string) {
    return axios
      .post(API_URL + 'login', {
        username,
        password
      })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(registerData: RegisterData, role: string) {
    const endpoint = role === 'patient' 
      ? 'register/patient' 
      : role === 'doctor' 
        ? 'register/doctor' 
        : 'register';
    
    return axios.post(API_URL + endpoint, registerData);
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);

    return null;
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  hasRole(roleName: string) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.userType === roleName;
  }
}

export default new AuthService(); 