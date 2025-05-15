import React, { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import AuthService from '../services/auth.service';
import CryptoService from '../services/crypto.service';
import MedicalRecordService, { MedicalRecordData } from '../services/medical-record.service';

interface MedicalRecord {
  id: number;
  recordType: string;
  encryptedContent: string;
  fileName?: string;
  contentType?: string;
  createdAt: string;
  doctorName?: string;
}

const PatientDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [recordType, setRecordType] = useState<string>('');
  const [recordContent, setRecordContent] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [password, setPassword] = useState<string>('');
  const [decryptedContent, setDecryptedContent] = useState<string>('');
  const [decryptError, setDecryptError] = useState<string>('');

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadMedicalRecords(currentUser.id);
    }
  }, []);

  const loadMedicalRecords = (userId: number) => {
    setLoading(true);
    MedicalRecordService.getPatientRecords(userId)
      .then((response) => {
        setMedicalRecords(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading records:', error);
        setLoading(false);
      });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!recordType || !recordContent) {
      setMessage('Record type and content are required');
      return;
    }

    setLoading(true);
    
    try {
      // Generate a random IV for this encryption
      const iv = CryptoService.generateIV();
      
      // Generate a random salt for key derivation
      const salt = CryptoService.generateSalt();
      
      // In a real application, we would retrieve the patient's salt and AES key from backend
      // For demo, we'll use a derived key from the user's password with the generated salt
      const password = prompt("Enter your password to encrypt this record") || '';
      if (!password) {
        setMessage('Password is required for encryption');
        setLoading(false);
        return;
      }
      
      // Derive a key from the password using PBKDF2
      const key = CryptoService.deriveKeyFromPassword(password, salt);
      
      // Encrypt the record content
      const encryptedContent = CryptoService.encrypt(recordContent, key, iv);
      
      const recordData: MedicalRecordData = {
        recordType,
        encryptedContent,
        fileName: `${recordType}_${new Date().toISOString()}`,
        contentType: 'text/plain'
      };
      
      MedicalRecordService.uploadMedicalRecord(recordData)
        .then((response) => {
          setMessage(response.data.message);
          setRecordType('');
          setRecordContent('');
          setShowForm(false);
          // Reload records
          loadMedicalRecords(user.id);
          setLoading(false);
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
    } catch (error) {
      setMessage('Error encrypting content');
      setLoading(false);
    }
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
          <h1>Patient Dashboard</h1>
          <p>Welcome, {user?.username}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>My Medical Records</h3>
                <Button 
                  variant="primary" 
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? 'Cancel' : 'Add New Record'}
                </Button>
              </div>

              {showForm && (
                <Card className="mb-4">
                  <Card.Body>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Record Type</Form.Label>
                        <Form.Control
                          type="text"
                          value={recordType}
                          onChange={(e) => setRecordType(e.target.value)}
                          placeholder="E.g., Blood Test, Prescription, Note"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Record Content</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={recordContent}
                          onChange={(e) => setRecordContent(e.target.value)}
                          placeholder="Enter the medical record information here"
                          required
                        />
                        <Form.Text className="text-muted">
                          This content will be encrypted before storage. Only you and authorized doctors can view it.
                        </Form.Text>
                      </Form.Group>

                      <Button 
                        variant="success" 
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Record'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              )}

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

              {selectedRecord && (
                <Card className="mb-4">
                  <Card.Body>
                    <h5>Decrypt Record</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Enter your password to decrypt</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
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
              ) : medicalRecords.length === 0 ? (
                <p>No medical records found.</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Created At</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.recordType}</td>
                        <td>{new Date(record.createdAt).toLocaleString()}</td>
                        <td>{record.doctorName || 'Self'}</td>
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
        </Col>
      </Row>
    </Container>
  );
};

export default PatientDashboard; 