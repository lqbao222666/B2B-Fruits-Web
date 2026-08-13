import api from "./api.ts";

export interface Message {
  tinnhan_id: number;
  nguoi_gui_id: number;
  nguoi_nhan_id: number;
  donhang_id?: number | null;
  noi_dung: string;
  attachments?: any;
  da_doc: boolean;
  thoi_gian: string;
  nguoiGui?: { user_id: number; full_name: string; avatar_url: string };
  nguoiNhan?: { user_id: number; full_name: string; avatar_url: string };
}

export interface Conversation {
  partnerId: number;
  partner: { user_id: number; full_name: string; avatar_url: string };
  lastMessage: Message;
  unreadCount: number;
}

const getConversations = async (): Promise<Conversation[]> => {
  const res = await api.get("/tin-nhan/conversations");
  return res.data;
};

const getConversation = async (partnerId: number): Promise<Message[]> => {
  const res = await api.get(`/tin-nhan/conversation/${partnerId}`);
  return res.data;
};

const sendMessage = async (
  partnerId: number,
  noi_dung: string,
  donhang_id?: number,
  attachments?: any[],
) => {
  const payload: any = {
    nguoi_nhan_id: partnerId,
    noi_dung,
  };
  if (donhang_id) payload.donhang_id = donhang_id;
  if (attachments && attachments.length > 0) payload.attachments = attachments;
  const res = await api.post("/tin-nhan", payload);
  return res.data;
};

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/tin-nhan/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

const markAsRead = async (tinnhanId: number) => {
  const res = await api.patch(`/tin-nhan/${tinnhanId}/read`);
  return res.data;
};

const searchUserByPhone = async (phone: string) => {
  const res = await api.get(`/tin-nhan/search-user/${phone}`);
  return res.data;
};

export default {
  getConversations,
  getConversation,
  sendMessage,
  uploadFile,
  markAsRead,
  searchUserByPhone,
};
