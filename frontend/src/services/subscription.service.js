import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

class SubscriptionService {
  async getPlans() {
    return apiService.get(API_ENDPOINTS.SUBSCRIPTION_PLANS);
  }

  async subscribe(planId, paymentData) {
    return apiService.post(API_ENDPOINTS.SUBSCRIPTION_SUBSCRIBE, {
      plan_id: planId,
      payment_data: paymentData,
    });
  }

  async getCurrentSubscription() {
    return apiService.get(API_ENDPOINTS.SUBSCRIPTION_CURRENT);
  }

  async cancel() {
    return apiService.post(API_ENDPOINTS.SUBSCRIPTION_CANCEL);
  }
}

export default new SubscriptionService();
