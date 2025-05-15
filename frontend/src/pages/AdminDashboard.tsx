import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, ListGroup, Modal, Row, Tab, Tabs } from 'react-bootstrap';
import authHeader from '../services/auth-header';
import AuthService from '../services/auth.service';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface Doctor {
  id: number;
  user: User;
  specialty: string;
  licenseNumber: string;
}

interface Patient {
  id: number;
  user: User;
  dateOfBirth: string;
  contactNumber: string;
  address: string;
}

const AdminDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('users');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadData();
    }
  }, []);

  const loadData = () => {
    setLoading(true);
    
    // Load all users
    axios.get('http://localhost:8080/api/admin/users', { headers: authHeader() })
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading users:', error);
        setLoading(false);
      });
    
    // Load doctors
    axios.get('http://localhost:8080/api/admin/doctors', { headers: authHeader() })
      .then(response => {
        setDoctors(response.data);
      })
      .catch(error => {
        console.error('Error loading doctors:', error);
      });
    
    // Load patients
    axios.get('http://localhost:8080/api/admin/patients', { headers: authHeader() })
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => {
        console.error('Error loading patients:', error);
      });
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    
    setLoading(true);
    axios.delete(`http://localhost:8080/api/admin/users/${userToDelete.id}`, { headers: authHeader() })
      .then(response => {
        setMessage(response.data.message);
        loadData(); // Reload data
        setShowDeleteModal(false);
        setUserToDelete(null);
      })
      .catch(error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage(resMessage);
        setLoading(false);
        setShowDeleteModal(false);
      });
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {currentUser?.username}</p>
        </Col>
      </Row>

      {message && (
        <Alert 
          variant={message.includes('Error') ? 'danger' : 'success'} 
          className="mt-3" 
          onClose={() => setMessage('')}
          dismissible
        >
          {message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'users')}
            className="mb-3"
          >
            <Tab eventKey="users" title="All Users">
              <Card>
                <Card.Body>
                  <h3>System Users</h3>
                  {loading ? (
                    <p>Loading users...</p>
                  ) : (
                    <ListGroup>
                      {users.map(user => (
                        <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5>{user.firstName} {user.lastName}</h5>
                            <p className="mb-0">Username: {user.username}</p>
                            <p className="mb-0">Email: {user.email}</p>
                            <p className="mb-0">Roles: {user.roles.join(', ')}</p>
                          </div>
                          <Button 
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.username === 'admin'} // Prevent deleting admin
                          >
                            Delete
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="doctors" title="Doctors">
              <Card>
                <Card.Body>
                  <h3>Doctors</h3>
                  {loading ? (
                    <p>Loading doctors...</p>
                  ) : (
                    <ListGroup>
                      {doctors.map(doctor => (
                        <ListGroup.Item key={doctor.id}>
                          <h5>{doctor.user.firstName} {doctor.user.lastName}</h5>
                          <p className="mb-0">Email: {doctor.user.email}</p>
                          <p className="mb-0">Specialty: {doctor.specialty}</p>
                          <p className="mb-0">License Number: {doctor.licenseNumber}</p>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="patients" title="Patients">
              <Card>
                <Card.Body>
                  <h3>Patients</h3>
                  {loading ? (
                    <p>Loading patients...</p>
                  ) : (
                    <ListGroup>
                      {patients.map(patient => (
                        <ListGroup.Item key={patient.id}>
                          <h5>{patient.user.firstName} {patient.user.lastName}</h5>
                          <p className="mb-0">Email: {patient.user.email}</p>
                          <p className="mb-0">Date of Birth: {patient.dateOfBirth || 'N/A'}</p>
                          <p className="mb-0">Contact: {patient.contactNumber || 'N/A'}</p>
                          <p className="mb-0">Address: {patient.address || 'N/A'}</p>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="stats" title="System Stats">
              <Card>
                <Card.Body>
                  <h3>System Statistics</h3>
                  <Row>
                    <Col md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <h5>Total Users</h5>
                          <h2>{users.length}</h2>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <h5>Doctors</h5>
                          <h2>{doctors.length}</h2>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <h5>Patients</h5>
                          <h2>{patients.length}</h2>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Delete User Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the user: {userToDelete?.username}?
          <p className="text-danger mt-2">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteUser}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard; 