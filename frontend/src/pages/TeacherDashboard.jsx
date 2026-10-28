import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import {
  BookOpen, PlusCircle, CheckCircle, Award, Eye, Trash2, Edit3,
  ToggleLeft, ToggleRight, AlertCircle, FileText, X, RefreshCw
} from 'lucide-react';

export const TeacherDashboard = ({ onOpenManageQuestions, onOpenResultReview }) => {
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('exams');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create/Edit Exam Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examForm, setExamForm] = useState({
    title: '',
    subject: '',
    description: '',
    durationMinutes: 30,
    totalMarks: 50,
    passingPercentage: 50,
    negativeMarkingEnabled: false,
    defaultNegativeMarks: 0.5,
    safeExamBrowserEnabled: false,
    published: false
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, examsData] = await Promise.all([
        api.dashboard.getTeacherStats(),
        api.exams.getMyExams()
      ]);
      setStats(statsData);
      setExams(examsData);
      setSubmissions(statsData.recentSubmissions || []);
    } catch (err) {
      setError(err.message || 'Failed to load teacher dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingExamId(null);
    setExamForm({
      title: '',
      subject: '',
      description: '',
      durationMinutes: 30,
      totalMarks: 50,
      passingPercentage: 50,
      negativeMarkingEnabled: false,
      defaultNegativeMarks: 0.5,
      safeExamBrowserEnabled: false,
      published: false
    });
    setShowExamModal(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExamId(exam.id);
    setExamForm({
      title: exam.title,
      subject: exam.subject,
      description: exam.description || '',
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      passingPercentage: exam.passingPercentage,
      negativeMarkingEnabled: exam.negativeMarkingEnabled || false,
      defaultNegativeMarks: exam.defaultNegativeMarks || 0.0,
      safeExamBrowserEnabled: exam.safeExamBrowserEnabled || false,
      published: exam.published
    });
    setShowExamModal(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    try {
      if (editingExamId) {
        await api.exams.update(editingExamId, examForm);
        setSuccess('Examination updated successfully.');
      } else {
        await api.exams.create(examForm);
        setSuccess('Examination created successfully.');
      }
      setShowExamModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save examination');
    }
  };

  const handleTogglePublish = async (examId) => {
    try {
      await api.exams.togglePublish(examId);
      setSuccess('Publication status updated.');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this examination?')) return;
    try {
      await api.exams.delete(examId);
      setSuccess('Examination deleted.');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw className="spin" size={32} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading teacher workspace...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div style={{ padding: '0 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Teacher Workspace
          </span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          <BookOpen size={18} />
          <span>My Examinations</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <Award size={18} />
          <span>Student Submissions</span>
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

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon indigo"><BookOpen /></div>
              <div>
                <div className="stat-value">{stats.totalExams}</div>
                <div className="stat-label">Total Exams</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emerald"><CheckCircle /></div>
              <div>
                <div className="stat-value">{stats.publishedExams}</div>
                <div className="stat-label">Published Live</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon amber"><FileText /></div>
              <div>
                <div className="stat-value">{stats.totalSubmissions}</div>
                <div className="stat-label">Submissions</div>
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

        {/* 1. MY EXAMINATIONS TAB */}
        {activeTab === 'exams' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>My Examinations</h2>
              <button className="btn btn-primary" onClick={handleOpenCreate}>
                <PlusCircle size={18} /> Create Examination
              </button>
            </div>

            <div className="card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Title & Subject</th>
                      <th>Duration</th>
                      <th>Total Marks</th>
                      <th>Passing %</th>
                      <th>Negative Marking</th>
                      <th>Questions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          You have not created any examinations yet. Click "Create Examination" to start.
                        </td>
                      </tr>
                    ) : (
                      exams.map(e => (
                        <tr key={e.id}>
                          <td>
                            <strong>{e.title}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{e.subject}</div>
                          </td>
                          <td>{e.durationMinutes} mins</td>
                          <td>{e.totalMarks}</td>
                          <td>{e.passingPercentage}%</td>
                          <td>
                            {e.negativeMarkingEnabled ? (
                              <span className="badge badge-warning">-{e.defaultNegativeMarks}</span>
                            ) : (
                              <span className="badge badge-neutral">Off</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => onOpenManageQuestions(e)}
                            >
                              Questions ({e.questionCount})
                            </button>
                          </td>
                          <td>
                            <span className={`badge ${e.published ? 'badge-success' : 'badge-neutral'}`}>
                              {e.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleTogglePublish(e.id)}
                                title={e.published ? 'Unpublish' : 'Publish'}
                              >
                                {e.published ? <ToggleRight size={16} color="#10b981" /> : <ToggleLeft size={16} />}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEdit(e)}
                                title="Edit Exam"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteExam(e.id)}
                                title="Delete Exam"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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

        {/* 2. SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              Student Submissions & Score Reviews
            </h2>

            <div className="card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Attempt ID</th>
                      <th>Student Name</th>
                      <th>Examination</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Result</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No student submissions for your examinations yet.
                        </td>
                      </tr>
                    ) : (
                      submissions.map(res => (
                        <tr key={res.id}>
                          <td>#{res.attemptId}</td>
                          <td><strong>{res.studentName}</strong></td>
                          <td>{res.examTitle}</td>
                          <td>{res.marksObtained} / {res.totalMarks}</td>
                          <td><strong>{res.percentage}%</strong></td>
                          <td>
                            <span className={`badge ${res.passed ? 'badge-success' : 'badge-danger'}`}>
                              {res.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => onOpenResultReview(res.attemptId)}
                            >
                              <Eye size={14} /> Detailed Review
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

        {/* CREATE / EDIT EXAM MODAL */}
        {showExamModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingExamId ? 'Edit Examination' : 'Create New Examination'}</h3>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowExamModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveExam}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Examination Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={examForm.title}
                      onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                      placeholder="e.g. Midterm Java & Data Structures Exam"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={examForm.subject}
                      onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                      placeholder="e.g. Computer Science"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description / Instructions</label>
                    <textarea
                      className="form-control"
                      value={examForm.description}
                      onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                      placeholder="Instructions, topics covered, guidelines..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Duration (Minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={examForm.durationMinutes}
                        onChange={(e) => setExamForm({ ...examForm, durationMinutes: parseInt(e.target.value) || 0 })}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Marks</label>
                      <input
                        type="number"
                        className="form-control"
                        value={examForm.totalMarks}
                        onChange={(e) => setExamForm({ ...examForm, totalMarks: parseFloat(e.target.value) || 0 })}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Passing Percentage (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={examForm.passingPercentage}
                        onChange={(e) => setExamForm({ ...examForm, passingPercentage: parseFloat(e.target.value) || 0 })}
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={examForm.negativeMarkingEnabled}
                        onChange={(e) => setExamForm({ ...examForm, negativeMarkingEnabled: e.target.checked })}
                      />
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>Enable Negative Marking</span>
                    </label>

                    {examForm.negativeMarkingEnabled && (
                      <div className="form-group" style={{ marginLeft: '26px' }}>
                        <label className="form-label">Default Negative Marks Penalty per Wrong Answer</label>
                        <input
                          type="number"
                          step="0.25"
                          className="form-control"
                          value={examForm.defaultNegativeMarks}
                          onChange={(e) => setExamForm({ ...examForm, defaultNegativeMarks: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    )}

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={examForm.safeExamBrowserEnabled}
                        onChange={(e) => setExamForm({ ...examForm, safeExamBrowserEnabled: e.target.checked })}
                      />
                      <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--primary)' }}>🛡️ Safe Exam Browser Mode (Enforce Fullscreen Kiosk & Anti-Cheating)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={examForm.published}
                        onChange={(e) => setExamForm({ ...examForm, published: e.target.checked })}
                      />
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>Publish Immediately (Available to Students)</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowExamModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingExamId ? 'Update Exam' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
