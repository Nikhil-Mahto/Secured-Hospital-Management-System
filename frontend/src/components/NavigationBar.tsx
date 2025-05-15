import React, { useEffect, useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const NavigationBar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Secure Hospital MS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {currentUser && currentUser.userType === 'PATIENT' && (
              <Nav.Link as={Link} to="/patient-dashboard">Patient Dashboard</Nav.Link>
            )}
            
            {currentUser && currentUser.userType === 'DOCTOR' && (
              <Nav.Link as={Link} to="/doctor-dashboard">Doctor Dashboard</Nav.Link>
            )}
            
            {currentUser && currentUser.userType === 'ADMIN' && (
              <Nav.Link as={Link} to="/admin-dashboard">Admin Dashboard</Nav.Link>
            )}
          </Nav>
          
          {currentUser ? (
            <Nav>
              <NavDropdown title={currentUser.username} id="user-dropdown">
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logOut}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 