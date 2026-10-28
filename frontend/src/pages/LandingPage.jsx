import React from 'react';
import { ShieldCheck, BookOpen, Clock, Award, Users, CheckCircle, ArrowRight } from 'lucide-react';

export const LandingPage = ({ onNavigate, onDemoLogin }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Online Examination System</h1>
        <p className="hero-subtitle">
          A secure, high-performance, and automated assessment platform engineered with
          React.js, Spring Boot, and MySQL for universities and institutions.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('login')}>
            Access Portal <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('register')}>
            Student Registration
          </button>
        </div>
      </section>

      {/* Demo Credentials Quick-Fill Cards */}
      <div style={{ maxWidth: '1100px', margin: '-40px auto 40px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', textAlign: 'center' }}>
            ⚡ Fast Demo Access — Click any role below to pre-fill credentials & log in
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Admin */}
            <div
              style={{
                border: '2px solid #fee2e2',
                backgroundColor: '#fff5f5',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={() => onDemoLogin('admin@exam.com', 'admin123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="role-badge admin">Administrator</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>1-Click Login &rarr;</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>admin@exam.com</strong> &bull; Pass: admin123
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Full system management, users, all exams, performance reports.
              </div>
            </div>

            {/* Teacher */}
            <div
              style={{
                border: '2px solid #fef3c7',
                backgroundColor: '#fffbeb',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={() => onDemoLogin('teacher@exam.com', 'teacher123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="role-badge teacher">Teacher / Examiner</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>1-Click Login &rarr;</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>teacher@exam.com</strong> &bull; Pass: teacher123
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Create exams, add MCQ & True/False questions, grade submissions.
              </div>
            </div>

            {/* Student */}
            <div
              style={{
                border: '2px solid #e0e7ff',
                backgroundColor: '#f5f7ff',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={() => onDemoLogin('student@exam.com', 'student123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="role-badge student">Student Candidate</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>1-Click Login &rarr;</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>student@exam.com</strong> &bull; Pass: student123
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Take timed certification tests, palette navigation, view score reviews.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <section className="features-grid">
        <div className="feature-box">
          <div className="feature-icon">
            <Clock size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Server-Enforced Timers</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Countdown timer with automatic auto-save every 10 seconds and hard server deadline
            validation. Timeouts submit immediately without losing answers.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">
            <Award size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Instant Auto-Evaluation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Submissions are automatically graded on the backend using weighted marks, optional
            negative marking penalties, and passing criteria formulas.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Secure Answer Masking</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Correct answers and explanations are never exposed to the student client prior
            to exam completion and authorized release.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">
            <Users size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Three-Tier Role Access</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Fine-grained role-based security separating Administrators, Teachers, and Students
            with dedicated analytics and management dashboards.
          </p>
        </div>
      </section>
    </div>
  );
};
