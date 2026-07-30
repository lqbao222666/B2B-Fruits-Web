<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "../../service/api.ts";
import { notify } from "@/utils/notifier.ts";

const reports = ref<any[]>([]);
const loading = ref(false);
const selectedReport = ref<any>(null);
const updateNote = ref("");
const updateStatus = ref("");
const updating = ref(false);
const cancelingOrder = ref(false);

const activeTab = ref("cho_xu_ly");
const tabs = [
  { id: "cho_xu_ly", label: "Chờ xử lý" },
  { id: "dang_xu_ly", label: "Đang xử lý" },
  { id: "da_xu_ly", label: "Đã xử lý" },
  { id: "tu_choi", label: "Từ chối" },
];

const filteredReports = computed(() => {
  return reports.value.filter((r) => r.trang_thai === activeTab.value);
});

const fetchReports = async () => {
  loading.value = true;
  try {
    const res = await api.get("/bao-cao");
    reports.value = res.data;
  } catch (error) {
    notify.error("Lỗi khi tải danh sách báo cáo");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReports();
});

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("vi-VN");
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "cho_xu_ly":
      return "bg-amber-100 text-amber-700";
    case "dang_xu_ly":
      return "bg-blue-100 text-blue-700";
    case "da_xu_ly":
      return "bg-emerald-100 text-emerald-700";
    case "tu_choi":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const viewDetail = (report: any) => {
  selectedReport.value = { ...report };
  updateStatus.value = report.trang_thai;
  updateNote.value = report.ghi_chu_xu_ly || "";
};

const handleUpdate = async () => {
  if (!selectedReport.value) return;
  updating.value = true;
  try {
    const payload = {
      trang_thai: updateStatus.value,
      ghi_chu_xu_ly: updateNote.value,
    };
    await api.patch(`/bao-cao/${selectedReport.value.baocao_id}`, payload);
    notify.success("Cập nhật báo cáo thành công!");
    selectedReport.value = null;
    fetchReports();
  } catch (error) {
    notify.error("Lỗi khi cập nhật báo cáo");
  } finally {
    updating.value = false;
  }
};

// Extract Order ID if present in description "[Đơn hàng #123]"
const getOrderId = (desc: string) => {
  if (!desc) return null;
  const match = desc.match(/\[Đơn hàng #(\d+)\]/);
  return match ? Number(match[1]) : null;
};

const handleCancelOrder = async (orderId: number) => {
  if (
    !confirm(
      `Bạn có chắc chắn muốn HỦY đơn hàng #${orderId} và tự động cập nhật báo cáo này thành "Đã xử lý"?`,
    )
  )
    return;
  cancelingOrder.value = true;
  try {
    // 1. Cancel the order
    await api.patch(`/don-hang/${orderId}`, { trang_thai_don: "da_huy" });
    // 2. Update the report
    await api.patch(`/bao-cao/${selectedReport.value.baocao_id}`, {
      trang_thai: "da_xu_ly",
      ghi_chu_xu_ly: `Đã hủy đơn hàng #${orderId} theo yêu cầu sự cố.`,
    });
    notify.success(`Đã hủy đơn hàng #${orderId} và đánh dấu đã giải quyết!`);
    selectedReport.value = null;
    fetchReports();
  } catch (error) {
    notify.error("Lỗi khi hủy đơn hàng. Có thể đơn đã bị hủy.");
  } finally {
    cancelingOrder.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black text-slate-800">
          Quản lý Báo cáo Sự cố
        </h2>
        <p class="text-slate-500 text-sm mt-1">
          Theo dõi và xử lý các sự cố đơn hàng từ hệ thống.
        </p>
      </div>
      <button
        @click="fetchReports"
        class="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <span
          class="material-symbols-outlined text-[20px]"
          :class="{ 'animate-spin': loading }"
          >refresh</span
        >
        Làm mới
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-slate-200 gap-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="pb-3 font-bold text-sm relative"
        :class="
          activeTab === tab.id
            ? 'text-[#2E7D32]'
            : 'text-slate-500 hover:text-slate-700'
        "
      >
        {{ tab.label }}
        <div
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E7D32] rounded-t-full"
        ></div>
      </button>
    </div>

    <!-- List -->
    <div
      v-if="loading && reports.length === 0"
      class="flex justify-center py-12"
    >
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]"
      ></div>
    </div>

    <div
      v-else-if="filteredReports.length === 0"
      class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm"
    >
      <span
        class="material-symbols-outlined text-[48px] text-slate-300 mb-4 block"
        >fact_check</span
      >
      Không có báo cáo nào ở trạng thái này.
    </div>

    <div
      v-else
      class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
    >
      <table class="w-full text-left text-sm">
        <thead
          class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider"
        >
          <tr>
            <th class="px-6 py-4">Thời gian</th>
            <th class="px-6 py-4">Người gửi</th>
            <th class="px-6 py-4">Phân loại</th>
            <th class="px-6 py-4">Nội dung tóm tắt</th>
            <th class="px-6 py-4">Trạng thái</th>
            <th class="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="rp in filteredReports"
            :key="rp.baocao_id"
            class="hover:bg-slate-50 transition-colors"
          >
            <td class="px-6 py-4 text-slate-500">
              {{ formatDate(rp.created_at) }}
            </td>
            <td class="px-6 py-4">
              <div class="font-bold text-slate-800">
                {{ rp.nguoiBaoCao?.full_name || "Người dùng" }}
              </div>
              <div class="text-xs text-slate-400">
                {{ rp.nguoiBaoCao?.email }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] uppercase"
              >
                {{ rp.loai === "khac" ? "Sự cố đơn hàng" : rp.loai }}
              </span>
            </td>
            <td class="px-6 py-4 text-slate-600">
              <p class="line-clamp-1 max-w-[250px]">{{ rp.mo_ta }}</p>
            </td>
            <td class="px-6 py-4">
              <span
                class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest"
                :class="getStatusBadge(rp.trang_thai)"
              >
                {{ tabs.find((t) => t.id === rp.trang_thai)?.label }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                @click="viewDetail(rp)"
                class="text-[#2E7D32] font-bold hover:underline text-sm"
              >
                Chi tiết
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="selectedReport"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
        >
          <h3 class="font-black text-xl text-slate-800">
            Chi tiết Báo cáo #{{ selectedReport.baocao_id }}
          </h3>
          <button
            @click="selectedReport = null"
            class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[11px] font-bold text-slate-400 uppercase mb-1">
                Người gửi báo cáo
              </p>
              <p class="font-bold text-slate-800">
                {{ selectedReport.nguoiBaoCao?.full_name || "N/A" }}
              </p>
              <p class="text-sm text-slate-500">
                {{ selectedReport.nguoiBaoCao?.email }}
              </p>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[11px] font-bold text-slate-400 uppercase mb-1">
                Người bị báo cáo (nếu có)
              </p>
              <p class="font-bold text-slate-800">
                {{ selectedReport.nguoiBiBaoCao?.full_name || "Không có" }}
              </p>
              <p class="text-sm text-slate-500">
                {{ selectedReport.nguoiBiBaoCao?.email }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-sm font-bold text-slate-700 mb-2">
              Nội dung báo cáo:
            </p>
            <div
              class="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-slate-700 whitespace-pre-wrap"
            >
              {{ selectedReport.mo_ta }}
            </div>
          </div>

          <div
            v-if="
              selectedReport.bang_chung && selectedReport.bang_chung.length > 0
            "
          >
            <p class="text-sm font-bold text-slate-700 mb-2">
              Bằng chứng đính kèm:
            </p>
            <div class="grid grid-cols-3 gap-3">
              <a
                v-for="(url, idx) in selectedReport.bang_chung"
                :key="idx"
                :href="url"
                target="_blank"
                class="aspect-square rounded-xl overflow-hidden border border-slate-200 block hover:border-[#2E7D32] transition-colors"
              >
                <img
                  v-if="
                    url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
                    !url.includes('.')
                  "
                  :src="url"
                  class="w-full h-full object-cover"
                />
                <video
                  v-else
                  :src="url"
                  class="w-full h-full object-cover"
                  controls
                ></video>
              </a>
            </div>
            <p class="text-[11px] text-slate-500 mt-2">
              Bấm vào hình để xem kích thước đầy đủ
            </p>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <h4 class="font-black text-slate-800 mb-4">Xử lý báo cáo</h4>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5"
                  >Cập nhật trạng thái</label
                >
                <select
                  v-model="updateStatus"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] outline-none"
                >
                  <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
                    {{ tab.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5"
                  >Ghi chú xử lý (Nội bộ)</label
                >
                <textarea
                  v-model="updateNote"
                  rows="3"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#2E7D32] outline-none placeholder:text-slate-400"
                  placeholder="Nhập ghi chú xử lý..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between"
        >
          <div>
            <button
              v-if="
                getOrderId(selectedReport.mo_ta) &&
                selectedReport.trang_thai !== 'da_xu_ly'
              "
              @click="handleCancelOrder(getOrderId(selectedReport.mo_ta)!)"
              :disabled="cancelingOrder"
              class="px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">cancel</span>
              {{
                cancelingOrder
                  ? "Đang hủy..."
                  : `Hủy Đơn Hàng #${getOrderId(selectedReport.mo_ta)}`
              }}
            </button>
          </div>
          <div class="flex gap-3">
            <button
              @click="selectedReport = null"
              class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>
            <button
              @click="handleUpdate"
              :disabled="updating"
              class="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#2E7D32] text-white hover:bg-[#1B5E20] transition-colors shadow-lg shadow-green-900/20"
            >
              {{ updating ? "Đang lưu..." : "Lưu kết quả" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
