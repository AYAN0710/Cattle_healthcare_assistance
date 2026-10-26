const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getToken = () => localStorage.getItem('bovicare_token');
export const setToken = (token) => localStorage.setItem('bovicare_token', token);
export const removeToken = () => localStorage.getItem('bovicare_token') ? localStorage.removeItem('bovicare_token') : null;
export const getUserEmail = () => localStorage.getItem('bovicare_user_email');
export const setUserEmail = (email) => localStorage.setItem('bovicare_user_email', email);

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Authentication
  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    return data;
  },

  async verifyEmail(email, otp) {
    const url = new URL(`${API_BASE_URL}/auth/verify-email`);
    url.searchParams.append('email', email);
    url.searchParams.append('otp', otp);

    const res = await fetch(url.toString(), {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Email verification failed');
    return data;
  },

  async resendOtp(email) {
    const url = new URL(`${API_BASE_URL}/auth/resend-otp`);
    url.searchParams.append('email', email);

    const res = await fetch(url.toString(), {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to resend OTP');
    return data;
  },

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    if (data.access_token) {
      setToken(data.access_token);
      setUserEmail(email);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Session invalid');
    if (data.email) {
      setUserEmail(data.email);
    }
    return data;
  },

  logout() {
    removeToken();
    localStorage.removeItem('bovicare_user_email');
  },

  // Disease Prediction (Image upload)
  async predictCow(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/predict/cow`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Disease prediction failed');
    return data;
  },

  // Tabular Disease Prediction
  async predictTabular(payload) {
    const res = await fetch(`${API_BASE_URL}/predict/tabular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Tabular prediction failed');
    return data;
  },

  // Health Guidance (LangGraph RAG Agent)
  async getHealthGuidance(predictionId, question = null) {
    const body = { prediction_id: predictionId };
    if (question && question.trim()) {
      body.question = question.trim();
    }

    const res = await fetch(`${API_BASE_URL}/health/guidance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to retrieve health guidance');
    return data;
  },

  // Health Report
  async generateReport(predictionId) {
    const res = await fetch(`${API_BASE_URL}/health-report/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ prediction_id: predictionId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to generate report');
    return data;
  },

  async downloadReportPdf(reportId) {
    const res = await fetch(`${API_BASE_URL}/health-report/${reportId}/pdf`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to download report PDF');
    }
    return res.blob();
  },

  async getReportHistory() {
    const res = await fetch(`${API_BASE_URL}/health-report/history`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch report history');
    return data;
  },

  // Prediction History
  async getHistory() {
    const res = await fetch(`${API_BASE_URL}/predictions/history`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch history');
    return data;
  },

  async getPredictionDetail(predictionId) {
    const res = await fetch(`${API_BASE_URL}/predictions/${predictionId}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch prediction detail');
    return data;
  }
};
