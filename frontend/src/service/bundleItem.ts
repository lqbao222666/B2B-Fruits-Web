import api from './api.ts'

export const BundleItem = {
  async getAll() {
    const res = await api.get('/bundle-item')
    return res.data
  },
}

export default BundleItem
