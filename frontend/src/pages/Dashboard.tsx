/**
 * Dashboard Page
 * Protected page showing user info and logout button
 */

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Log Out
        </button>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '4px'
      }}>
        <h2>Welcome!</h2>
        <p><strong>Email:</strong> {currentUser?.email}</p>
        <p><strong>User ID:</strong> {currentUser?.uid}</p>
        <p style={{ marginTop: '20px', color: '#666' }}>
          This is a protected page. You can only see this because you're logged in.
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Next Steps</h3>
        <ul>
          <li>Take the baseline carbon quiz</li>
          <li>Log your daily activities</li>
          <li>View your carbon footprint trends</li>
          <li>Get personalized tips</li>
        </ul>
      </div>
    </div>
  );
}

// Made with Bob
