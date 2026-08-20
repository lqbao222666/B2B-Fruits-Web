import { useToast } from "vue-toastification";

const toast = useToast();

const formatMsg = (msg: any): string => {
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "object" && msg !== null) return JSON.stringify(msg);
  return String(msg || "");
};

export const notify = {
  success: (msg: any) => toast.success(formatMsg(msg)),
  error: (msg: any) => toast.error(formatMsg(msg)),
  info: (msg: any) => toast.info(formatMsg(msg)),
  warning: (msg: any) => toast.warning(formatMsg(msg)),
};

export default toast;
