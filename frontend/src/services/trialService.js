import apiService from './api.service';

export const trialService = {
  // Publish invitation as trial (10 minutes) - NEW API
  publishTrial: async (invitationId) => {
    return apiService.post(`/api/invitations/${invitationId}/publish-trial`);
  },

  // Confirm trial and make permanent - NEW API
  confirmTrial: async (invitationId) => {
    return apiService.post(`/api/invitations/${invitationId}/confirm-trial`);
  },

  // Get trial status with countdown - NEW API
  getTrialStatus: async (invitationId) => {
    return apiService.get(`/api/invitations/${invitationId}/trial-status`);
  },
};

export default trialService;
