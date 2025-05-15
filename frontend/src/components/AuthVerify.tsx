import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const AuthVerify: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      const decodedJwt = parseJwt(user.token);

      if (decodedJwt.exp * 1000 < Date.now()) {
        AuthService.logout();
        navigate('/login');
      }
    }
  }, [location, navigate]);

  return <></>;
};

export default AuthVerify; 