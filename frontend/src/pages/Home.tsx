import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container>
      <Row className="my-5">
        <Col>
          <div className="text-center">
            <h1>Secure Hospital Management System</h1>
            <p className="lead">
              A secure platform for managing patient records with AES-256 encryption
            </p>
          </div>
        </Col>
      </Row>

      <Row className="my-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>For Patients</Card.Title>
              <Card.Text>
                Securely store and access your medical records. Only you and authorized doctors have access to your information.
              </Card.Text>
              <Link to="/register">
                <Button variant="primary">Register as Patient</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>For Doctors</Card.Title>
              <Card.Text>
                Access patient records securely and efficiently. Maintain patient confidentiality with state-of-the-art encryption.
              </Card.Text>
              <Link to="/register">
                <Button variant="primary">Register as Doctor</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Security First</Card.Title>
              <Card.Text>
                AES-256 encryption ensures your data is secure. Role-based access control ensures only authorized personnel can access data.
              </Card.Text>
              <Link to="/login">
                <Button variant="primary">Login</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="my-5">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>How It Works</Card.Title>
              <Card.Text>
                <ol>
                  <li>Patient registers and receives a unique encryption key</li>
                  <li>Medical records are encrypted before storage</li>
                  <li>Only the patient and authorized doctors can decrypt and view records</li>
                  <li>All data transmission is secured with HTTPS and JWT authentication</li>
                </ol>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 