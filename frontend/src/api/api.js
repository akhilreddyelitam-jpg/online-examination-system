// Use the same hostname as the frontend so LAN access works too.
// Example: opening the frontend at 192.168.0.11:5173 calls 192.168.0.11:8080.
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8080/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      // Optional: Handle token expiration
    }
    const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    me: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Users
  users: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getStudents: async () => {
      const res = await fetch(`${API_BASE_URL}/users/students`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getTeachers: async () => {
      const res = await fetch(`${API_BASE_URL}/users/teachers`, { headers: getAuthHeaders() });
      return handleResponse(res);
    }
  },

  // Examinations
  exams: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/exams`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getPublished: async () => {
      const res = await fetch(`${API_BASE_URL}/exams/published`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getMyExams: async () => {
      const res = await fetch(`${API_BASE_URL}/exams/my-exams`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/exams/${id}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE_URL}/exams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    togglePublish: async (id) => {
      const res = await fetch(`${API_BASE_URL}/exams/${id}/publish`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Questions
  questions: {
    getByExam: async (examId) => {
      const res = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    add: async (examId, data) => {
      const res = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Attempts
  attempts: {
    start: async (examId) => {
      const res = await fetch(`${API_BASE_URL}/exams/${examId}/start`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    saveAnswers: async (attemptId, answers) => {
      const res = await fetch(`${API_BASE_URL}/attempts/${attemptId}/answers`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers })
      });
      return handleResponse(res);
    },
    submit: async (attemptId, answers = []) => {
      const res = await fetch(`${API_BASE_URL}/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers })
      });
      return handleResponse(res);
    },
    reportViolation: async (attemptId, reason) => {
      const res = await fetch(`${API_BASE_URL}/attempts/${attemptId}/violation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      return handleResponse(res);
    }
  },

  // Results
  results: {
    getMyResults: async () => {
      const res = await fetch(`${API_BASE_URL}/results/my-results`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getByAttemptId: async (attemptId) => {
      const res = await fetch(`${API_BASE_URL}/results/${attemptId}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getByExamId: async (examId) => {
      const res = await fetch(`${API_BASE_URL}/results/exam/${examId}`, { headers: getAuthHeaders() });
      return handleResponse(res);
    }
  },

  // Dashboards
  dashboard: {
    getAdminStats: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/admin/stats`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getTeacherStats: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/teacher/stats`, { headers: getAuthHeaders() });
      return handleResponse(res);
    },
    getStudentStats: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/student/stats`, { headers: getAuthHeaders() });
      return handleResponse(res);
    }
  }
};
