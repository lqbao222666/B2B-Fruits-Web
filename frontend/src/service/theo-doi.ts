import api from './api.ts';

export const TheoDoiService = {
  async toggleTheoDoi(sellerId: number) {
    const res = await api.post(`/theo-doi/toggle/${sellerId}`);
    return res.data;
  },
  
  async getStatus(sellerId: number) {
    const res = await api.get(`/theo-doi/status/${sellerId}`);
    return res.data;
  },
  
  async getPurchasedSellers() {
    const res = await api.get('/theo-doi/purchased-sellers');
    return res.data;
  }
};
