<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const props = defineProps({
  province: { type: String, default: "" },
  district: { type: String, default: "" },
  ward: { type: String, default: "" },
});

const emit = defineEmits(["update:province", "update:district", "update:ward"]);

const provinces = ref<any[]>([]);
const districts = ref<any[]>([]);
const wards = ref<any[]>([]);

const selectedProvinceCode = ref<number | "">("");
const selectedDistrictCode = ref<number | "">("");
const selectedWardCode = ref<number | "">("");

// Fetch provinces
const fetchProvinces = async () => {
  try {
    const res = await axios.get("https://provinces.open-api.vn/api/?depth=3");
    provinces.value = res.data;

    // Nếu có dữ liệu initial
    if (props.province) {
      const p = provinces.value.find((x) => x.name === props.province);
      if (p) {
        selectedProvinceCode.value = p.code;
        districts.value = p.districts;

        if (props.district) {
          const d = p.districts.find((x: any) => x.name === props.district);
          if (d) {
            selectedDistrictCode.value = d.code;
            wards.value = d.wards;

            if (props.ward) {
              const w = d.wards.find((x: any) => x.name === props.ward);
              if (w) selectedWardCode.value = w.code;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
};

onMounted(() => {
  fetchProvinces();
});

watch(selectedProvinceCode, (newCode) => {
  if (!newCode) {
    districts.value = [];
    wards.value = [];
    selectedDistrictCode.value = "";
    selectedWardCode.value = "";
    emit("update:province", "");
    emit("update:district", "");
    emit("update:ward", "");
    return;
  }
  const p = provinces.value.find((x) => x.code === newCode);
  if (p) {
    districts.value = p.districts || [];

    // Only reset if district is not currently valid for this province
    if (!districts.value.find((x) => x.code === selectedDistrictCode.value)) {
      selectedDistrictCode.value = "";
      wards.value = [];
      selectedWardCode.value = "";
      emit("update:district", "");
      emit("update:ward", "");
    }

    emit("update:province", p.name);
  }
});

watch(selectedDistrictCode, (newCode) => {
  if (!newCode) {
    wards.value = [];
    selectedWardCode.value = "";
    emit("update:district", "");
    emit("update:ward", "");
    return;
  }
  const d = districts.value.find((x) => x.code === newCode);
  if (d) {
    wards.value = d.wards || [];

    // Only reset if ward is not currently valid for this district
    if (!wards.value.find((x) => x.code === selectedWardCode.value)) {
      selectedWardCode.value = "";
      emit("update:ward", "");
    }

    emit("update:district", d.name);
  }
});

watch(selectedWardCode, (newCode) => {
  if (!newCode) {
    emit("update:ward", "");
    return;
  }
  const w = wards.value.find((x) => x.code === newCode);
  if (w) {
    emit("update:ward", w.name);
  }
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
    <div>
      <select
        v-model="selectedProvinceCode"
        class="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-colors appearance-none text-slate-700"
      >
        <option value="" disabled>Tỉnh/Thành phố</option>
        <option v-for="p in provinces" :key="p.code" :value="p.code">
          {{ p.name }}
        </option>
      </select>
    </div>
    <div>
      <select
        v-model="selectedDistrictCode"
        :disabled="!selectedProvinceCode"
        class="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-colors disabled:opacity-50 disabled:bg-slate-100 appearance-none text-slate-700"
      >
        <option value="" disabled>Quận/Huyện</option>
        <option v-for="d in districts" :key="d.code" :value="d.code">
          {{ d.name }}
        </option>
      </select>
    </div>
    <div>
      <select
        v-model="selectedWardCode"
        :disabled="!selectedDistrictCode"
        class="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-colors disabled:opacity-50 disabled:bg-slate-100 appearance-none text-slate-700"
      >
        <option value="" disabled>Phường/Xã</option>
        <option v-for="w in wards" :key="w.code" :value="w.code">
          {{ w.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
