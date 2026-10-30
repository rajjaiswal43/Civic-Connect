import { CivicIncident, OfficerProfile, HotspotCluster, WorkerInfo } from '../types';

const API_BASE = '/api';

export const apiClient = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/`, { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async officerLogin(name: string, mobile: string, password: string, rememberMe = false) {
    const res = await fetch(`${API_BASE}/admin/officer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, password, rememberMe })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Authentication failed. Please verify credentials.');
    }
    return data;
  },

  async officerChangePassword(officerId: string, currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/admin/officer/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerId, currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Password change failed.');
    }
    return data;
  },

  async officerRegister(payload: any) {
    const res = await fetch(`${API_BASE}/admin/officer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Officer registration failed.');
    }
    return data;
  },

  async getOfficerProfile(): Promise<OfficerProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/officer`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getOfficerProfile error, using fallback:', e);
    }
    return null;
  },

  async updateOfficerProfile(profile: OfficerProfile): Promise<OfficerProfile> {
    try {
      const res = await fetch(`${API_BASE}/admin/officer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API updateOfficerProfile error:', e);
    }
    return profile;
  },

  async getIncidents(): Promise<CivicIncident[] | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getIncidents error, using fallback:', e);
    }
    return null;
  },

  async createIncident(payload: any): Promise<CivicIncident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API createIncident error:', e);
    }
    return null;
  },

  async approveIncident(incidentId: string, officerNotes?: string, overrideCategory?: string, overrideDepartment?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${incidentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerNotes, overrideCategory, overrideDepartment })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API approveIncident error:', e);
    }
    return null;
  },

  async rejectIncident(incidentId: string, rejectionReason: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${incidentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API rejectIncident error:', e);
    }
    return null;
  },

  async requestMoreInfo(incidentId: string, requestNotes: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${incidentId}/request-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestNotes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API requestMoreInfo error:', e);
    }
    return null;
  },

  async assignIncident(incidentId: string, workerId: string, deadline: string, notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${incidentId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, deadline, notes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API assignIncident error:', e);
    }
    return null;
  },

  async extendDeadline(incidentId: string, newDeadline: string, reason: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${incidentId}/extend-deadline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDeadline, reason })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API extendDeadline error:', e);
    }
    return null;
  },

  async updateWorkerStatus(incidentId: string, status: string, notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/worker/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API updateWorkerStatus error:', e);
    }
    return null;
  },

  async submitWorkerCompletion(incidentId: string, afterPhotoUrl: string, workerNotes?: string, materialsLogged?: string) {
    try {
      const res = await fetch(`${API_BASE}/worker/incidents/${incidentId}/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ afterPhotoUrl, workerNotes, materialsLogged })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API submitWorkerCompletion error:', e);
    }
    return null;
  },

  async verifyCompletedWork(incidentId: string, action: 'approve' | 'reject' | 'request_rework' = 'approve', notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${incidentId}/verify-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API verifyCompletedWork error:', e);
    }
    return null;
  },

  async citizenClosureFeedback(incidentId: string, isSatisfied: boolean, rating = 5, feedbackNotes?: string) {
    try {
      const res = await fetch(`${API_BASE}/incidents/${incidentId}/closure-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSatisfied, rating, feedbackNotes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API citizenClosureFeedback error:', e);
    }
    return null;
  },

  async validateIncident(incidentId: string, action: string, impactRating: number, comment?: string) {
    try {
      const res = await fetch(`${API_BASE}/incidents/${incidentId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, impactRating, comment })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API validateIncident error:', e);
    }
    return null;
  },

  async reopenIncident(incidentId: string, reason: string, actorRole: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${incidentId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, actorRole })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API reopenIncident error:', e);
    }
    return null;
  },

  async resetBackendDatabase() {
    try {
      const res = await fetch(`${API_BASE}/admin/reset`, { method: 'POST' });
      return res.ok;
    } catch (e) {
      console.warn('API resetBackendDatabase error:', e);
      return false;
    }
  }
};
