import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, CreditCard, Package, Globe, Edit3 } from "lucide-react";
import CurrencySelector from "../components/Currency/CurrencySelector";
import { getProductDetails } from "../api/ProductService";
import { convertCurrency } from "../api/CurrencyService";
import {
  createStandardPayment,
  initializeStandardPayment,
} from "../api/StandardPaymentService";
import { getDefaultAddress } from "../api/AddressService";
import CountrySelector from "../components/Location/CountrySelector";
import CitySelector from "../components/Location/CitySelector";
import { searchCountries, searchCities } from "../api/LocationService";
import PayPalButtonStack from "../components/Payment/PayPalButtonStack";
import { useTranslation } from "react-i18next";

const PaypalCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    product: passedProduct,
    productId,
    offerId,
    offerAmount,
    shippingAddress: passedAddress,
    selectedShipping,
    paymentType, // "standard" or "escrow"
  } = location.state || {};

  const [product, setProduct] = useState(passedProduct || null);
  const [productLoading, setProductLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(passedAddress || null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product && productId) loadProductDetails();
    if (!passedAddress) loadDefaultAddress();
  }, [productId, passedProduct, passedAddress]);

  const loadProductDetails = async () => {
    try {
      setProductLoading(true);
      const response = await getProductDetails(productId);
      if (response.success) {
        setProduct(response.data.item);
      } else {
        toast.error("Failed to load product details");
        navigate("/");
      }
    } catch {
      toast.error("Failed to load product details");
    } finally {
      setProductLoading(false);
    }
  };

  const loadDefaultAddress = async () => {
    try {
      const res = await getDefaultAddress();
      if (res.success && res.data.address) {
        setShippingAddress(res.data.address);
        await populateSelectorsFromAddress(res.data.address);
      }
    } catch {
      setShippingAddress(null);
    }
  };
  useEffect(() => {
    if (!product) return;
    if (selectedCurrency !== "USD") handleCurrencyConversion();
    else setConvertedPrice(offerAmount || product.price);
  }, [selectedCurrency, product, offerAmount]);

  const handleCurrencyConversion = async () => {
    try {
      setCurrencyLoading(true);
      const basePrice = offerAmount || product.price;
      const response = await convertCurrency({
        amount: basePrice,
        fromCurrency: "USD",
        toCurrency: selectedCurrency,
      });
      if (response.success) {
        setConvertedPrice(response.data.data.convertedAmount);
        setExchangeRate(response.data.data.exchangeRate);
      }
    } finally {
      setCurrencyLoading(false);
    }
  };

  const handleCreatePayPalPayment = async () => {
    if (!shippingAddress) return toast.error("Please add shipping address");
    if (!productId && !product?._id) return toast.error("Missing product info");

    try {
      setLoading(true);
      const paymentData = {
        productId: productId || product._id,
        offerId: offerId || null,
        paymentGateway: "paypal",
        shippingAddress,
        currency: selectedCurrency,
        paymentMethodType: "paypal",
      };

      const paymentRes = await createStandardPayment(paymentData);
      if (!paymentRes.success) return toast.error(paymentRes.error);

      const initRes = await initializeStandardPayment(
        paymentRes.data.paymentId,
        {
          returnUrl: `${window.location.origin}/payment-success?transaction=${paymentRes.data.paymentId}&type=paypal`,
          cancelUrl: `${window.location.origin}/payment-cancelled?transaction=${paymentRes.data.paymentId}&type=paypal`,
        }
      );

      if (initRes.success) {
        if (initRes.data.paymentUrl) {
          window.location.href = initRes.data.paymentUrl;
        } else {
          navigate(
            `/payment-success?transaction=${paymentRes.data.paymentId}&type=paypal`
          );
        }
      } else {
        toast.error(initRes.error || "Failed to initialize PayPal payment");
      }
    } catch (e) {
      toast.error(e.message || "PayPal payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-teal-600 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
        </button>
        <h1 className="text-xl font-bold mb-6">PayPal Checkout</h1>

        {/* Product Summary */}
        <div className="bg-white shadow p-6 rounded-lg mb-6">
          {product && (
            <>
              <h2 className="font-semibold">{product.title}</h2>
              <p>{product.description}</p>
              <p className="font-bold">
                {selectedCurrency}{" "}
                {(convertedPrice || product.price).toFixed(2)}
              </p>
            </>
          )}
        </div>

        {/* Shipping Address (reuse your edit form here) */}

        {/* PayPal Buttons */}
        <div className="bg-white shadow p-6 rounded-lg">
          <PayPalButtonStack
            loading={loading}
            onPayPal={handleCreatePayPalPayment}
            onPayLater={handleCreatePayPalPayment}
            onCard={handleCreatePayPalPayment}
          />
        </div>
      </div>
    </div>
  );
};
export default PaypalCheckout;
