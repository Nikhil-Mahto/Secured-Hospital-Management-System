interface User {
  token: string;
}

export default function authHeader(): { Authorization: string } {
  const userStr = localStorage.getItem('user');
  let user: User | null = null;
  
  if (userStr) {
    user = JSON.parse(userStr) as User;
  }

  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return { Authorization: '' };
  }
} 