import apiService from "./ApiService";

export const addProduct = (payload) =>
    apiService({
        url: '/api/user/product/sell-product',
        method: 'POST',
        data: payload,
        withAuth: true,
    });

export const updateProduct = (id, payload) =>
    apiService({
        url: `/api/user/product/${id}`,
        method: 'PUT',
        data: payload,
        withAuth: true,
    });

export const deleteProduct = (id) =>
    apiService({
        url: `/api/user/product/${id}`,
        method: 'DELETE',
        // no body for delete
        withAuth: true,
    });

export const getProduct = (query = {}) =>
    apiService({
        url: '/api/user/product/my-products',
        method: 'GET',
        withAuth: true,
        credentials: 'include',
        params: query,
    });

export const getProductDetails = (id) =>
    apiService({
        url: `/api/user/product/${id}`,
        method: 'GET',
        withAuth: true,
        credentials: 'include',
    });

// ProductService.js
export const getAllProduct = (params = {}) =>
    apiService({
        url: '/api/user/product/all',
        method: 'GET',
        credentials: 'include',
        params: {
            ...params, // spreads all filters and pagination info
        },
    });

export const getUserProduct = (id, query = {}) =>
    apiService({
        url: `/api/user/product/${id}/items`,
        method: 'GET',
        credentials: 'include',
        params: query,
    });

export const getUserProductBuyerProduct = (id, query = {}) =>
    apiService({
        url: `/api/user/product/purchased-for-rating/${id}`,
        method: 'GET',
        credentials: 'include',
        params: query,
        withAuth: true,
    });

export const getFevItems = (query = {}) =>
    apiService({
        url: "/api/user/product/favorites",
        method: 'GET',
        withAuth: true,
        credentials: 'include',
        params: query,
    });

export const addFevProduct = (id) =>
    apiService({
        url: `/api/user/product/${id}/favorite`,
        method: 'POST',
        // no extra payload
        withAuth: true,
    });

export const getAllCategory = () =>
    apiService({
        // backend route: app/user/general/routes/generalRoutes.js -> '/api/user/general' returns all categories
        url: '/api/user/general',
        method: 'GET',
        // public endpoint; no auth or credentials needed
    });

export const getSize = (id) =>
    apiService({
        url: `/api/user/general/category/size/${id}`,
        method: 'GET',
        withAuth: true,
        credentials: 'include',
    });

export const getFollowers = (id, query = {}) =>
    apiService({
        url: `/api/user/profile/users/${id}/followers`,
        method: 'GET',
        params: query,
        credentials: 'include',
    });

export const getFollowing = (id, query = {}) =>
    apiService({
        url: `/api/user/profile/users/${id}/following`,
        method: 'GET',
        params: query,
        credentials: 'include',
    });

export const follow = (id) =>
    apiService({
        url: `/api/user/profile/users/${id}/follow`,
        method: 'POST',
        withAuth: true,
        credentials: 'include',
    });

export const unFollow = (id) =>
    apiService({
        url: `/api/user/profile/users/${id}/unfollow`,
        method: 'POST',
        withAuth: true,
        credentials: 'include',
    });

export const hideProduct = (id, payload) =>
    apiService({
        url: `/api/user/product/${id}/hide-toggle`,
        method: 'POST',
        withAuth: true,
        data: payload,
        credentials: 'include',
    });


// Product management actions
export const bumpProduct = (id) =>
    apiService({
        url: `/api/user/product/${id}/bump`,
        method: 'POST',
        withAuth: true,
    });

export const markProductAsSold = (id) =>
    apiService({
        url: `/api/user/product/${id}/mark-sold`,
        method: 'POST',
        withAuth: true,
    });

export const markProductAsReserved = (id) =>
    apiService({
        url: `/api/user/product/${id}/mark-reserved`,
        method: 'POST',
        withAuth: true,
    });

export const reactivateProduct = (id) =>
    apiService({
        url: `/api/user/product/${id}/reactivate`,
        method: 'POST',
        withAuth: true,
    });

export const getSuggestions = (query = {}) =>
    apiService({
        url: '/api/user/suggestions',
        method: 'GET',
        params: query,
        credentials: 'include',
    });