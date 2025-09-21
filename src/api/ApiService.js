import axiosInstance from "./AxiosInstance";

const apiService = async ({
  url,
  method = "GET",
  data = {},
  params = {},
  headers = {},
  withAuth = true,
}) => {
  try {
    const isFormData = data instanceof FormData;

    const config = {
      url,
      method,
      data,
      params,
      headers: {
        ...headers,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      withAuth,
    };

    const response = await axiosInstance(config);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    return {
      success: false,
      error: message,
      status: error.response?.status || 500,
    };
  }
};

export default apiService;
