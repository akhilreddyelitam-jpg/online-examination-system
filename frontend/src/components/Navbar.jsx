import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, ShieldCheck } from 'lucide-react';

export const Navbar = ({ onNavigate, currentScreen }) => {
  const { user, logout } = useAuth();

  const getRoleBadgeClass = (role) => {
    if (!role) return '';
    if (role.includes('ADMIN')) return 'admin';
    if (role.includes('TEACHER')) return 'teacher';
    return 'student';
  };

  const formatRoleName = (role) => {
    if (!role) return '';
    if (role.includes('ADMIN')) return 'Admin';
    if (role.includes('TEACHER')) return 'Teacher';
    return 'Student';
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => onNavigate(user ? 'dashboard' : 'landing')}>
        <GraduationCap size={28} />
        <span>Online Examination System</span>
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <div className="nav-user">
              <User size={16} />
              <span>{user.name}</span>
              <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                {formatRoleName(user.role)}
              </span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              title="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('login')}
            >
              Log In
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('register')}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
