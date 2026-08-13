import api from "./api.ts";

export const Media = {
  // 1. Upload media cho bình luận
  async uploadReviewMedia(commentId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`comments/${commentId}/media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Bắt buộc để gửi file
      },
    });
    return response.data;
  },

  // 2. Xóa media khỏi bình luận
  async deleteReviewMedia(mediaId: number) {
    const response = await api.delete(`media/${mediaId}`);
    return response.data;
  },
};

export default Media;
