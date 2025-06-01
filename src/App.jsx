import './App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/admin-login');
  };
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🩸 Blood Link Admin Panel</h1>
        <p>Welcome to the Hospital Admin Dashboard</p>
      </header>

      <div className="admin-card">
        <h2> Onboard Your Hospital</h2>
        <p>Register your hospital to manage blood donations.</p>
        <button className="btn-primary" onClick={handleRegisterClick}>Register Hospital</button>
      </div>
    </div>
  );
}

export default App;
