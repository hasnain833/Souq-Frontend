import axiosInstance from "./AxiosInstance";

export const testStandardPaymentAPI = async () => {
  try {
    console.log("🧪 Testing standard payment API...");
    const response = await axiosInstance.get("/api/user/payments/test");
    console.log("✅ Standard payment API test successful:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Standard payment API test failed:",
      error.response?.data || error.message
    );
    throw error.response?.data || { success: false, error: "API test failed" };
  }
};

// Create PayPal Order and Get Approval URL
export const createPayPalStandardOrder = async ({
  transactionId,
  returnUrl,
  cancelUrl,
}) => {
  try {
    const response = await axiosInstance.post(
      "/api/user/payments/paypal/orders",
      { transactionId, returnUrl, cancelUrl }
    );
    try {
      console.log("PayPal order created:", {
        success: response?.data?.success,
        orderId: response?.data?.data?.orderId || response?.data?.orderId,
        approvalUrl:
          response?.data?.data?.approvalUrl || response?.data?.approvalUrl,
      });
    } catch (_) {}
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to create PayPal order:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        error: "Failed to create PayPal order",
      }
    );
  }
};

// Opens PayPal approval flow by redirecting to PayPal
export const openPayPalCheckout = async ({
  transactionId,
  returnUrl,
  cancelUrl,
}) => {
  try {
    // Create PayPal order
    const result = await createPayPalStandardOrder({
      transactionId,
      returnUrl,
      cancelUrl,
    });

    // Check if we got a valid approval URL
    if (!result?.success || !result?.data?.approvalUrl) {
      throw new Error(result?.error || "Unable to start PayPal checkout");
    }

    // Get the approval URL
    const approvalUrl = result.data.approvalUrl;
    try {
      console.log("Opening PayPal checkout popup with:", {
        approvalUrl,
        orderId: result?.data?.orderId || result?.orderId,
      });
    } catch (_) {}

    // Try to open the approval URL in a popup
    const popup = window.open(
      approvalUrl,
      "PayPalCheckout",
      "width=520,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes"
    );

    // If the popup is blocked or not opened, fallback to redirecting the user
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      console.log("Popup blocked, redirecting to PayPal");
      window.location.href = approvalUrl; // Fallback redirect to PayPal
    }

    return { success: true, approvalUrl };
  } catch (error) {
    console.error("❌ Failed to open PayPal checkout:", error.message);
    throw error;
  }
};

export const createStandardPayment = async (paymentData) => {
  try {
    console.log("🔄 Creating standard payment transaction:", paymentData);
    const response = await axiosInstance.post(
      "/api/user/payments/create",
      paymentData
    );
    console.log("✅ Standard payment created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to create standard payment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        error: "Failed to create payment",
      }
    );
  }
};
export const initializeStandardPayment = async (paymentId, initData) => {
  try {
    console.log("🔄 Initializing standard payment:", paymentId, initData);
    const response = await axiosInstance.post(
      `/api/user/payments/${paymentId}/initialize`,
      initData
    );
    console.log("✅ Standard payment initialized:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to initialize standard payment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        error: "Failed to initialize payment",
      }
    );
  }
};

export const getStandardPayment = async (paymentId) => {
  try {
    console.log("🔄 Getting standard payment details:", paymentId);
    const response = await axiosInstance.get(`/api/user/payments/${paymentId}`);
    console.log("✅ Standard payment details retrieved:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to get standard payment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        error: "Failed to get payment details",
      }
    );
  }
};

export const checkStandardPaymentStatus = async (paymentId) => {
  try {
    console.log("🔍 Checking standard payment status:", paymentId);
    const response = await axiosInstance.get(
      `/api/user/payments/${paymentId}/check-payment-status`
    );
    console.log("✅ Standard payment status checked:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to check standard payment status:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        error: "Failed to check payment status",
      }
    );
  }
};
export const confirmStandardPayment = async (paymentId, confirmData) => {
  try {
    console.log("🔄 Confirming standard payment:", paymentId, confirmData);
    const response = await axiosInstance.post(
      `/api/user/payments/${paymentId}/confirm`,
      confirmData
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to confirm standard payment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        error: "Failed to confirm payment",
      }
    );
  }
};

export default {
  testStandardPaymentAPI,
  createStandardPayment,
  initializeStandardPayment,
  getStandardPayment,
  checkStandardPaymentStatus,
  createPayPalStandardOrder,
  openPayPalCheckout,
  confirmStandardPayment,
};
