<script setup lang="ts">
import { ref, onMounted } from "vue";
import { NhuCauService, type NhuCauThuMua } from "@/service/nhucau";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";

const loading = ref(false);
const nhuCauList = ref<NhuCauThuMua[]>([]);
const searchKeyword = ref("");
const selectedStatus = ref("all");

const fetchAllDemands = async () => {
  loading.value = true;
  try {
    const data = await NhuCauService.getAll({
      ten_nong_san: searchKeyword.value || undefined,
      trang_thai:
        selectedStatus.value !== "all" ? selectedStatus.value : undefined,
    });
    nhuCauList.value = data || [];
  } catch (e: any) {
    notify.error("Lỗi khi tải danh sách nhu cầu thu mua");
  } finally {
    loading.value = false;
  }
};

const markNotified = async (id: number) => {
  try {
    await NhuCauService.update(id, { da_thong_bao: true });
    notify.success("Đã đánh dấu thông báo hàng mới");
    fetchAllDemands();
  } catch (e) {
    notify.error("Lỗi thao tác");
  }
};

const deleteDemand = async (id: number) => {
  const res = await Swal.fire({
    title: "Xóa nhu cầu thu mua này?",
    text: "Admin xóa cứng nhu cầu này khỏi hệ thống.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Đồng ý xóa",
  });

  if (res.isConfirmed) {
    try {
      await NhuCauService.delete(id);
      notify.success("Đã xóa bài");
      fetchAllDemands();
    } catch (e) {
      notify.error("Không thể xóa");
    }
  }
};

const formatPrice = (val?: number) => {
  if (!val) return "Thương lượng";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

onMounted(() => {
  fetchAllDemands();
});
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div>
        <h2 class="text-xl font-bold text-slate-900">
          Quản Lý Nhu Cầu Thu Mua B2B
        </h2>
        <p class="text-xs text-slate-500">
          Admin theo dõi và kiểm duyệt các yêu cầu thu mua nông sản trên hệ
          thống
        </p>
      </div>

      <div class="flex items-center gap-3">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Tìm nông sản..."
          class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          @keyup.enter="fetchAllDemands"
        />
        <select
          v-model="selectedStatus"
          @change="fetchAllDemands"
          class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="dang_thu_mua">Đang thu mua</option>
          <option value="du_so_luong">Đã đủ số lượng</option>
          <option value="tam_ngung">Tạm ngưng</option>
          <option value="da_dong">Đã đóng</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div
      class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
    >
      <div v-if="loading" class="p-12 text-center text-slate-500 text-xs">
        Đang tải dữ liệu...
      </div>
      <table v-else class="w-full text-left text-xs border-collapse">
        <thead
          class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]"
        >
          <tr>
            <th class="p-4">ID</th>
            <th class="p-4">Nông Sản</th>
            <th class="p-4">Doanh Nghiệp</th>
            <th class="p-4">Số Lượng Cần</th>
            <th class="p-4">Giá Tham Khảo</th>
            <th class="p-4">Khu Vực</th>
            <th class="p-4">Trạng Thái</th>
            <th class="p-4 text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="item in nhuCauList"
            :key="item.nhucau_id"
            class="hover:bg-slate-50/80 transition"
          >
            <td class="p-4 font-bold text-slate-700">#{{ item.nhucau_id }}</td>
            <td class="p-4 font-bold text-slate-900">
              {{ item.ten_nong_san }}
            </td>
            <td class="p-4 text-slate-700">
              {{
                item.doanhNghiep?.ten_cong_ty ||
                item.doanhNghiep?.user?.full_name
              }}
            </td>
            <td class="p-4 font-semibold">
              {{ item.so_luong_can }} {{ item.don_vi }}
            </td>
            <td class="p-4 font-bold text-emerald-700">
              {{ formatPrice(item.gia_tham_khao) }}
            </td>
            <td class="p-4 text-slate-600">{{ item.tinh_thanh_giao }}</td>
            <td class="p-4">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"
              >
                {{ item.trang_thai }}
              </span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button
                @click="markNotified(item.nhucau_id)"
                class="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg hover:bg-amber-100"
              >
                {{ item.da_thong_bao ? "Đã thông báo" : "Báo hàng mới" }}
              </button>
              <button
                @click="deleteDemand(item.nhucau_id)"
                class="px-2.5 py-1 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
