import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="page hero">
      <h1>Find your next room, or the right flatmate.</h1>
      <p>AI-scored matches between tenants and room owners, real-time chat, and instant notifications.</p>
      {!user && (
        <div className="hero-actions">
          <Link to="/register" className="btn">Get Started</Link>
          <Link to="/login" className="btn secondary">Log In</Link>
        </div>
      )}
    </div>
  );
}
