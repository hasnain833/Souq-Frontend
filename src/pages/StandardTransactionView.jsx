import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RatingButton from "../components/Rating/RatingButton";
import TransactionProgress from "../components/Transaction/TransactionProgress";
import StandardTransactionManager from "../components/Transaction/StandardTransactionManager";
import { getStandardPayment } from "../api/StandardPaymentService";

const StandardTransactionView = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const fetchTransactionDetails = async () => {
    try {
      setRefreshing(true);
      console.log("🔍 Fetching standard transaction details:", transactionId);

      const response = await getStandardPayment(transactionId);
      console.log("📊 Standard transaction response:", response);

      if (response.success) {
        const transactionData = response.data.payment;
        setTransaction(transactionData);
        setError(null);

        // Determine user role
        const currentUserId = localStorage.getItem("userId");
        if (currentUserId) {
          if (transactionData.seller?._id === currentUserId) {
            setUserRole("seller");
          } else if (transactionData.buyer?._id === currentUserId) {
            setUserRole("buyer");
          }
        }
      } else {
        setError(response.error || "Failed to load transaction details");
        toast.error("Failed to load transaction details");
      }
    } catch (err) {
      console.error("❌ Error fetching transaction:", err);
      setError("Failed to load transaction details");
      toast.error("Failed to load transaction details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const navigateToChat = () => {
    // Get current user to check authentication
    const authUser = JSON.parse(localStorage.getItem("user"));

    if (!authUser) {
      toast.error("Please log in to start a chat");
      navigate("/login");
      return;
    }

    // Check if user is trying to chat with themselves
    if (
      authUser.id === transaction.seller._id ||
      authUser.id === transaction.buyer._id
    ) {
      // Determine if current user is buyer or seller
      const isBuyer = authUser.id === transaction.buyer._id;
      if (isBuyer && authUser.id === transaction.seller._id) {
        toast.error("You cannot chat with yourself");
        return;
      }
    }

    // Navigate to chat layout with the product ID as a query parameter
    // This will trigger the chat creation/retrieval process in ChatLayout
    navigate(`/chat-layout?productId=${transaction.product._id}`, {
      state: { status: "sold" },
    });
  };

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetails();
    } else {
      setError("No transaction ID provided");
      setLoading(false);
    }
  }, [transactionId]);

  const handleRefresh = () => {
    fetchTransactionDetails();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "processing":
      case "payment_processing":
        return <Clock className="w-6 h-6 text-blue-600" />;
      case "failed":
        return <Shield className="w-6 h-6 text-red-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Payment Completed";
      case "processing":
        return "Processing Payment";
      case "payment_processing":
        return "Processing Payment";
      case "failed":
        return "Payment Failed";
      default:
        return "Payment Status";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "completed":
        return "Your payment has been successfully processed";
      case "processing":
      case "payment_processing":
        return "Payment is being processed by the gateway";
      case "failed":
        return "Payment processing failed";
      default:
        return "Payment status information";
    }
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getProductImage = (product) => {

    if (product?.product_photos && product.product_photos.length > 0) {
      const imagePath = product.product_photos[0];
      if (imagePath.startsWith("uploads/Product/")) {
        return imagePath;
      }
      return imagePath;
    }

    return "/placeholder-product.jpg";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size={60} fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Transaction Not Found
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const authUser = JSON.parse(localStorage.getItem("user"));

  const sellerProfile = () => {
    if (authUser?.id === transaction.seller?._id) {
      navigate("/member-profile");
    } else {
      navigate(`/profile/${transaction.seller?._id}`);
    }
  };

  const buyerProfile = () => {
    if (authUser?.id === transaction.buyer?._id) {
      navigate("/member-profile");
    } else {
      navigate(`/profile/${transaction.buyer?._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 hover:text-teal-700 mb-4 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2" />
            Back
          </button>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Icon + Transaction Info */}
            <div className="flex items-start md:items-center gap-3">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  Standard Payment Transaction
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 break-all">
                  Transaction ID: {transaction?.transactionId}
                </p>
              </div>
            </div>

            {/* Right: Chat Button */}
            <button
              onClick={navigateToChat}
              className="bg-teal-600 text-white px-3 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 self-start md:self-auto">
              <MessageCircle className="w-4 h-4" />
              Chat with Seller
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Details
            </h2>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <img
                src={getProductImage(transaction?.product)}
                alt={transaction?.product?.title || "Product"}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = "/placeholder-product.jpg";
                }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {transaction?.product?.title || "Product"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {transaction?.product?.description ||
                    "No description available"}
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  Price:{" "}
                  {formatCurrency(
                    transaction?.productPrice,
                    transaction?.currency
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Parties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Parties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Buyer
                </h3>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {transaction.buyer?.profile ? (
                    <img
                      src={transaction.buyer?.profile}
                      alt="Seller"
                      className="w-10 h-10 rounded-full cursor-pointer"
                      onClick={buyerProfile}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                      onClick={buyerProfile}>
                      <span className="text-blue-600 font-medium text-sm">
                        {transaction?.buyer?.firstName?.charAt(0) || "B"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction?.buyer?.firstName}{" "}
                      {transaction?.buyer?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction?.buyer?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Seller
                </h3>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {transaction.seller?.profile ? (
                    <img
                      src={transaction.seller?.profile}
                      alt="Seller"
                      className="w-10 h-10 rounded-full cursor-pointer"
                      onClick={sellerProfile}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                      onClick={sellerProfile}>
                      <span className="text-green-600 font-medium text-sm">
                        {transaction?.seller?.firstName?.charAt(0) || "S"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction?.seller?.firstName}{" "}
                      {transaction?.seller?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction?.seller?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Status
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                Transaction ID:{" "}
                <span className="font-mono">{transaction?.transactionId}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg rtl:space-x-reverse">
              {getStatusIcon(transaction?.status)}
              <div>
                <h3 className="font-medium text-gray-900">
                  {getStatusText(transaction?.status)}
                </h3>
                <p className="text-sm text-gray-600">
                  {getStatusDescription(transaction?.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Progress */}
          {/* {transaction && (
                        <TransactionProgress
                            transaction={{
                                transactionId: transaction.transactionId,
                                status: transaction.status,
                                orderStatus: transaction.orderStatus
                            }}
                            transactionType="standard"
                            onRefresh={handleRefresh}
                        />
                    )} */}

          {/* Transaction Management (Seller Actions) */}
          {/* {transaction && userRole && (
                        <StandardTransactionManager
                            transactionId={transaction._id}
                            userRole={userRole}
                            onStatusUpdate={(newStatus, data) => {
                                console.log('Order status updated:', newStatus, data);
                                // Refresh transaction details
                                fetchTransactionDetails();
                            }}
                        />
                    )} */}

          {/* Rating Section */}
          {(transaction?.orderStatus === "completed" ||
            (transaction?.status === "completed" &&
              !transaction?.orderStatus)) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Rate Your Experience
              </h2>
              <RatingButton
                transactionId={transactionId}
                transactionType="standard"
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandardTransactionView;
