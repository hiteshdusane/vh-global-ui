import axios from "axios";
import {
  ApiResponse,
  ProductMainCategoryResponse,
  ProductSubCategoryResponse,
  ProductResponse,
  ProductMainCategoryRequest,
  ProductSubCategoryRequest,
  ProductRequest,
  PaginatedDataRequest,
  PaginatedResponse,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Product Main Category API
export const productMainCategoryApi = {
  getAll: (): Promise<ApiResponse<ProductMainCategoryResponse[]>> =>
    api.get("/api/v1/products/main-category").then((res) => res.data),

  getById: (id: string): Promise<ApiResponse<ProductMainCategoryResponse>> =>
    api.get(`/api/v1/products/main-category/${id}`).then((res) => res.data),

  create: (
    data: ProductMainCategoryRequest
  ): Promise<ApiResponse<ProductMainCategoryResponse>> =>
    api.post("/api/v1/products/main-category", data).then((res) => res.data),

  update: (
    id: string,
    data: ProductMainCategoryRequest
  ): Promise<ApiResponse<ProductMainCategoryResponse>> =>
    api
      .put(`/api/v1/products/main-category/${id}`, data)
      .then((res) => res.data),

  delete: (id: string): Promise<ApiResponse<string>> =>
    api.delete(`/api/v1/products/main-category/${id}`).then((res) => res.data),
};

// Product Sub Category API
export const productSubCategoryApi = {
  getAll: (
    data: PaginatedDataRequest
  ): Promise<ApiResponse<PaginatedResponse<ProductSubCategoryResponse>>> =>
    api.post("/api/v1/products/sub-category-all", data).then((res) => res.data),

  getByMainCategory: (
    mainProductCategoryId: string,
    data: PaginatedDataRequest
  ): Promise<ApiResponse<PaginatedResponse<ProductSubCategoryResponse>>> =>
    api
      .post(
        `/api/v1/products/sub-category-by-main-category?mainProductCategoryId=${mainProductCategoryId}`,
        data
      )
      .then((res) => res.data),

  getById: (id: string): Promise<ApiResponse<ProductSubCategoryResponse>> =>
    api.get(`/api/v1/products/sub-category/${id}`).then((res) => res.data),

  create: (
    data: ProductSubCategoryRequest
  ): Promise<ApiResponse<ProductSubCategoryResponse>> =>
    api.post("/api/v1/products/sub-category", data).then((res) => res.data),

  delete: (id: string): Promise<ApiResponse<string>> =>
    api.delete(`/api/v1/products/sub-category/${id}`).then((res) => res.data),
};

// Product API
export const productApi = {
  getAll: (
    data: PaginatedDataRequest
  ): Promise<ApiResponse<PaginatedResponse<ProductResponse>>> =>
    api.post("/api/v1/products/all", data).then((res) => res.data),

  getBySubCategory: (
    subProductCategoryId: string,
    data: PaginatedDataRequest
  ): Promise<ApiResponse<PaginatedResponse<ProductResponse>>> =>
    api
      .post(
        `/api/v1/products/by-sub-category?subProductCategoryId=${subProductCategoryId}`,
        data
      )
      .then((res) => res.data),

  getById: (id: string): Promise<ApiResponse<ProductResponse>> =>
    api.get(`/api/v1/products/${id}`).then((res) => res.data),

  create: (data: ProductRequest): Promise<ApiResponse<ProductResponse>> =>
    api.post("/api/v1/products", data).then((res) => res.data),

  delete: (id: string): Promise<ApiResponse<string>> =>
    api.delete(`/api/v1/products/${id}`).then((res) => res.data),

  uploadImage: (
    productId: string,
    file: File
  ): Promise<ApiResponse<ProductResponse>> => {
    const formData = new FormData();
    // console.log("🚀 ~ formData:", formData)
    formData.append("file", file);
    return api
      .post(`/api/v1/products/upload-image/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  uploadAdditionalImage: (
    productId: string,
    file: File
  ): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post(`/api/v1/products/upload?productId=${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  uploadMultipleImages: (
    productId: string,
    files: File[]
  ): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    return api
      .post(
        `/api/v1/products/upload-multiple?productId=${productId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then((res) => res.data);
  },

  getImage: (imageName: string): string =>
    `${API_BASE_URL}/api/v1/products/get-image/${imageName}`,
};

// Product Additional Info API
export const productAdditionalInfoApi = {
  delete: (id: string): Promise<ApiResponse<string>> =>
    api
      .delete(`/api/v1/products/product-additional-info/${id}`)
      .then((res) => res.data),
};

export default api;
