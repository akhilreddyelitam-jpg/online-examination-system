import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ExamScreen } from './pages/ExamScreen';
import { ResultReviewScreen } from './pages/ResultReviewScreen';
import { ManageQuestionsModal } from './components/ManageQuestionsModal';

const AppContent = () => {
  const { user, login, loading } = useAuth();
  const [screen, setScreen] = useState('landing');
  const [activeExamId, setActiveExamId] = useState(null);
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [managingExam, setManagingExam] = useState(null); // for questions modal

  // Quick Demo Login helper from Landing page
  const handleDemoLogin = async (email, password) => {
    try {
      await login(email, password);
      setScreen('dashboard');
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    }
  };

  const handleStartExam = (examId) => {
    setActiveExamId(examId);
    setScreen('taking-exam');
  };

  const handleExamSubmitted = (attemptId) => {
    setActiveAttemptId(attemptId);
    setScreen('result-review');
  };

  const handleOpenResultReview = (attemptId) => {
    setActiveAttemptId(attemptId);
    setScreen('result-review');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            Online Examination System
          </div>
          <div style={{ color: '#64748b' }}>Loading application context...</div>
        </div>
      </div>
    );
  }

  // If taking exam, show distraction-free screen without global navbar
  if (screen === 'taking-exam' && activeExamId) {
    return (
      <ExamScreen
        examId={activeExamId}
        onExamSubmitted={handleExamSubmitted}
        onExit={() => setScreen('dashboard')}
      />
    );
  }

  return (
    <div className="app-container">
      <Navbar
        onNavigate={(target) => {
          if (target === 'dashboard' && !user) {
            setScreen('login');
          } else {
            setScreen(target);
          }
        }}
        currentScreen={screen}
      />

      <main className="main-content">
        {/* Landing Page */}
        {screen === 'landing' && !user && (
          <LandingPage
            onNavigate={setScreen}
            onDemoLogin={handleDemoLogin}
          />
        )}

        {/* Login Page */}
        {screen === 'login' && !user && (
          <LoginPage
            onNavigate={setScreen}
          />
        )}

        {/* Register Page */}
        {screen === 'register' && !user && (
          <RegisterPage
            onNavigate={setScreen}
          />
        )}

        {/* Authenticated Dashboard */}
        {(screen === 'dashboard' || (user && (screen === 'landing' || screen === 'login' || screen === 'register'))) && user && (
          <>
            {user.role === 'ROLE_ADMIN' && (
              <AdminDashboard
                onOpenManageQuestions={(exam) => setManagingExam(exam)}
                onOpenResultReview={handleOpenResultReview}
              />
            )}

            {user.role === 'ROLE_TEACHER' && (
              <TeacherDashboard
                onOpenManageQuestions={(exam) => setManagingExam(exam)}
                onOpenResultReview={handleOpenResultReview}
              />
            )}

            {user.role === 'ROLE_STUDENT' && (
              <StudentDashboard
                onStartExam={handleStartExam}
                onOpenResultReview={handleOpenResultReview}
              />
            )}
          </>
        )}

        {/* Result Review Screen */}
        {screen === 'result-review' && activeAttemptId && (
          <ResultReviewScreen
            attemptId={activeAttemptId}
            onBack={() => setScreen('dashboard')}
          />
        )}
      </main>

      {/* Global Questions Management Modal for Teachers & Admins */}
      {managingExam && (
        <ManageQuestionsModal
          exam={managingExam}
          onClose={() => setManagingExam(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
