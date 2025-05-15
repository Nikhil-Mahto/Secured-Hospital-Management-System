import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import MedicalRecordService from '../services/medical-record.service';

const MedicalRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [decryptedContent, setDecryptedContent] = useState<string>('');

  const handleDecrypt = () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    MedicalRecordService.decryptRecord(Number(id), password)
      .then((response) => {
        setDecryptedContent(response.data.content);
        setPassword('');
        setError('');
        setLoading(false);
      })
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setError(resMessage);
        setLoading(false);
      });
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Medical Record #{id}</Card.Title>
              
              {!decryptedContent ? (
                <Form>
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
                    onClick={handleDecrypt} 
                    disabled={loading}
                  >
                    {loading ? 'Decrypting...' : 'Decrypt'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="ms-2"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                </Form>
              ) : (
                <div>
                  <h5>Decrypted Content:</h5>
                  <pre className="bg-light p-3 rounded">
                    {decryptedContent}
                  </pre>
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MedicalRecord; 