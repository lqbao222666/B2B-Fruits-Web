import api from "./api.ts";

export const ProductVariantService = {
  async getAll() {
    const response = await api.get("/product-variant");
    return response.data;
  },

  async createVariant(data: any) {
    const response = await api.post("/product-variant", data);
    return response.data;
  },

  async deleteListVariants(data: { Ids: number[] }) {
    const response = await api.delete("/product-variant", { data });
    return response.data;
  },

  async applyPromotion(data: {
    variantIds: number[];
    promotionId: number | null;
  }) {
    const res = await api.patch("/product-variant/apply-promotion", data);
    return res.data;
  },
  async updateVariant(id: number, data: any) {
    const res = await api.put(`/product-variant/${id}`, data);
    return res.data;
  },
};

export default ProductVariantService;
