import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Tab, Table, Tabs } from 'react-bootstrap';
import AuthService from '../services/auth.service';
import DoctorService from '../services/doctor.service';
import MedicalRecordService from '../services/medical-record.service';

interface Patient {
  id: number;
  username: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  contactNumber?: string;
  address?: string;
  isAssigned: boolean;
}

interface MedicalRecord {
  id: number;
  patientName: string;
  recordType: string;
  createdAt: string;
}

const DoctorDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [password, setPassword] = useState<string>('');
  const [decryptedContent, setDecryptedContent] = useState<string>('');
  const [decryptError, setDecryptError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('records');

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadMedicalRecords();
      loadPatients();
    }
  }, []);

  const loadMedicalRecords = () => {
    setLoading(true);
    MedicalRecordService.getDoctorRecords()
      .then((response) => {
        setRecords(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading records:', error);
        setLoading(false);
      });
  };

  const loadPatients = () => {
    setLoading(true);
    // Load assigned patients
    DoctorService.getAssignedPatients()
      .then((response) => {
        setAssignedPatients(response.data);
      })
      .catch((error) => {
        console.error('Error loading assigned patients:', error);
      });
    
    // Load available patients
    DoctorService.getAvailablePatients()
      .then((response) => {
        setAvailablePatients(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading available patients:', error);
        setLoading(false);
      });
  };

  const handleAssignPatient = (patientId: number) => {
    setLoading(true);
    DoctorService.assignPatient(patientId)
      .then((response) => {
        setMessage(response.data.message);
        loadPatients(); // Reload patient lists
      })
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage(resMessage);
        setLoading(false);
      });
  };

  const handleUnassignPatient = (patientId: number) => {
    setLoading(true);
    DoctorService.unassignPatient(patientId)
      .then((response) => {
        setMessage(response.data.message);
        loadPatients(); // Reload patient lists
      })
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage(resMessage);
        setLoading(false);
      });
  };

  const handleDecryptRecord = (recordId: number) => {
    setSelectedRecord(recordId);
    setDecryptedContent('');
    setDecryptError('');
  };

  const submitDecryption = () => {
    if (!selectedRecord || !password) {
      setDecryptError('Password is required');
      return;
    }

    MedicalRecordService.decryptRecord(selectedRecord, password)
      .then((response) => {
        setDecryptedContent(response.data.content);
        setPassword('');
        setDecryptError('');
      })
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setDecryptError(resMessage);
      });
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h1>Doctor Dashboard</h1>
          <p>Welcome, Dr. {user?.username}</p>
        </Col>
      </Row>

      {message && (
        <Alert 
          variant={message.includes('Error') ? 'danger' : 'success'} 
          className="mt-3 mb-3" 
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
            onSelect={(k) => setActiveTab(k || 'records')}
            className="mb-3"
          >
            <Tab eventKey="records" title="Medical Records">
              <Card>
                <Card.Body>
                  <h3>Patient Records</h3>
                  
                  {selectedRecord && (
                    <Card className="mb-4">
                      <Card.Body>
                        <h5>Decrypt Record</h5>
                        <Form.Group className="mb-3">
                          <Form.Label>Enter patient's password to decrypt</Form.Label>
                          <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Patient password"
                          />
                        </Form.Group>
                        <Button 
                          variant="primary" 
                          onClick={submitDecryption} 
                          className="me-2"
                        >
                          Decrypt
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setSelectedRecord(null);
                            setPassword('');
                            setDecryptedContent('');
                            setDecryptError('');
                          }}
                        >
                          Cancel
                        </Button>

                        {decryptError && (
                          <Alert variant="danger" className="mt-3">
                            {decryptError}
                          </Alert>
                        )}

                        {decryptedContent && (
                          <div className="mt-3">
                            <h6>Decrypted Content:</h6>
                            <pre className="bg-light p-3 rounded">
                              {decryptedContent}
                            </pre>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )}

                  {loading ? (
                    <p>Loading records...</p>
                  ) : records.length === 0 ? (
                    <p>No medical records found.</p>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Patient</th>
                          <th>Type</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record) => (
                          <tr key={record.id}>
                            <td>{record.id}</td>
                            <td>{record.patientName}</td>
                            <td>{record.recordType}</td>
                            <td>{new Date(record.createdAt).toLocaleString()}</td>
                            <td>
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleDecryptRecord(record.id)}
                                className="me-2"
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="patients" title="My Patients">
              <Card>
                <Card.Body>
                  <h3>Assigned Patients</h3>
                  {loading ? (
                    <p>Loading patients...</p>
                  ) : assignedPatients.length === 0 ? (
                    <p>No patients assigned to you yet.</p>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Contact</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedPatients.map((patient) => (
                          <tr key={patient.id}>
                            <td>{patient.id}</td>
                            <td>{patient.fullName}</td>
                            <td>{patient.email}</td>
                            <td>{patient.contactNumber || 'N/A'}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleUnassignPatient(patient.id)}
                              >
                                Unassign
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="available" title="Available Patients">
              <Card>
                <Card.Body>
                  <h3>All Patients</h3>
                  {loading ? (
                    <p>Loading patients...</p>
                  ) : availablePatients.length === 0 ? (
                    <p>No patients available.</p>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availablePatients.map((patient) => (
                          <tr key={patient.id}>
                            <td>{patient.id}</td>
                            <td>{patient.fullName}</td>
                            <td>{patient.email}</td>
                            <td>{patient.isAssigned ? 'Assigned' : 'Not Assigned'}</td>
                            <td>
                              {!patient.isAssigned && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleAssignPatient(patient.id)}
                                >
                                  Assign to Me
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard; 