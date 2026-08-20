<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import api from "@/service/api";
import { notify } from "@/utils/notifier";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const props = defineProps<{
  userId?: number | null;
}>();

const emit = defineEmits(["updated"]);

const savedLocations = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

// Form state for adding/editing
const isFormOpen = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  ten_goi: "",
  dia_chi: "",
  latitude: 10.762622,
  longitude: 106.660172,
});

// Map modal state
const showMapModal = ref(false);
let modalMap: L.Map | null = null;
let modalMarker: L.Marker | null = null;
const mapSearchQuery = ref("");
const isMapSearching = ref(false);

// View map modal state (read-only preview)
const showViewMapModal = ref(false);
const viewLocation = ref<any>(null);
let viewMap: L.Map | null = null;

const getUserId = () => {
  if (props.userId) return props.userId;
  const userStorage = localStorage.getItem("user");
  if (userStorage) {
    const u = JSON.parse(userStorage);
    return u.user_id || u.id;
  }
  return null;
};

const fetchSavedLocations = async () => {
  const uid = getUserId();
  if (!uid) return;
  loading.value = true;
  try {
    const res = await api.get(`/dia-chi-luu/user/${uid}`);
    savedLocations.value = res.data || [];
  } catch (err) {
    console.error("Lỗi lấy danh sách vị trí đã lưu:", err);
  } finally {
    loading.value = false;
  }
};

const openAddForm = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    ten_goi: "",
    dia_chi: "",
    latitude: 10.762622,
    longitude: 106.660172,
  };
  isFormOpen.value = true;
};

const openEditForm = (loc: any) => {
  isEditing.value = true;
  editingId.value = loc.id;
  form.value = {
    ten_goi: loc.ten_goi || "",
    dia_chi: loc.dia_chi || "",
    latitude: Number(loc.latitude) || 10.762622,
    longitude: Number(loc.longitude) || 106.660172,
  };
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  editingId.value = null;
};

const handleSubmit = async () => {
  const uid = getUserId();
  if (!uid) {
    notify.error("Không tìm thấy thông tin tài khoản!");
    return;
  }
  if (!form.value.ten_goi.trim()) {
    notify.error("Vui lòng nhập tên kho / vị trí!");
    return;
  }

  submitting.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await api.patch(`/dia-chi-luu/${editingId.value}`, {
        ten_goi: form.value.ten_goi,
        dia_chi: form.value.dia_chi,
        latitude: form.value.latitude,
        longitude: form.value.longitude,
      });
      notify.success("Cập nhật kho / vị trí thành công!");
    } else {
      await api.post("/dia-chi-luu", {
        user_id: uid,
        ten_goi: form.value.ten_goi,
        dia_chi: form.value.dia_chi,
        latitude: form.value.latitude,
        longitude: form.value.longitude,
      });
      notify.success("Đã thêm kho / vị trí mới!");
    }
    closeForm();
    await fetchSavedLocations();
    emit("updated");
  } catch (err: any) {
    console.error("Lỗi khi lưu vị trí:", err);
    notify.error(err.response?.data?.message || "Lưu kho / vị trí thất bại!");
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (loc: any) => {
  const confirm = await Swal.fire({
    title: "Xác nhận xóa?",
    text: `Bạn có chắc muốn xóa "${loc.ten_goi}" khỏi danh sách kho?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  });

  if (!confirm.isConfirmed) return;

  try {
    await api.delete(`/dia-chi-luu/${loc.id}`);
    notify.success("Đã xóa kho / vị trí thành công!");
    await fetchSavedLocations();
    emit("updated");
  } catch (err: any) {
    console.error("Lỗi xóa kho:", err);
    notify.error("Không thể xóa kho / vị trí này!");
  }
};

// Map Modal Picker Logic
const openMapPicker = () => {
  showMapModal.value = true;
  nextTick(() => {
    initModalMap(form.value.latitude, form.value.longitude);
  });
};

const closeMapPicker = () => {
  showMapModal.value = false;
  if (modalMap) {
    modalMap.remove();
    modalMap = null;
    modalMarker = null;
  }
};

const initModalMap = (lat: number, lng: number) => {
  const container = document.getElementById("location-modal-map");
  if (!container) return;

  if (modalMap) {
    modalMap.remove();
    modalMap = null;
  }

  modalMap = L.map("location-modal-map").setView([lat, lng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(modalMap);

  modalMarker = L.marker([lat, lng], { draggable: true }).addTo(modalMap);

  const updateLatLng = (newLat: number, newLng: number) => {
    form.value.latitude = Number(newLat.toFixed(6));
    form.value.longitude = Number(newLng.toFixed(6));
  };

  modalMarker.on("dragend", (e: any) => {
    const position = e.target.getLatLng();
    updateLatLng(position.lat, position.lng);
  });

  modalMap.on("click", (e: L.LeafletMouseEvent) => {
    if (modalMarker) {
      modalMarker.setLatLng(e.latlng);
    } else {
      modalMarker = L.marker(e.latlng, { draggable: true }).addTo(modalMap!);
    }
    updateLatLng(e.latlng.lat, e.latlng.lng);
  });
};

const handleCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        form.value.latitude = Number(lat.toFixed(6));
        form.value.longitude = Number(lng.toFixed(6));
        if (modalMap && modalMarker) {
          modalMap.setView([lat, lng], 15);
          modalMarker.setLatLng([lat, lng]);
        }
        notify.success("Đã lấy vị trí hiện tại!");
      },
      (err) => {
        notify.error("Không thể lấy vị trí hiện tại: " + err.message);
      }
    );
  } else {
    notify.error("Trình duyệt không hỗ trợ Geolocation!");
  }
};

const searchMapAddress = async () => {
  if (!mapSearchQuery.value.trim()) return;
  isMapSearching.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        mapSearchQuery.value
      )}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      form.value.latitude = Number(lat.toFixed(6));
      form.value.longitude = Number(lng.toFixed(6));
      if (!form.value.dia_chi) {
        form.value.dia_chi = data[0].display_name || "";
      }
      if (modalMap && modalMarker) {
        modalMap.setView([lat, lng], 15);
        modalMarker.setLatLng([lat, lng]);
      }
      notify.success("Đã tìm thấy địa điểm!");
    } else {
      notify.error("Không tìm thấy địa điểm phù hợp!");
    }
  } catch (err) {
    notify.error("Lỗi khi tìm kiếm địa điểm!");
  } finally {
    isMapSearching.value = false;
  }
};

// View Map Modal Logic
const openViewMap = (loc: any) => {
  viewLocation.value = loc;
  showViewMapModal.value = true;
  nextTick(() => {
    initViewMap(Number(loc.latitude), Number(loc.longitude), loc.ten_goi);
  });
};

const closeViewMap = () => {
  showViewMapModal.value = false;
  viewLocation.value = null;
  if (viewMap) {
    viewMap.remove();
    viewMap = null;
  }
};

const initViewMap = (lat: number, lng: number, title: string) => {
  const container = document.getElementById("view-location-modal-map");
  if (!container) return;

  if (viewMap) {
    viewMap.remove();
  }

  viewMap = L.map("view-location-modal-map").setView([lat, lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(viewMap);

  L.marker([lat, lng])
    .addTo(viewMap)
    .bindPopup(`<b>${title}</b><br/>Tọa độ: ${lat}, ${lng}`)
    .openPopup();
};

onMounted(fetchSavedLocations);
</script>

<template>
  <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mt-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
      <div>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#658a22] text-2xl">warehouse</span>
          <h3 class="font-extrabold text-xl text-slate-900 tracking-tight">
            Quản lý Kho & Vị trí đã lưu
          </h3>
        </div>
        <p class="text-slate-500 text-sm mt-1 font-medium">
          Lưu trữ các tọa độ kho hàng, vườn, hoặc điểm giao nhận để nhanh chóng sử dụng khi tạo bài đăng, nhu cầu hoặc giao dịch.
        </p>
      </div>

      <button
        @click="openAddForm"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#658a22] hover:bg-[#58791d] text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm"
      >
        <span class="material-symbols-outlined text-lg">add_location_alt</span>
        Thêm kho mới
      </button>
    </div>

    <!-- Form Thêm / Chỉnh sửa Kho -->
    <div
      v-if="isFormOpen"
      class="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-fadeIn"
    >
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-slate-800 text-base flex items-center gap-2">
          <span class="material-symbols-outlined text-[#658a22] text-xl">
            {{ isEditing ? 'edit_location' : 'add_location' }}
          </span>
          {{ isEditing ? 'Chỉnh sửa kho / vị trí' : 'Thêm kho / vị trí đã lưu mới' }}
        </h4>
        <button
          @click="closeForm"
          class="text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Tên kho / Vị trí (*)
            </label>
            <input
              v-model="form.ten_goi"
              required
              type="text"
              placeholder="Ví dụ: Kho nông sản Hóc Môn, Vườn sầu riêng Đắk Lắk..."
              class="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-2 focus:ring-[#658a22]/10 outline-none transition-all font-medium text-slate-800"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Địa chỉ chi tiết
            </label>
            <input
              v-model="form.dia_chi"
              type="text"
              placeholder="Số nhà, tên đường, xã/phường, quận/huyện, tỉnh thành..."
              class="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#658a22] focus:ring-2 focus:ring-[#658a22]/10 outline-none transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Vĩ độ (Latitude) (*)
            </label>
            <input
              v-model.number="form.latitude"
              required
              type="number"
              step="any"
              placeholder="10.762622"
              class="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none font-mono text-slate-800"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Kinh độ (Longitude) (*)
            </label>
            <input
              v-model.number="form.longitude"
              required
              type="number"
              step="any"
              placeholder="106.660172"
              class="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#658a22] outline-none font-mono text-slate-800"
            />
          </div>

          <div>
            <button
              type="button"
              @click="openMapPicker"
              class="w-full px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#658a22] border border-[#658a22]/30 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">map</span>
              Chọn trên bản đồ / Định vị
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="closeForm"
            class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2.5 bg-[#658a22] hover:bg-[#58791d] text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <span v-if="submitting" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            <span>{{ isEditing ? 'Lưu cập nhật' : 'Xác nhận thêm kho' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Danh sách Kho đã lưu -->
    <div v-if="loading" class="py-12 flex justify-center items-center">
      <div class="animate-spin border-3 border-[#658a22] border-t-transparent rounded-full w-8 h-8"></div>
    </div>

    <div v-else-if="savedLocations.length === 0 && !isFormOpen" class="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <span class="material-symbols-outlined text-slate-300 text-5xl mb-2">wrong_location</span>
      <p class="text-slate-600 font-bold text-base">Chưa có kho hoặc vị trí nào được lưu</p>
      <p class="text-slate-400 text-sm mt-1 mb-4">Hãy bấm "Thêm kho mới" để nhập tên và tọa độ vị trí của bạn.</p>
      <button
        @click="openAddForm"
        class="inline-flex items-center gap-2 px-4 py-2 bg-[#658a22] text-white font-bold rounded-xl text-sm hover:bg-[#58791d] transition-colors"
      >
        <span class="material-symbols-outlined text-lg">add</span>
        Thêm kho ngay
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="loc in savedLocations"
        :key="loc.id"
        class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#658a22]/50 hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <h4 class="font-bold text-slate-900 text-base flex items-center gap-2">
              <span class="material-symbols-outlined text-[#658a22] text-xl">location_on</span>
              {{ loc.ten_goi }}
            </h4>
            <span class="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px] font-mono font-semibold">
              #{{ loc.id }}
            </span>
          </div>

          <p v-if="loc.dia_chi" class="text-slate-600 text-xs font-medium mb-3 flex items-start gap-1">
            <span class="material-symbols-outlined text-slate-400 text-sm mt-0.5">place</span>
            <span>{{ loc.dia_chi }}</span>
          </p>
          <p v-else class="text-slate-400 italic text-xs mb-3">Chưa có thông tin địa chỉ mô tả</p>

          <div class="bg-slate-50 p-2.5 rounded-xl text-xs font-mono text-slate-700 flex items-center justify-between border border-slate-100">
            <span>Tọa độ:</span>
            <span class="font-bold text-[#658a22]">{{ Number(loc.latitude).toFixed(6) }}, {{ Number(loc.longitude).toFixed(6) }}</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            @click="openViewMap(loc)"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-sm">visibility</span>
            Xem bản đồ
          </button>
          <button
            @click="openEditForm(loc)"
            class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-sm">edit</span>
            Sửa
          </button>
          <button
            @click="handleDelete(loc)"
            class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-sm">delete</span>
            Xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Picker Bản Đồ Leaflet -->
    <div
      v-if="showMapModal"
      class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto backdrop-blur-sm animate-fadeIn"
      @click.self="closeMapPicker"
    >
      <div class="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[82vh] overflow-y-auto my-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#658a22]">pin_drop</span>
            Chọn tọa độ trên bản đồ
          </h3>
          <button
            @click="closeMapPicker"
            class="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="flex gap-2 mb-3">
          <input
            v-model="mapSearchQuery"
            @keyup.enter.prevent="searchMapAddress"
            type="text"
            placeholder="Tìm tên đường, xã, huyện, tỉnh..."
            class="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#658a22]"
          />
          <button
            type="button"
            @click="searchMapAddress"
            :disabled="isMapSearching"
            class="bg-[#658a22] text-white text-xs px-4 font-bold rounded-xl hover:bg-[#58791d] transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <span v-if="isMapSearching" class="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>
            <span v-else class="material-symbols-outlined text-sm">search</span>
            Tìm kiếm
          </button>
          <button
            type="button"
            @click="handleCurrentLocation"
            title="Định vị hiện tại"
            class="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs px-3 font-bold rounded-xl transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <span class="material-symbols-outlined text-sm">my_location</span>
            Định vị
          </button>
        </div>

        <div id="location-modal-map" class="w-full h-72 sm:h-80 rounded-2xl border border-slate-200 overflow-hidden shadow-inner mb-4 flex-shrink-0"></div>

        <div class="bg-slate-50 p-3 rounded-xl text-xs flex items-center justify-between border border-slate-100 mb-4">
          <span class="text-slate-500 font-medium">Tọa độ đang chọn:</span>
          <span class="font-mono font-bold text-[#658a22] text-sm">
            {{ form.latitude }}, {{ form.longitude }}
          </span>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeMapPicker"
            class="px-5 py-2.5 bg-[#658a22] hover:bg-[#58791d] text-white font-bold rounded-xl text-sm shadow-sm transition-all"
          >
            Xác nhận tọa độ này
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Read-only Xem Bản Đồ Kho -->
    <div
      v-if="showViewMapModal"
      class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto backdrop-blur-sm animate-fadeIn"
      @click.self="closeViewMap"
    >
      <div class="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[82vh] overflow-y-auto my-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-lg text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#658a22]">location_on</span>
              {{ viewLocation?.ten_goi }}
            </h3>
            <p class="text-slate-500 text-xs mt-0.5">{{ viewLocation?.dia_chi || 'Không có mô tả địa chỉ' }}</p>
          </div>
          <button
            @click="closeViewMap"
            class="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div id="view-location-modal-map" class="w-full h-72 sm:h-80 rounded-2xl border border-slate-200 overflow-hidden shadow-inner mb-4 flex-shrink-0"></div>

        <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl text-xs border border-slate-100">
          <span class="text-slate-600 font-mono">
            Vĩ độ: {{ viewLocation?.latitude }} | Kinh độ: {{ viewLocation?.longitude }}
          </span>
          <button
            @click="closeViewMap"
            class="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
