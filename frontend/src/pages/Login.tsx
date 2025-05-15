import React, { FormEvent, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!username || !password) {
      setMessage('All fields are required!');
      setLoading(false);
      return;
    }

    AuthService.login(username, password).then(
      (response) => {
        const userType = response.userType;
        if (userType === 'PATIENT') {
          navigate('/patient-dashboard');
        } else if (userType === 'DOCTOR') {
          navigate('/doctor-dashboard');
        } else if (userType === 'ADMIN') {
          navigate('/admin-dashboard');
        } else {
          navigate('/profile');
        }
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(false);
        setMessage(resMessage);
      }
    );
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Login</Card.Title>
              <Form onSubmit={handleLogin} className="auth-form">
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Loading...' : 'Login'}
                </Button>

                {message && (
                  <Alert variant="danger" className="mt-3">
                    {message}
                  </Alert>
                )}

                <div className="mt-3 text-center">
                  <p>
                    Don't have an account? <Link to="/register">Register</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 