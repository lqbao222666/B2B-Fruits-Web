import api from './api.ts'

export interface CommentFilter {
  productId?: number
  accountId?: number
  visibility?: 'ALL' | 'VISIBLE' | 'HIDDEN'
}

export const Comment = {
  /**
   * Lấy danh sách bình luận
   * @param filterParams Các tham số lọc (productId, visibility...)
   * @param isAdmin Nếu là true, sẽ gọi vào route quản trị để thấy bình luận ẩn
   */
  async getComments(filterParams?: CommentFilter, isAdmin: boolean = false) {
    // Nếu là Admin, gọi vào route 'comments/admin/all'
    // Nếu là User, gọi vào route 'comments' (Backend sẽ tự fix isHidden = false)
    const url = isAdmin ? 'comments/admin/all' : 'comments'

    const response = await api.get(url, { params: filterParams })
    return response.data
  },

  async createComment(productId: number, commentData: any) {
    const response = await api.post(`comments/product/${productId}`, commentData)
    return response.data
  },

  // Admin: Ẩn bình luận
  async hideComment(commentId: number) {
    // Truyền true để Backend lưu isHidden = true
    return api.patch(`comments/${commentId}/visibility`, { isHidden: true })
  },

  // Admin: Mở lại bình luận
  async showComment(commentId: number) {
    // Truyền false để Backend lưu isHidden = false
    return api.patch(`comments/${commentId}/visibility`, { isHidden: false })
  },
}

export default Comment
