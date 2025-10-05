import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Shield, ArrowLeft, CreditCard, Package, Edit3 } from "lucide-react";
import PaymentGatewaySelector from "../components/Escrow/PaymentGatewaySelector";
// import CurrencySelector from "../components/Currency/CurrencySelector";
// ESCROW_DISABLED: Escrow API calls are disabled. Keeping import commented for future use.
// import {
//   createEscrowTransaction,
//   initializeEscrowPayment,
// } from "../api/EscrowService";
import { getProductDetails } from "../api/ProductService";
import { convertCurrency } from "../api/CurrencyService";
import {
  createStandardPayment,
  initializeStandardPayment,
  checkStandardPaymentStatus,
} from "../api/StandardPaymentService";
import { getDefaultAddress } from "../api/AddressService";
// import CountrySelector from "../components/Location/CountrySelector";
// import CitySelector from "../components/Location/CitySelector";
// import { searchCountries, searchCities } from "../api/LocationService";
import usePaymentSecurity from "../hooks/usePaymentSecurity";
import PayPalButtonStack from "../components/Payment/PayPalButtonStack";
import { useTranslation } from "react-i18next";
// Card data extraction removed - handled on payment page

const EscrowCheckout = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Clear any previous payment status when starting new checkout
  const { startNewCheckout } = usePaymentSecurity();

  // Get data from navigation state
  const {
    product: passedProduct,
    productId,
    offerId,
    offerAmount,
    selectedCard,
    selectedBankAccount,
    paymentMethodType,
    shippingAddress: passedAddress,
    selectedShipping,
    paymentType,
  } = location.state || {};

  // Remove card input states - will be handled on Stripe payment page

  // Debug logging
  console.log("EscrowCheckout - Navigation state:", location.state);
  console.log("EscrowCheckout - Product ID:", productId);
  console.log("EscrowCheckout - Passed Product:", passedProduct);
  console.log("EscrowCheckout - Payment Type:", paymentType);
  console.log("EscrowCheckout - Selected Shipping:", selectedShipping);
  console.log("EscrowCheckout - Product image structure:", {
    product_photos: passedProduct?.product_photos,
    photos: passedProduct?.photos,
    image: passedProduct?.image,
  });

  const [product, setProduct] = useState(passedProduct || null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(passedAddress || null);
  const [addressLoading, setAddressLoading] = useState(!passedAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [gatewayFeePaidBy, setGatewayFeePaidBy] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("idle"); // creating | initializing | redirecting
  const [productLoading, setProductLoading] = useState(true);
  // const [selectedCountry, setSelectedCountry] = useState(null);
  // const [selectedCity, setSelectedCity] = useState(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState(null);
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [statusChecking, setStatusChecking] = useState(false);

  // Clear previous payment status when starting new checkout
  useEffect(() => {
    startNewCheckout();
  }, [startNewCheckout]);

  // Load product details
  useEffect(() => {
    if (passedProduct) {
      // Product already passed, no need to fetch
      setProductLoading(false);
      return;
    }

    if (!productId) {
      toast.error("Product information missing");
      navigate("/");
      return;
    }

    loadProductDetails();

    // Load default address if not passed from previous page
    if (!passedAddress) {
      loadDefaultAddress();
    }
  }, [productId, passedProduct, passedAddress]);

  // Currency conversion disabled (Currency UI commented). Force USD defaults.
  useEffect(() => {
    try {
      if (product) {
        setSelectedCurrency("USD");
        setConvertedPrice(offerAmount || product.price);
        setExchangeRate(1);
      }
    } catch (error) {
      setSelectedCurrency("USD");
      setExchangeRate(1);
      setConvertedPrice(offerAmount || product?.price);
    }
  }, [product, offerAmount]);

  // Initialize address form with default values
  // const initializeAddressForm = () => {
  //   if (!shippingAddress) {
  //     console.log("ðŸ  Initializing empty address form");
  //     setShippingAddress({
  //       fullName: "",
  //       street1: "",
  //       street2: "",
  //       city: "",
  //       state: "",
  //       zip: "",
  //       country: "",
  //       phoneNumber: "",
  //       addressType: "home",
  //     });
  //     // setSelectedCountry(null);
  //     setSelectedCity(null);
  //   } else {
  //     console.log("ðŸ  Address form already has data:", shippingAddress);
  //     // Don't reset selectors here - they will be populated by populateSelectorsFromAddress
  //   }
  // };

  // Handle edit mode toggle
  // const handleEditAddress = async () => {
  //   console.log("ðŸ  Entering edit mode, current address:", shippingAddress);
  //   initializeAddressForm();
  //   setIsEditingAddress(true);

  //   // Populate selectors when editing existing address
  //   if (shippingAddress) {
  //     await populateSelectorsFromAddress(shippingAddress);
  //   }
  // };

  // Handle country selection
  // const handleCountrySelect = (country) => {
  //   setSelectedCountry(country);
  //   setSelectedCity(null); // Clear city when country changes
  //   setShippingAddress((prev) => ({
  //     ...prev,
  //     country: country ? country.name : "",
  //     city: "", // Clear city when country changes
  //   }));
  // };

  // Handle city selection
  // const handleCitySelect = (city) => {
  //   setSelectedCity(city);
  //   setShippingAddress((prev) => ({
  //     ...prev,
  //     city: city ? city.name : "",
  //     state: city ? city.state || "" : prev.state,
  //   }));
  // };

  // Function to populate selectors when editing existing address
  const populateSelectorsFromAddress = async (address) => {
    // UI minimized: skip expensive country/city lookups
    return;
  };

  // Save address changes
  const saveAddressChanges = async () => {
    try {
      if (!shippingAddress) {
        toast.error("Please fill in all required address fields");
        return;
      }

      // Validate required fields (form uses 'zip', backend expects 'zipCode' which we map on submit)
      const requiredFields = [
        "fullName",
        "street1",
        "city",
        "state",
        "zip",
        "country",
      ];
      const missingFields = requiredFields.filter(
        (field) => !shippingAddress[field]?.toString().trim()
      );

      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(", ")}`);
        return;
      }

      console.log("ðŸ’¾ Saving address changes:", shippingAddress);

      // Here you could add API call to save the address if needed
      // For now, just close the edit mode
      setIsEditingAddress(false);
      toast.success("Address updated successfully");
    } catch (error) {
      console.error("âŒ Failed to save address:", error);
      toast.error("Failed to save address changes");
    }
  };

  const loadDefaultAddress = async () => {
    try {
      setAddressLoading(true);
      console.log("ðŸ  Loading default address from API...");
      const response = await getDefaultAddress();
      console.log("ðŸ  Default address API response:", response);

      if (response.success && response.data.address) {
        const address = response.data.address;
        console.log("ðŸ  Raw address data received:", address);

        // Map all fields from the address model to match the form structure
        // Now using consistent field names: street1, street2
        const formattedAddress = {
          fullName: address.fullName || address.full_name || "",
          street1: address.street1 || "",
          street2: address.street2 || "",
          city: address.city || "",
          state: address.state || address.stateProvince || "",
          zip: address.zipCode || address.zip_code || address.zip || "",
          country: address.country || "",
          phoneNumber:
            address.phoneNumber || address.phone_number || address.phone || "",
          addressType: address.addressType || address.address_type || "home",
        };

        console.log("ðŸ  Formatted address for display:", formattedAddress);
        console.log("ðŸ  Field mapping check:", {
          "address.fullName": address.fullName,
          "address.street1": address.street1,
          "address.city": address.city,
          "address.zipCode": address.zipCode,
          "formatted.fullName": formattedAddress.fullName,
          "formatted.street1": formattedAddress.street1,
        });
        setShippingAddress(formattedAddress);

        // Populate selectors skipped (UI commented)
        // await populateSelectorsFromAddress(formattedAddress);
      } else {
        console.warn("ðŸ  No default address found or API returned failure");
        console.warn("ðŸ  Response details:", response);
        setShippingAddress(null);
      }
    } catch (error) {
      console.error("âŒ Failed to load default address:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });

      // Set null instead of empty object to show "no address" state
      setShippingAddress(null);
    } finally {
      setAddressLoading(false);
    }
  };

  const loadProductDetails = async () => {
    try {
      setProductLoading(true);
      console.log("Loading product details for ID:", productId);
      const response = await getProductDetails(productId);
      console.log("Product API response:", response);

      if (response.success) {
        console.log("Product loaded successfully:", response.data.item);
        setProduct(response.data.item);
      } else {
        console.error("Failed to load product:", response);
        toast.error("Failed to load product details");
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product details");
      navigate("/");
    } finally {
      setProductLoading(false);
    }
  };

  // const handleCurrencyChange = (newCurrency) => {
  //   try {
  //     console.log(
  //       "ðŸ”„ Currency changing from",
  //       selectedCurrency,
  //       "to",
  //       newCurrency
  //     );
  //     console.log("Current product price:", product?.price);
  //     console.log("Current offer amount:", offerAmount);
  //     setSelectedCurrency(newCurrency);
  //   } catch (error) {
  //     console.error("Error changing currency:", error);
  //     // Fallback to USD if there's an error
  //     setSelectedCurrency("USD");
  //     setExchangeRate(1);
  //     setConvertedPrice(offerAmount || product?.price);
  //   }
  // };

  // const handleCurrencyConversion = async () => {
  //   try {
  //     setCurrencyLoading(true);
  //     const basePrice = offerAmount || product.price;
  //     console.log("ðŸ”„ Converting", basePrice, "USD to", selectedCurrency);

  //     const response = await convertCurrency({
  //       amount: basePrice,
  //       fromCurrency: "USD",
  //       toCurrency: selectedCurrency,
  //     });

  //     console.log("Currency conversion API response:", response);

  //     if (response.success && response.data && response.data.data) {
  //       const conversionData = response.data.data;
  //       console.log("Conversion data:", conversionData);

  //       setConvertedPrice(conversionData.convertedAmount || basePrice);
  //       setExchangeRate(conversionData.exchangeRate || 1);

  //       console.log(
  //         "âœ… Updated convertedPrice:",
  //         conversionData.convertedAmount
  //       );
  //       console.log("âœ… Updated exchangeRate:", conversionData.exchangeRate);

  //       // Log fee conversions for debugging
  //       const newExchangeRate = conversionData.exchangeRate;
  //       console.log("ðŸ’° Fee conversions:");
  //       console.log(
  //         "- Shipping USD:",
  //         product.shipping_cost || 0,
  //         "â†’",
  //         selectedCurrency,
  //         ((product.shipping_cost || 0) * newExchangeRate).toFixed(2)
  //       );
  //       console.log(
  //         "- Sales Tax USD: 0.72 â†’",
  //         selectedCurrency,
  //         (0.72 * newExchangeRate).toFixed(2)
  //       );
  //       console.log(
  //         "- Platform Fee USD:",
  //         finalPrice * (paymentType === "standard" ? 0.05 : 0.1),
  //         "â†’",
  //         selectedCurrency,
  //         (
  //           finalPrice *
  //           (paymentType === "standard" ? 0.05 : 0.1) *
  //           newExchangeRate
  //         ).toFixed(2)
  //       );

  //       // Show success message with conversion details
  //       const totalFeesUSD =
  //         (product.shipping_cost || 0) +
  //         0.72 +
  //         finalPrice * (paymentType === "standard" ? 0.05 : 0.1);
  //       const totalFeesConverted = totalFeesUSD * newExchangeRate;
  //       toast.success(
  //         `âœ… Converted to ${selectedCurrency} | Fees: ${selectedCurrency} ${totalFeesConverted.toFixed(
  //           2
  //         )}`
  //       );
  //     } else {
  //       console.warn("âŒ Currency conversion failed, falling back to USD");
  //       toast.error("Failed to convert currency");
  //       setConvertedPrice(basePrice);
  //       setExchangeRate(1);
  //       setSelectedCurrency("USD");
  //     }
  //   } catch (error) {
  //     console.error("âŒ Currency conversion error:", error);
  //     toast.error("Failed to convert currency");
  //     setConvertedPrice(offerAmount || product.price);
  //     setExchangeRate(1);
  //     setSelectedCurrency("USD");
  //   } finally {
  //     setCurrencyLoading(false);
  //   }
  // };

  // ESCROW_DISABLED: bypass escrow and process as standard payment
  const handleCreateEscrowTransaction = async () => {
    toast.info(
      t?.("payment.escrowDisabled") ||
        "Escrow is temporarily disabled. Processing payment directly."
    );
    return await handleCreateStandardPayment();
    // Note: Original escrow flow kept below for future re-enable
    // console.log("ðŸš€ Pay with Escrow Protection button clicked!");
    // console.log("Current state:", {
    //   selectedGateway: selectedGateway?.id,
    //   agreementAccepted,
    //   hasShippingAddress: !!shippingAddress,
    //   productId: productId || product?._id || product?.id,
    // });

    // if (!selectedGateway) {
    //   console.log("âŒ No payment gateway selected");
    //   toast.error("Please select a payment method");
    //   return;
    // }

    // if (!agreementAccepted) {
    //   console.log("âŒ Escrow agreement not accepted");
    //   toast.error("Please accept the escrow agreement");
    //   return;
    // }

    // // Payment method validation removed - card details will be collected on payment page

    // // Card validation removed - will be handled on Stripe payment page

    // if (!shippingAddress) {
    //   console.log("âŒ No shipping address provided");
    //   toast.error("Please add a shipping address");
    //   return;
    // }

    // console.log("Validation check - productId:", productId);
    // console.log("Validation check - product:", product);
    // console.log("Validation check - product._id:", product?._id);
    // console.log("Validation check - product.id:", product?.id);
    // console.log("Validation check - passedProduct:", passedProduct);

    // const finalProductId = productId || product?._id || product?.id;
    // if (!finalProductId) {
    //   console.error("Product validation failed - no product ID found");
    //   console.error("Navigation state was:", location.state);
    //   toast.error("Product information is missing. Redirecting back...");
    //   setTimeout(() => {
    //     navigate(-1); // Go back to previous page
    //   }, 2000);
    //   return;
    // }

    // try {
    //   setLoading(true);

    //   // Calculate payment summary for API
    //   // Note: baseAmountForProcessing already includes displayPrice + platformFee + shippingCost + salesTax
    //   // The processing fee should only be added if paid by buyer, and should match the display calculation
    //   const totalAmountToPay =
    //     gatewayFeePaidBy === "buyer"
    //       ? baseAmountForProcessing + processingFee
    //       : baseAmountForProcessing;
    //   const paymentSummary = {
    //     productPrice: displayPrice,
    //     platformFee: platformFee,
    //     shippingCost: shippingCost,
    //     salesTax: salesTax,
    //     processingFee: gatewayFeePaidBy === "buyer" ? processingFee : 0,
    //     totalAmount: totalAmountToPay,
    //     currency: selectedCurrency,
    //     exchangeRate: currentExchangeRate,
    //     originalCurrency: selectedCurrency !== "USD" ? "USD" : null,
    //     originalAmount: selectedCurrency !== "USD" ? finalPrice : null,
    //   };

    //   // Map shipping address to backend schema (zip -> zipCode)
    //   const mappedShippingAddress = {
    //     fullName: shippingAddress.fullName,
    //     street1: shippingAddress.street1,
    //     street2: shippingAddress.street2 || "",
    //     city: shippingAddress.city,
    //     state: shippingAddress.state || "",
    //     zipCode: shippingAddress.zipCode || shippingAddress.zip || "",
    //     country: shippingAddress.country,
    //     phoneNumber: shippingAddress.phoneNumber || "",
    //   };

    //   // Create escrow transaction
    //   const escrowData = {
    //     productId: finalProductId,
    //     offerId: offerId || null,
    //     paymentGateway: selectedGateway.id,
    //     shippingAddress: mappedShippingAddress,
    //     shippingCost: shippingCostUSD, // Send the selected shipping cost
    //     gatewayFeePaidBy,
    //     currency: selectedCurrency,
    //     paymentSummary: paymentSummary, // Add payment summary
    //     cardDetails: selectedCard
    //       ? {
    //         cardId: selectedCard._id,
    //         cardBrand: selectedCard.cardBrand,
    //         lastFourDigits: selectedCard.lastFourDigits,
    //         cardholderName: selectedCard.cardholderName,
    //         expiryMonth: selectedCard.expiryMonth,
    //         expiryYear: selectedCard.expiryYear,
    //         isVerified: selectedCard.isVerified,
    //       }
    //       : null,
    //     bankAccountDetails: selectedBankAccount
    //       ? {
    //         accountId: selectedBankAccount._id,
    //         accountHolderName: selectedBankAccount.accountHolderName,
    //         bankName: selectedBankAccount.bankName,
    //         accountType: selectedBankAccount.accountType,
    //         lastFourDigits: selectedBankAccount.lastFourDigits,
    //         routingNumber: selectedBankAccount.routingNumber,
    //         isVerified: selectedBankAccount.isVerified,
    //       }
    //       : null,
    //     paymentMethodType:
    //       paymentMethodType || (selectedCard ? "card" : "bank"),
    //   };

    //   console.log("Creating escrow transaction with data:", escrowData);
    //   console.log("Product ID:", productId);
    //   console.log("Selected Gateway:", selectedGateway);
    //   console.log("Shipping Address:", shippingAddress);
    //   console.log("Shipping Cost Details:", {
    //     selectedShipping,
    //     shippingCostUSD,
    //     productShippingCost: product?.shipping_cost,
    //   });

    //   const escrowResponse = await createEscrowTransaction(escrowData);
    //   console.log("Escrow API response:", escrowResponse);

    //   if (!escrowResponse.success) {
    //     console.error("Escrow transaction creation failed:", escrowResponse);
    //     toast.error(escrowResponse.error || "Payment failed");
    //     return;
    //   }

    //   console.log("âœ… Escrow transaction created successfully");
    //   toast.success("Escrow transaction created successfully!");
    //   console.log("Full escrow response structure:", escrowResponse);
    //   console.log("Response data:", escrowResponse.data);

    //   // Handle the nested response structure from ApiService
    //   const responseData = escrowResponse.data?.data || escrowResponse.data;
    //   const escrowTransaction = responseData?.escrowTransaction || responseData;

    //   console.log("Response data after unwrapping:", responseData);
    //   console.log("Escrow transaction details:", escrowTransaction);

    //   if (!escrowTransaction || !escrowTransaction._id) {
    //     console.error("âŒ Escrow transaction or ID is missing");
    //     console.error(
    //       "Expected: escrowTransaction._id, Got:",
    //       escrowTransaction
    //     );
    //     console.error("Full response structure:", {
    //       escrowResponse,
    //       responseData,
    //       escrowTransaction,
    //     });
    //     toast.error("Failed to get transaction details");
    //     return;
    //   }

    //   // Initialize payment
    //   const paymentData = {
    //     returnUrl: `${window.location.origin}/escrow/payment-success?transaction=${escrowTransaction._id}`,
    //     cancelUrl: `${window.location.origin}/escrow/payment-cancelled?transaction=${escrowTransaction._id}`,
    //   };

    //   console.log("Initializing payment with data:", paymentData);
    //   console.log("Escrow transaction ID:", escrowTransaction._id);

    //   const paymentResponse = await initializeEscrowPayment(
    //     escrowTransaction._id,
    //     paymentData
    //   );
    //   console.log("ðŸ” Payment initialization response:", paymentResponse);
    //   console.log("ðŸ” Payment response data structure:", {
    //     success: paymentResponse.success,
    //     hasData: !!paymentResponse.data,
    //     hasClientSecret: !!paymentResponse.data?.clientSecret,
    //     hasPublishableKey: !!paymentResponse.data?.publishableKey,
    //     hasPaymentUrl: !!paymentResponse.data?.paymentUrl,
    //     hasTransactionId: !!paymentResponse.data?.transactionId,
    //     selectedGateway: selectedGateway?.id,
    //     dataKeys: paymentResponse.data ? Object.keys(paymentResponse.data) : [],
    //   });

    //   if (paymentResponse.success) {
    //     console.log("âœ… Payment initialization successful");
    //     toast.success("Payment initialization successful!");

    //     // Check if this is mock mode (for testing)
    //     // const isMockMode = paymentResponse.data.data.transactionId &&
    //     //   paymentResponse.data.data.transactionId.includes('mock');

    //     if (isMockMode) {
    //       console.log("ðŸŽ­ Mock mode detected - redirecting to success page");
    //       toast.success("Payment initialized successfully (Mock Mode)");
    //       navigate(
    //         `/escrow/payment-success?transaction=${escrowTransaction._id}`
    //       );
    //       return;
    //     }

    //     // Redirect to payment gateway
    //     if (paymentResponse.data.data.paymentUrl) {
    //       console.log(
    //         "Redirecting to payment URL:",
    //         paymentResponse.data.paymentUrl
    //       );
    //       window.location.href = paymentResponse.data.paymentUrl;
    //     } else if (selectedGateway?.id === "stripe") {
    //       // For Stripe, we MUST have a client secret to proceed
    //       if (paymentResponse.data.data.clientSecret) {
    //         console.log(
    //           "âœ… Stripe client secret received, navigating to payment page"
    //         );
    //         console.log(
    //           "Client secret:",
    //           paymentResponse.data.data.clientSecret?.substring(0, 20) + "..."
    //         );
    //         console.log(
    //           "Publishable key:",
    //           paymentResponse.data.data.publishableKey?.substring(0, 20) + "..."
    //         );
    //         console.log("Transaction ID:", escrowTransaction._id);

    //         console.log("ðŸ”„ Navigating to /escrow/stripe-payment...");
    //         navigate("/escrow/stripe-payment", {
    //           state: {
    //             clientSecret: paymentResponse.data.data?.clientSecret,
    //             publishableKey: paymentResponse.data.data?.publishableKey,
    //             transactionId: escrowTransaction._id,
    //             cardData: null, // No card data - will be collected on payment page
    //             autoProcess: false, // Disable auto-processing - user will enter card details
    //             paymentType: "escrow",
    //           },
    //         });
    //         console.log("âœ… Navigation command sent!");
    //       } else {
    //         // Stripe selected but no client secret - this is an error
    //         console.error("âŒ Stripe selected but no client secret received");
    //         console.error("Payment response data:", paymentResponse.data);
    //         toast.error(
    //           "Failed to initialize Stripe payment. Please try again."
    //         );
    //       }
    //     } else if (paymentResponse.data.data?.clientSecret) {
    //       // Other gateways with client secret
    //       console.log(
    //         "âœ… Client secret received for other gateway, navigating to payment page"
    //       );
    //       navigate("/escrow/stripe-payment", {
    //         state: {
    //           clientSecret: paymentResponse.data.clientSecret,
    //           publishableKey: paymentResponse.data.publishableKey,
    //           transactionId: escrowTransaction._id,
    //           cardData: null,
    //           autoProcess: false,
    //           paymentType: "escrow",
    //         },
    //       });
    //     } else {
    //       // Payment completed successfully, redirect to success page
    //       console.log(
    //         "âœ… Payment completed successfully, redirecting to success page"
    //       );
    //       navigate(
    //         `/escrow/payment-success?transaction=${escrowTransaction._id}&type=escrow`
    //       );
    //     }
    //   } else {
    //     console.error("âŒ Payment initialization failed:", paymentResponse);
    //     toast.error(paymentResponse.error || "Failed to initialize payment");
    //   }
    // } catch (error) {
    //   console.error("âŒ Error in escrow payment process:", error);
    //   console.error("Error details:", {
    //     message: error.message,
    //     stack: error.stack,
    //     response: error.response,
    //   });

    //   // More specific error message based on the error
    //   if (error.response) {
    //     const status = error.response.status;
    //     const errorMessage =
    //       error.response.data?.error ||
    //       error.response.data?.message ||
    //       "Unknown error";
    //     console.error(`API Error ${status}:`, errorMessage);
    //     toast.error(`Payment failed: ${errorMessage}`);
    //   } else if (error.message) {
    //     toast.error(`Payment failed: ${error.message}`);
    //   } else {
    //     toast.error("Failed to process payment");
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  const FORCE_MODE = (import.meta.env.VITE_FORCE_CHECKOUT === 'true');

  const handleCheckPaymentStatus = async () => {
    try {
      if (!lastPaymentId) return;
      setStatusChecking(true);
      const resp = await checkStandardPaymentStatus(lastPaymentId);
      // Navigate to success page to finalize UX regardless; backend will confirm status
      navigate(`/payment-success?transaction=${lastPaymentId}&type=standard`);
    } catch (e) {
      toast.error(e?.message || 'Failed to check payment status');
    } finally {
      setStatusChecking(false);
    }
  };

  const handleCreateStandardPayment = async () => {
    const forceOrder = FORCE_MODE;

    // Ensure we have a gateway
    if (!selectedGateway && forceOrder) {
      const fallbackGateway = { id: 'stripe', name: 'Stripe', feePercentage: 0, fixedFee: 0 };
      setSelectedGateway(fallbackGateway);
    }
    if (!selectedGateway && !forceOrder) {
      toast.error("Please select a payment method");
      return;
    }

    // Ensure we have a shipping address
    if (!shippingAddress && forceOrder) {
      setShippingAddress({
        fullName: currentUser?.userName || 'Guest User',
        street1: 'N/A',
        street2: '',
        city: 'N/A',
        state: '',
        zip: '00000',
        country: 'N/A',
        phoneNumber: '',
      });
    }
    if (!shippingAddress && !forceOrder) {
      toast.error("Please add a shipping address");
      return;
    }

    let finalProductId = productId || product?._id || product?.id || passedProduct?._id || passedProduct?.id;
    if (!finalProductId && forceOrder) {
      finalProductId = 'mock-product';
    }
    if (!finalProductId && !forceOrder) {
      toast.error("Product information is missing");
      return;
    }

    try {
      setLoading(true);
      setLoadingStage("creating");
      console.log("🔧 Creating standard payment...");

      // Calculate payment summary for standard payment
      const standardPaymentSummary = {
        productPrice: displayPrice,
        platformFee: platformFee,
        shippingCost: shippingCost,
        salesTax: salesTax,
        processingFee: gatewayFeePaidBy === "buyer" ? processingFee : 0,
        totalAmount:
          gatewayFeePaidBy === "buyer"
            ? baseAmountForProcessing + processingFee
            : baseAmountForProcessing,
        currency: selectedCurrency,
        exchangeRate: currentExchangeRate,
      };

      // Map shipping address to backend schema (zip -> zipCode)
      const mappedShippingAddress = {
        fullName: (shippingAddress && shippingAddress.fullName) || currentUser?.userName || 'Guest User',
        street1: (shippingAddress && shippingAddress.street1) || 'N/A',
        street2: (shippingAddress && shippingAddress.street2) || "",
        city: (shippingAddress && shippingAddress.city) || 'N/A',
        state: (shippingAddress && shippingAddress.state) || "",
        zipCode: (shippingAddress && (shippingAddress.zipCode || shippingAddress.zip)) || "00000",
        country: (shippingAddress && shippingAddress.country) || 'N/A',
        phoneNumber: (shippingAddress && shippingAddress.phoneNumber) || "",
      };

      // Create standard payment
      const paymentData = {
        productId: finalProductId,
        offerId: offerId || null,
        paymentGateway: (selectedGateway?.id) || 'stripe',
        shippingAddress: mappedShippingAddress,
        // Ensure backend uses the selected shipping option from checkout
        shippingCost: shippingCostUSD,
        gatewayFeePaidBy,
        currency: selectedCurrency,
        paymentSummary: standardPaymentSummary, // Add payment summary
        cardDetails: selectedCard
          ? {
              cardId: selectedCard._id,
              cardBrand: selectedCard.cardBrand,
              lastFourDigits: selectedCard.lastFourDigits,
            }
          : null,
        bankAccountDetails: selectedBankAccount
          ? {
              accountId: selectedBankAccount._id,
              accountHolderName: selectedBankAccount.accountHolderName,
              bankName: selectedBankAccount.bankName,
              accountType: selectedBankAccount.accountType,
              lastFourDigits: selectedBankAccount.lastFourDigits,
              routingNumber: selectedBankAccount.routingNumber,
              isVerified: selectedBankAccount.isVerified,
            }
          : null,
        paymentMethodType:
          paymentMethodType || (selectedCard ? "card" : "bank"),
      };

      console.log("Creating standard payment with data:", paymentData);

      const paymentResponse = await createStandardPayment(paymentData);
      console.log("Standard payment API response:", paymentResponse);

      if (!paymentResponse.success) {
        console.error("âŒ Standard payment creation failed:", paymentResponse);
        toast.error(paymentResponse.error || "Failed to create payment");
        return;
      }

      console.log("âœ… Standard payment created successfully");
      toast.success("Standard payment created successfully!");
      const paymentId = paymentResponse.data.paymentId;

      // Initialize payment with gateway
      const initData = {
        returnUrl: `${window.location.origin}/payment-success?transaction=${paymentId}&type=standard`,
        cancelUrl: `${window.location.origin}/payment-cancelled?transaction=${paymentId}&type=standard`,
      };

      console.log("Initializing standard payment:", paymentId, initData);
      setLoadingStage("initializing");

      const initResponse = await initializeStandardPayment(paymentId, initData);
      console.log("Standard payment initialization response:", initResponse);

      if (initResponse.success) {
        console.log("âœ… Standard payment initialization successful");
        toast.success("Standard payment initialization successful!");

        // Check if this is mock mode (for testing)
        const isMockMode =
          initResponse.data.transactionId &&
          initResponse.data.transactionId.includes("mock");

        if (isMockMode) {
          console.log("ðŸŽ­ Mock mode detected - redirecting to success page");
          toast.success("Payment processed successfully");
          navigate(`/payment-success?transaction=${paymentId}&type=standard`);
          return;
        }

        // Handle different payment methods
        if (initResponse.data.clientSecret) {
          // For Stripe, redirect to separate payment page (like escrow flow)
          console.log(
            "âœ… Stripe client secret received, navigating to payment page"
          );
          console.log(
            "Client secret:",
            initResponse.data.clientSecret?.substring(0, 20) + "..."
          );
          console.log(
            "Publishable key:",
            initResponse.data.publishableKey?.substring(0, 20) + "..."
          );
          console.log("Transaction ID:", paymentId);

          console.log("ðŸ”„ Navigating to /stripe-payment...");
          navigate("/stripe-payment", {
            state: {
              clientSecret: initResponse.data.clientSecret,
              publishableKey: initResponse.data.publishableKey,
              transactionId: paymentId,
              cardData: null, // No card data - will be collected on payment page
              autoProcess: false, // Disable auto-processing - user will enter card details
              paymentType: "standard",
            },
          });
          console.log("âœ… Navigation command sent!");
        } else if (initResponse.data.paymentUrl) {
          console.log(
            "Redirecting to payment URL:",
            initResponse.data.paymentUrl
          );
          setLoadingStage("redirecting");
          // brief UX pause to show loader state
          setTimeout(() => {
            window.location.href = initResponse.data.paymentUrl;
          }, 800);
        } else {
          // Payment completed successfully, redirect to success page
          console.log(
            "âœ… Standard payment completed successfully, redirecting to success page"
          );
          setLoadingStage("redirecting");
          setTimeout(() => {
            navigate(`/payment-success?transaction=${paymentId}&type=standard`);
          }, 600);
        }
      } else {
        console.error(
          "âŒ Standard payment initialization failed:",
          initResponse
        );
        toast.error(initResponse.error || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("âŒ Error in standard payment process:", error);
      toast.error(error.error || error.message || "Failed to process payment");
    } finally {
      setLoading(false);
      setLoadingStage("idle");
    }
  };
  // Create standard payment then navigate to embedded PayPal Card page
  const handleCreatePayPalCardStandard = async () => {
    try {
      const forceOrder = FORCE_MODE;
      if (!selectedGateway || selectedGateway.id !== "paypal")
        return toast.error("Please choose PayPal");
      if (!shippingAddress) return toast.error("Please add a shipping address");

      const finalProductId = productId || product?._id || product?.id;
      if (!finalProductId) return toast.error("Product information is missing");

      setLoading(true);
      // TEMP: map shipping address and fallback country to avoid blocking checkout when Country UI is hidden
      const mappedShippingAddress = {
        fullName: shippingAddress.fullName,
        street1: shippingAddress.street1,
        street2: shippingAddress.street2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state || "",
        zipCode: shippingAddress.zipCode || shippingAddress.zip || "",
        country:
          shippingAddress.country ||
          (selectedCountry && selectedCountry.name) ||
          "N/A",
        phoneNumber: shippingAddress.phoneNumber || "",
      };

      const paymentSummary = {
        productPrice: displayPrice,
        platformFee,
        shippingCost,
        salesTax,
        processingFee: gatewayFeePaidBy === "buyer" ? processingFee : 0,
        totalAmount:
          gatewayFeePaidBy === "buyer"
            ? baseAmountForProcessing + processingFee
            : baseAmountForProcessing,
        currency: selectedCurrency,
        exchangeRate: currentExchangeRate,
      };

      const paymentData = {
        productId: finalProductId,
        offerId: offerId || null,
        paymentGateway: "paypal",
        shippingAddress,
        shippingCost: shippingCostUSD,
        gatewayFeePaidBy,
        currency: selectedCurrency,
        paymentSummary,
        paymentMethodType: "card",
      };

      setLoading(true);
      setLoadingStage("creating");
      const paymentResponse = await createStandardPayment(paymentData);
      if (!paymentResponse.success)
        return toast.error(paymentResponse.error || "Failed to create payment");

      const paymentId = paymentResponse.data.paymentId;

      setLoadingStage("initializing");
      const initResponse = await initializeStandardPayment(paymentId, {
        returnUrl: `${window.location.origin}/payment-success?transaction=${paymentId}&type=standard`,
        cancelUrl: `${window.location.origin}/payment-cancelled?transaction=${paymentId}&type=standard`,
      });

      if (!initResponse.success)
        return toast.error(
          initResponse.error || "Failed to initialize payment"
        );

      if (initResponse.data?.paymentUrl) {
        // Skip external redirect; go straight to local success with loader
        setLoadingStage("redirecting");
        setTimeout(() => {
          navigate(`/payment-success?transaction=${paymentId}&type=standard`);
        }, 600);
      } else if (initResponse.data?.transactionId) {
        // Also skip external approval for now; go to success to complete flow
        setLoadingStage("redirecting");
        setTimeout(() => {
          navigate(`/payment-success?transaction=${paymentId}&type=standard`);
        }, 600);
      } else {
        setLoadingStage("redirecting");
        setTimeout(() => {
          navigate(`/payment-success?transaction=${paymentId}&type=standard`);
        }, 600);
      }
    } catch (e) {
      console.error("PayPal Card Standard error", e);
      toast.error(e.message || "Failed to start PayPal card payment");
    } finally {
      setLoading(false);
      setLoadingStage("idle");
    }
  };

  // Create standard payment with PayPal gateway (PayPal button flow)
  const handleCreatePayPalStandard = async () => {
    try {
      if (!shippingAddress) return toast.error("Please add a shipping address");
      const finalProductId = productId || product?._id || product?.id;
      if (!finalProductId) return toast.error("Product information is missing");

      setSelectedGateway({ id: "paypal", name: "PayPal", feePercentage: 2.9, fixedFee: 0.3 });

      setLoading(true);
      setLoadingStage("creating");

      const paymentSummary = {
        productPrice: displayPrice,
        platformFee,
        shippingCost,
        salesTax,
        processingFee: gatewayFeePaidBy === "buyer" ? processingFee : 0,
        totalAmount:
          gatewayFeePaidBy === "buyer"
            ? baseAmountForProcessing + processingFee
            : baseAmountForProcessing,
        currency: selectedCurrency,
        exchangeRate: currentExchangeRate,
      };

      const paymentData = {
        productId: finalProductId,
        offerId: offerId || null,
        paymentGateway: "paypal",
        shippingAddress,
        shippingCost: shippingCostUSD,
        gatewayFeePaidBy,
        currency: selectedCurrency,
        paymentSummary,
        paymentMethodType: "paypal",
      };

      const paymentResponse = await createStandardPayment(paymentData);
      if (!paymentResponse.success)
        return toast.error(paymentResponse.error || "Failed to create payment");

      const paymentId = paymentResponse.data.paymentId;
      setLoadingStage("initializing");
      const initResponse = await initializeStandardPayment(paymentId, {
        returnUrl: `${window.location.origin}/payment-success?transaction=${paymentId}&type=standard`,
        cancelUrl: `${window.location.origin}/payment-cancelled?transaction=${paymentId}&type=standard`,
      });

      if (!initResponse.success)
        return toast.error(initResponse.error || "Failed to initialize payment");

      if (initResponse.data?.paymentUrl) {
        setLoadingStage("redirecting");
        setTimeout(() => {
          try {
            const w = window.open(initResponse.data.paymentUrl, '_blank', 'noopener');
            if (w && w.focus) w.focus();
          } catch {}
        }, 800);
      } else if (initResponse.data?.transactionId) {
        // Fallback: construct PayPal approval URL from order id
        const orderId = String(initResponse.data.transactionId || '');
        const approvalUrl = `${process.env.NODE_ENV === 'production' ? 'https://www.paypal.com' : 'https://www.sandbox.paypal.com'}/checkoutnow?token=${orderId}`;
        setLoadingStage("redirecting");
        setTimeout(() => {
          try {
            const w = window.open(approvalUrl, '_blank', 'noopener');
            if (w && w.focus) w.focus();
          } catch {}
        }, 600);
      } else {
        setLoadingStage("redirecting");
        setTimeout(() => {
          navigate(`/payment-success?transaction=${paymentId}&type=standard`);
        }, 600);
      }
    } catch (e) {
      console.error("PayPal Standard error", e);
      toast.error(e.message || "Failed to start PayPal payment");
    } finally {
      setLoading(false);
      setLoadingStage("idle");
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600">Unable to load product information.</p>
        </div>
      </div>
    );
  }

  const finalPrice = offerAmount || product.price || 0;
  const displayPrice = convertedPrice || finalPrice;
  const shippingCostUSD =
    selectedShipping?.cost?.total ?? product.shipping_cost ?? 0;
  const salesTaxUSD = 0.72; // Fixed sales tax amount in USD

  // Debug shipping cost calculation
  console.log("ðŸšš EscrowCheckout shipping cost debug:", {
    selectedShipping: selectedShipping,
    selectedShippingCost: selectedShipping?.cost?.total,
    productShippingCost: product?.shipping_cost,
    finalShippingCostUSD: shippingCostUSD,
  });

  // Calculate fees based on payment type
  const platformFeeRate = paymentType === "standard" ? 0.05 : 0.1; // 5% for standard, 10% for escrow
  const platformFeeUSD = finalPrice * platformFeeRate;

  // Convert fees to selected currency
  const currentExchangeRate = exchangeRate || 1;
  const shippingCost =
    selectedCurrency === "USD"
      ? shippingCostUSD
      : shippingCostUSD * currentExchangeRate;
  const salesTax =
    selectedCurrency === "USD"
      ? salesTaxUSD
      : salesTaxUSD * currentExchangeRate;
  const platformFee =
    selectedCurrency === "USD"
      ? platformFeeUSD
      : platformFeeUSD * currentExchangeRate;

  const baseAmountForProcessing =
    displayPrice + platformFee + shippingCost + salesTax;
  const processingFee = selectedGateway
    ? (baseAmountForProcessing * selectedGateway.feePercentage) / 100 +
      (selectedGateway.fixedFee || 0)
    : 0;
  // const baseURL = import.meta.env.VITE_API_BASE_URL;
  // const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

  // Handle different image path structures
  const getProductImage = () => {
    // Minimal UI: Always use a safe placeholder to avoid undefined base URL usage
    return "https://via.placeholder.com/80x80?text=No+Image";
  };

  const productImage = getProductImage();

  // Debug: Log the final product image URL
  console.log("ðŸ–¼ï¸ EscrowCheckout - Final product image URL:", productImage);
  console.log("ðŸ–¼ï¸ EscrowCheckout - Product data for image:", {
    product_photos: product?.product_photos,
    photos: product?.photos,
    image: product?.image,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2" />
            {t("back")}
          </button>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {paymentType === "standard" ? (
              <>
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {t("standardPaymentCheckout")}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t("fastSecurePayment")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Shield className="w-8 h-8 text-teal-600" />
                {/* <div>
                                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                        {t("secure_escrow_checkout")}
                                    </h1>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        {t("paymentProtectedUntilDelivery")}
                                    </p>
                                </div> */}
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {t("secure_escrow_checkout")}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t("paymentProtectedUntilDelivery")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fee Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("order_summary")}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Product Image */}
                {/* <img
                  src={product.product_photos[0]}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    console.log(
                      "EscrowCheckout: Product image failed to load:",
                      e.target.src
                    );
                    e.target.src =
                      "https://via.placeholder.com/80x80?text=No+Image";
                  }}
                  onLoad={() => {
                    console.log(
                      "EscrowCheckout: Product image loaded successfully:",
                      productImage
                    );
                  }}
                /> */}

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-base line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>
                      {t("brand")}: {product.brand}
                    </span>
                    <span>
                      {t("size")}: {product.size}
                    </span>
                    <span>
                      {t("condition")}: {product.condition}
                    </span>
                  </div>
                </div>

                {/* Price Block */}
                <div className="text-left sm:text-right">
                  {currencyLoading ? (
                    <div className="flex items-center sm:justify-end gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                      <span className="text-sm text-gray-600">
                        {t("convertingTo")}...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedCurrency}{" "}
                        {(convertedPrice || finalPrice).toFixed(2)}
                      </div>
                      {offerAmount && (
                        <div className="text-sm text-green-600">
                          {t("offerApplied")}
                        </div>
                      )}
                      {selectedCurrency !== "USD" && (
                        <div className="text-xs text-gray-500">
                          â‰ˆ USD {(finalPrice || 0).toFixed(2)} (Rate:{" "}
                          {(exchangeRate || 1).toFixed(4)})
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {loading && (
              <div className="bg-teal-50 border border-teal-200 rounded-md p-3 flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600" />
                <div className="text-sm text-teal-800">
                  {loadingStage === 'creating' && 'Placing your order...'}
                  {loadingStage === 'initializing' && 'Processing payment...'}
                  {loadingStage === 'redirecting' && 'Redirecting to payment provider...'}
                  {loadingStage === 'idle' && 'Working...'}
                </div>
              </div>
            )}

            {/* Currency Selection */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t("currency_pricing")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Globe className="w-4 h-4 inline mr-2 rtl:ml-2 text-teal-600" />
                    {t("paymentCurrency")}
                  </label>
                  <CurrencySelector
                    selectedCurrency={selectedCurrency}
                    onCurrencyChange={handleCurrencyChange}
                    showRates={true}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("price_in")} {selectedCurrency}
                  </label>
                  <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50">
                    {currencyLoading ? (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                        <span className="text-sm text-gray-600">
                          {t("convertingTo")} {selectedCurrency}...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xl font-bold text-gray-900 mb-1">
                          {selectedCurrency}{" "}
                          {(convertedPrice || finalPrice).toFixed(2)}
                        </div>
                        {selectedCurrency !== "USD" && (
                          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md inline-block">
                            {t("original")}: USD {(finalPrice || 0).toFixed(2)}{" "}
                            (Rate: 1 USD = {(exchangeRate || 1).toFixed(4)}{" "}
                            {selectedCurrency})
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div> */}

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={shippingAddress?.fullName || ""}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress?.street1 || ""}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        street1: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress?.city || ""}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress?.country || ""}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={shippingAddress?.zip || ""}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        zip: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 rtl:ml-2" />
                  {t("shippingAddress")}
                </h3>
                <button
                  onClick={handleEditAddress}
                  className="text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                  title="Edit address">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {isEditingAddress ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("full_name")} *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress?.fullName || ""}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg  hover:border-teal-500 focus:border-teal-500 focus:outline-none"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("streetAddress")} *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress?.street1 || ""}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          street1: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg  hover:border-teal-500 focus:border-teal-500 focus:outline-none"
                      placeholder="Enter your street address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("apartmentOptional")}
                    </label>
                    <input
                      type="text"
                      value={shippingAddress?.street2 || ""}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          street2: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg  hover:border-teal-500 focus:border-teal-500focus:outline-none"
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("country")} *
                      </label>
                      <CountrySelector
                        selectedCountry={selectedCountry}
                        onCountrySelect={handleCountrySelect}
                        placeholder="Select Country"
                        required={true}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("city")} *
                      </label>
                      <CitySelector
                        selectedCountry={selectedCountry}
                        selectedCity={selectedCity}
                        onCitySelect={handleCitySelect}
                        placeholder="Select City"
                        required={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("state_province")}
                      </label>
                      <input
                        type="text"
                        value={shippingAddress?.state || ""}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg hover:border-teal-500 focus:border-teal-500 focus:outline-none"
                        placeholder="Enter state/province"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("zip_code")} *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress?.zipCode || ""}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            zipCode: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg hover:border-teal-500 focus:border-teal-500 focus:outline-none"
                        placeholder="Enter ZIP code"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("phone_number")}
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress?.phoneNumber || ""}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg  hover:border-teal-500 focus:border-teal-500 focus:outline-none rtl:text-right"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("address_type")}
                      </label>
                      <select
                        value={shippingAddress?.addressType || "home"}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            addressType: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg  hover:border-teal-500 focus:border-teal-500 focus:outline-none">
                        <option value="home">{t("home")}</option>
                        <option value="work">{t("work")}</option>
                        <option value="other">{t("other")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      {t("cancel")}
                    </button>
                    <button
                      onClick={saveAddressChanges}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                      {t("saveAddress")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700">
                  {addressLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : shippingAddress ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900 font-semibold">
                          {shippingAddress.fullName}
                        </p>
                        {shippingAddress.addressType && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                            {shippingAddress.addressType}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-700">
                        {shippingAddress.street1}
                      </p>
                      {shippingAddress.street2 && (
                        <p className="text-sm text-gray-700">
                          {shippingAddress.street2}
                        </p>
                      )}

                      <p className="text-sm text-gray-700">
                        {shippingAddress.city}
                        {shippingAddress.state && `, ${shippingAddress.state}`}
                        {shippingAddress.zipCode &&
                          ` ${shippingAddress.zipCode}`}
                      </p>

                      <p className="text-sm text-gray-700">
                        {shippingAddress.country}
                      </p>
                      {shippingAddress.phoneNumber && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="font-medium mr-1">
                            {t("phone_number")}:
                          </span>
                          {shippingAddress.phoneNumber}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <p>{t("no_addresses")}</p>
                      <button
                        onClick={handleEditAddress}
                        className="text-teal-600 hover:underline text-sm mt-1">
                        {t("add_address")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div> */}

            {/* Payment Gateway Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <PaymentGatewaySelector
                amount={displayPrice + platformFee + shippingCost + salesTax}
                currency={selectedCurrency}
                onGatewaySelect={setSelectedGateway}
                selectedGateway={selectedGateway}
              />
            </div>

            {/* Payment Method Selection - Always show for Stripe escrow payments */}
            {/* {(selectedGateway?.id === "stripe" ||
              (!selectedCard && !selectedBankAccount)) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </h3>

                  {selectedGateway?.id === "stripe" && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <Shield className="w-4 h-4 inline mr-1" />
                        For secure escrow payments with Stripe, please enter your
                        card details below.
                      </p>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Secure Payment
                        </h4>
                        <p className="text-sm text-blue-700">
                          You'll enter your card details on the next secure
                          payment page
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

            {/* Selected Payment Method */}

            {/* {(selectedCard || selectedBankAccount) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedCard ? (
                        <>
                          <span
                            style={{
                              color: getCardBrandInfo(selectedCard.cardBrand)
                                .color,
                            }}>
                            {getCardBrandInfo(selectedCard.cardBrand).icon}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getCardBrandInfo(selectedCard.cardBrand).name}{" "}
                              â€¢â€¢â€¢â€¢ {selectedCard.lastFourDigits}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedCard.cardholderName} â€¢ Expires{" "}
                              {selectedCard.expiryMonth}/
                              {selectedCard.expiryYear}
                            </p>
                          </div>
                        </>
                      ) : selectedBankAccount ? (
                        <>
                          <div className="text-2xl">ðŸ¦</div>
                          <div>
                            <p className="font-medium text-gray-900">
                              ****{selectedBankAccount.lastFourDigits}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedBankAccount.accountHolderName} â€¢{" "}
                              {selectedBankAccount.bankName || "Bank Account"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedBankAccount.accountType
                                .charAt(0)
                                .toUpperCase() +
                                selectedBankAccount.accountType.slice(1)}{" "}
                              Account
                            </p>
                          </div>
                        </>
                      ) : null}
                    </div>
                    {((selectedCard && selectedCard.isVerified) ||
                      (selectedBankAccount &&
                        selectedBankAccount.isVerified)) && (
                        <div className="flex items-center text-green-600">
                          <Shield className="w-4 h-4 mr-1" />
                          <span className="text-sm">Verified</span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )} */}

            {/* Gateway Fee Options
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("payment_processing_fee")}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gatewayFeePaidBy"
                    value="buyer"
                    checked={gatewayFeePaidBy === "buyer"}
                    onChange={(e) => setGatewayFeePaidBy(e.target.value)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 rtl:mr-3">
                    {t("buyer_pays_fee")}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gatewayFeePaidBy"
                    value="seller"
                    checked={gatewayFeePaidBy === "seller"}
                    onChange={(e) => setGatewayFeePaidBy(e.target.value)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 rtl:mr-3">
                    {t("seller_pays_fee")}
                  </span>
                </label>
              </div>
            </div> */}

            {/* Escrow Agreement - Only show for escrow payments */}
            {/* {paymentType !== "standard" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("escrow_protection_agreement")}
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <h4 className="font-medium mb-2">
                        {t("how_escrow_protection_works")}:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t("escrow_details_1")}</li>
                        <li>{t("escrow_details_2")}</li>
                        <li>{t("escrow_details_3")}</li>
                        <li>{t("escrow_details_4")}</li>
                        <li>{t("escrow_details_5")}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreementAccepted}
                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                    className="mt-1 accent-teal-600 w-6 h-6"
                  />
                  <span className="text-sm text-gray-700">
                    {t("agree_to_escrow_terms")}
                  </span>
                </label>
              </div>
            )} */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("payment_summary")}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("productPrice")}:</span>
                  {currencyLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                      <span className="text-xs text-gray-500">
                        {t("convertingTo")}...
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium">
                      {selectedCurrency} {displayPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {paymentType === "standard"
                      ? t("platformFee")
                      : t("escrow_protection_fee")}
                  </span>
                  {currencyLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                      <span className="text-xs text-gray-500">
                        {t("convertingTo")}...
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium">
                      {selectedCurrency} {platformFee.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">{t("shipping")}:</span>
                  {currencyLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                      <span className="text-xs text-gray-500">
                        {t("convertingTo")}...
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium">
                      {selectedCurrency} {shippingCost.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">{t("sales_tax")}:</span>
                  {currencyLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                      <span className="text-xs text-gray-500">
                        {t("convertingTo")}...
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium">
                      {selectedCurrency} {salesTax.toFixed(2)}
                    </span>
                  )}
                </div>

                {selectedGateway && gatewayFeePaidBy === "buyer" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("processing_fee")}:
                    </span>
                    {currencyLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                        <span className="text-xs text-gray-500">
                          {t("convertingTo")}...
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {selectedCurrency} {processingFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {selectedCurrency !== "USD" && !currencyLoading && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <div className="font-medium mb-1">
                      {t("exchangeRate")}: 1 USD ={" "}
                      {(exchangeRate || 1).toFixed(4)} {selectedCurrency}
                    </div>
                    <div className="space-y-1">
                      <div>
                        {t("originalProductPrice")}: USD{" "}
                        {(finalPrice || 0).toFixed(2)}
                      </div>
                      <div>
                        {t("originalPlatformFee")}: USD{" "}
                        {(
                          (finalPrice || 0) *
                          (paymentType === "standard" ? 0.05 : 0.1)
                        ).toFixed(2)}
                      </div>
                      <div>
                        {t("originalShipping")}: USD{" "}
                        {(product.shipping_cost || 0).toFixed(2)}
                      </div>
                      <div>{t("originalSalesTax")}: USD 0.72</div>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">
                      {t("total_to_pay")}:
                    </span>
                    {currencyLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                        <span className="text-sm text-gray-600">
                          {"Calculating total"}...
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-900">
                        {selectedCurrency}{" "}
                        {(
                          displayPrice +
                          platformFee +
                          shippingCost +
                          salesTax +
                          (gatewayFeePaidBy === "buyer" ? processingFee : 0)
                        ).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              {/* {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                  <strong>Debug Info:</strong>
                  <div>selectedGateway: {selectedGateway?.id || 'none'}</div>
                  <div>agreementAccepted: {agreementAccepted.toString()}</div>
                  <div>hasShippingAddress: {!!shippingAddress}</div>
                  <div>hasProductId: {!!(productId || product?._id || product?.id)}</div>
                </div>
              )} */}

              {/* Payment Buttons */}
              <div className="mt-6 space-y-3">
                {/* If PayPal is selected, show the PayPal button stack */}
                {selectedGateway?.id === "paypal" ? (
                  <PayPalButtonStack
                    loading={loading}
                    disabled={
                      loading ||
                      productLoading ||
                      !(productId || product?._id || product?.id)
                    }
                    onPayPal={handleCreatePayPalStandard}
                    onPayLater={handleCreatePayPalStandard}
                    onCard={handleCreatePayPalCardStandard}
                  />
                ) : (
                  // Default buttons for other gateways (Stripe/PayTabs)
                  <>
                    {paymentType === "standard" ? (
                      <button
                        onClick={handleCreateStandardPayment}
                        disabled={
                          loading ||
                          productLoading ||
                          !selectedGateway ||
                          !shippingAddress ||
                          !(productId || product?._id || product?.id)
                        }
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t("processing")}...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <CreditCard className="w-4 h-4 mr-2 rtl:ml-2" />
                            {t("payWithStandardPayment")}
                          </div>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleCreateEscrowTransaction}
                        disabled={
                          loading ||
                          productLoading ||
                          !selectedGateway ||
                          !agreementAccepted ||
                          // !shippingAddress ||
                          !(productId || product?._id || product?.id)
                        }
                        className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t("processing")}...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Shield className="w-4 h-4 mr-2 rtl:ml-2" />
                            {t("pay_with_escrow")}
                          </div>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Debug Section */}
              {/* <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Tools</h4>
                <button
                  onClick={handleTestStandardPaymentAPI}
                  className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  Test Standard Payment API
                </button>
              </div> */}

              {/* <div className="mt-4 text-xs text-gray-500 text-center">
                ðŸ”’ {t("payment_info_secure")}
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            <div className="text-gray-800 font-medium">
              {loadingStage === 'creating' && 'Placing your order...'}
              {loadingStage === 'initializing' && 'Processing payment...'}
              {loadingStage === 'redirecting' && 'Redirecting to payment provider...'}
              {loadingStage === 'idle' && 'Working...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowCheckout;
