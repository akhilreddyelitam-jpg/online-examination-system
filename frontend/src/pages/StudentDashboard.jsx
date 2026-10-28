import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import {
  BookOpen, Clock, Award, CheckCircle, Play, Eye, AlertCircle, FileText, X, RefreshCw
} from 'lucide-react';

export const StudentDashboard = ({ onStartExam, onOpenResultReview }) => {
  const [stats, setStats] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Instructions Modal State
  const [selectedExamForInstructions, setSelectedExamForInstructions] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, examsData, resultsData] = await Promise.all([
        api.dashboard.getStudentStats(),
        api.exams.getPublished(),
        api.results.getMyResults()
      ]);
      setStats(statsData);
      setAvailableExams(examsData);
      setResults(resultsData);
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenInstructions = (exam) => {
    setSelectedExamForInstructions(exam);
  };

  const handleConfirmStart = () => {
    if (selectedExamForInstructions) {
      const exam = selectedExamForInstructions;
      setSelectedExamForInstructions(null);
      onStartExam(exam.id);
    }
  };

  const isExamAttempted = (examId) => {
    return results.some(r => r.examId === examId);
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw className="spin" size={32} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading student portal...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div style={{ padding: '0 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Student Workspace
          </span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <BookOpen size={18} />
          <span>Available Exams</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <Award size={18} />
          <span>My Results & Scores</span>
        </div>
      </aside>

      {/* Main Body */}
      <main className="dashboard-body">
        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon indigo"><BookOpen /></div>
              <div>
                <div className="stat-value">{stats.availableExams}</div>
                <div className="stat-label">Available to Take</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emerald"><CheckCircle /></div>
              <div>
                <div className="stat-value">{stats.completedExams}</div>
                <div className="stat-label">Completed Exams</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue"><Award /></div>
              <div>
                <div className="stat-value">{stats.passedExams}</div>
                <div className="stat-label">Certificates / Passed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon rose"><Award /></div>
              <div>
                <div className="stat-value">{stats.averageScore}%</div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>
          </div>
        )}

        {/* 1. AVAILABLE EXAMS TAB */}
        {activeTab === 'available' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              Published Examinations
            </h2>

            {availableExams.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>There are currently no examinations published for students.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {availableExams.map(exam => {
                  const alreadyDone = isExamAttempted(exam.id);
                  return (
                    <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="card-header">
                        <span className="badge badge-info">{exam.subject}</span>
                        {alreadyDone ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-neutral">Ready to Take</span>
                        )}
                      </div>

                      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                          {exam.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', flex: 1 }}>
                          {exam.description || 'Comprehensive objective assessment.'}
                        </p>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          marginBottom: '20px',
                          fontSize: '13px',
                          textAlign: 'center'
                        }}>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Duration</div>
                            <strong>{exam.durationMinutes}m</strong>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Marks</div>
                            <strong>{exam.totalMarks}</strong>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Pass %</div>
                            <strong>{exam.passingPercentage}%</strong>
                          </div>
                        </div>

                        {alreadyDone ? (
                          <button
                            className="btn btn-secondary"
                            onClick={() => setActiveTab('results')}
                            style={{ width: '100%' }}
                          >
                            <Eye size={16} /> View My Attempt Result
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleOpenInstructions(exam)}
                            style={{ width: '100%' }}
                          >
                            <Play size={16} /> Start Examination
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. RESULTS & SCORES TAB */}
        {activeTab === 'results' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              My Examination Scores & History
            </h2>

            <div className="card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Exam Title</th>
                      <th>Subject</th>
                      <th>Questions</th>
                      <th>Score Obtained</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          You have not completed any examinations yet.
                        </td>
                      </tr>
                    ) : (
                      results.map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.examTitle}</strong></td>
                          <td>{r.subject}</td>
                          <td>{r.answeredQuestions} / {r.totalQuestions} Answered</td>
                          <td>{r.marksObtained} / {r.totalMarks}</td>
                          <td><strong>{r.percentage}%</strong></td>
                          <td>
                            <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>
                              {r.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onOpenResultReview(r.attemptId)}
                            >
                              <Eye size={14} /> Review Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INSTRUCTIONS MODAL */}
        {selectedExamForInstructions && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Examination Instructions &bull; {selectedExamForInstructions.title}</h3>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setSelectedExamForInstructions(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{
                  padding: '16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '10px',
                  border: '1px solid #bfdbfe',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ color: '#1e40af', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                    Exam Overview
                  </h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>
                    <li>Subject: <strong>{selectedExamForInstructions.subject}</strong></li>
                    <li>Duration: <strong>{selectedExamForInstructions.durationMinutes} Minutes</strong></li>
                    <li>Total Marks: <strong>{selectedExamForInstructions.totalMarks}</strong></li>
                    <li>Passing Percentage: <strong>{selectedExamForInstructions.passingPercentage}%</strong></li>
                    {selectedExamForInstructions.negativeMarkingEnabled && (
                      <li style={{ color: '#b91c1c' }}>
                        Warning: Negative marking is active! (-{selectedExamForInstructions.defaultNegativeMarks} per incorrect answer).
                      </li>
                    )}
                  </ul>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>
                  Candidate Instructions:
                </h4>
                <ol style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.7' }}>
                  <li>Once you click <strong>"Begin Exam"</strong>, the timer will start immediately on the server.</li>
                  <li>You can navigate between questions using the Question Palette on the right.</li>
                  <li>Use the <strong>"Mark for Review"</strong> button if you wish to revisit questions later.</li>
                  <li>Your answers are saved periodically every few seconds to prevent accidental data loss.</li>
                  <li>When the countdown timer expires, your exam will automatically submit.</li>
                  <li>Do not refresh or leave the examination screen while taking the test.</li>
                </ol>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedExamForInstructions(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmStart}
                >
                  <Play size={16} /> I Understand, Begin Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
