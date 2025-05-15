import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import AuthService from '../services/auth.service';

const Profile: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <Card className="profile-card">
            <Card.Body>
              <Card.Title>My Profile</Card.Title>
              {currentUser ? (
                <div>
                  <p><strong>Username:</strong> {currentUser.username}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Role:</strong> {currentUser.userType}</p>
                  <p><strong>Authorities:</strong></p>
                  <ul>
                    {currentUser.roles &&
                      currentUser.roles.map((role: string, index: number) => <li key={index}>{role}</li>)}
                  </ul>
                  <p><strong>Token:</strong> {currentUser.token.substring(0, 20)}...</p>
                </div>
              ) : (
                <p>Loading user information...</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 