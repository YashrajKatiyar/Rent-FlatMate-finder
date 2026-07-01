import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Rent &amp; Flatmate Finder</Link>
      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user?.role === 'tenant' && (
          <>
            <Link to="/tenant">Browse Listings</Link>
            <Link to="/tenant/profile">My Profile</Link>
            <Link to="/tenant/interests">My Interests</Link>
          </>
        )}
        {user?.role === 'owner' && (
          <>
            <Link to="/owner">My Listings</Link>
            <Link to="/owner/interests">Received Interests</Link>
          </>
        )}
        {user?.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
        {user && <Link to="/chat">Chat</Link>}
        {user && (
          <button className="link-btn" onClick={handleLogout}>
            Logout ({user.name})
          </button>
        )}
      </div>
    </nav>
  );
}
