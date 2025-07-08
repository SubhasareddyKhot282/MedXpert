import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = Cookies.get('token');
        const userType = Cookies.get('userType') || localStorage.getItem('userType');

        console.log('Token:', token);
        console.log('UserType:', userType);

        if (!token || !userType) {
          console.log('No token or userType found');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify token with backend
        const response = await axios.get('http://localhost:3000/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        console.log('Verification response:', response.data);

        if (response.data.success && (!requiredRole || response.data.role === requiredRole)) {
          console.log('Authentication successful');
          setIsAuthenticated(true);
        } else {
          console.log('Authentication failed:', response.data);
          setIsAuthenticated(false);
          // Clear invalid cookies
          Cookies.remove('token', { path: '/', domain: 'localhost' });
          Cookies.remove('userType', { path: '/', domain: 'localhost' });
          localStorage.removeItem('userType');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthenticated(false);
        // Clear invalid cookies
        Cookies.remove('token', { path: '/', domain: 'localhost' });
        Cookies.remove('userType', { path: '/', domain: 'localhost' });
        localStorage.removeItem('userType');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 