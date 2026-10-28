import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import {
  Users, BookOpen, Award, CheckCircle, Clock, Trash2, Eye,
  ToggleLeft, ToggleRight, AlertCircle, PlusCircle, RefreshCw
} from 'lucide-react';

export const AdminDashboard = ({ onOpenManageQuestions, onOpenResultReview }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, usersData, examsData] = await Promise.all([
        api.dashboard.getAdminStats(),
        api.users.getAll(),
        api.exams.getAll()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setExams(examsData);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (examId) => {
    try {
      await api.exams.togglePublish(examId);
      setSuccess('Examination publication status updated.');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update publish status');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to permanently delete this examination?')) return;
    try {
      await api.exams.delete(examId);
      setSuccess('Examination deleted successfully.');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete exam');
    }
  };

  const handleToggleUserActive = async (user) => {
    try {
      await api.users.update(user.id, { ...user, active: !user.active });
      setSuccess(`User account ${!user.active ? 'activated' : 'deactivated'}.`);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.users.delete(userId);
      setSuccess('User deleted successfully.');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw className="spin" size={32} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading administrator portal...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div style={{ padding: '0 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Admin Console
          </span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Award size={18} />
          <span>System Overview</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          <BookOpen size={18} />
          <span>Manage Examinations</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          <span>User Accounts</span>
        </div>

        <div
          className={`sidebar-item ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <CheckCircle size={18} />
          <span>Results & Activity</span>
        </div>
      </aside>

      {/* Main Content Body */}
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

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              System Overview & Analytics
            </h2>

            {/* Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon indigo"><Users /></div>
                <div>
                  <div className="stat-value">{stats.totalStudents}</div>
                  <div className="stat-label">Total Students</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber"><Users /></div>
                <div>
                  <div className="stat-value">{stats.totalTeachers}</div>
                  <div className="stat-label">Total Teachers</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue"><BookOpen /></div>
                <div>
                  <div className="stat-value">{stats.totalExams}</div>
                  <div className="stat-label">Examinations</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon emerald"><Award /></div>
                <div>
                  <div className="stat-value">{stats.totalSubmissions}</div>
                  <div className="stat-label">Total Submissions</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon rose"><CheckCircle /></div>
                <div>
                  <div className="stat-value">{stats.averageScore}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>
            </div>

            {/* Recent Examinations Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><BookOpen size={18} /> Recent Examinations</h3>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Duration</th>
                      <th>Total Marks</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.slice(0, 5).map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.title}</strong></td>
                        <td>{e.subject}</td>
                        <td>{e.durationMinutes} mins</td>
                        <td>{e.totalMarks}</td>
                        <td>
                          <span className={`badge ${e.published ? 'badge-success' : 'badge-neutral'}`}>
                            {e.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onOpenManageQuestions(e)}
                          >
                            Questions ({e.questionCount})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. EXAMINATIONS TAB */}
        {activeTab === 'exams' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Manage All Examinations</h2>
            </div>

            <div className="card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title & Subject</th>
                      <th>Duration</th>
                      <th>Total Marks</th>
                      <th>Passing %</th>
                      <th>Questions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No examinations found in database.
                        </td>
                      </tr>
                    ) : (
                      exams.map(e => (
                        <tr key={e.id}>
                          <td>#{e.id}</td>
                          <td>
                            <strong>{e.title}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{e.subject}</div>
                          </td>
                          <td>{e.durationMinutes}m</td>
                          <td>{e.totalMarks}</td>
                          <td>{e.passingPercentage}%</td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onOpenManageQuestions(e)}
                            >
                              Manage ({e.questionCount})
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
                                {e.published ? 'Live' : 'Draft'}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteExam(e.id)}
                                title="Delete Examination"
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

        {/* 3. USERS MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              Manage User Accounts
            </h2>

            <div className="card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role?.toLowerCase().includes('admin') ? 'admin' : u.role?.toLowerCase().includes('teacher') ? 'teacher' : 'student'}`}>
                            {u.role?.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                            {u.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleToggleUserActive(u)}
                            >
                              {u.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. SUBMISSIONS & ACTIVITY TAB */}
        {activeTab === 'submissions' && stats && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              Student Submissions & Score History
            </h2>

            <div className="card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Student</th>
                      <th>Examination</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Result Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentResults?.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No submissions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      stats.recentResults?.map(res => (
                        <tr key={res.id}>
                          <td>#{res.id}</td>
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
                              <Eye size={14} /> Review
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
      </main>
    </div>
  );
};
