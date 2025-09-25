import { useEffect, useState } from "react";
import { Plus, X, Shield, ArrowRight, CreditCard, Building2, Truck } from "lucide-react";
import { LuPencil } from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CardModal from "../components/Products/PaymentCard";
import { getUserCards, getDefaultCard, getCardBrandInfo } from "../api/CardService";
import { getBankAccounts } from "../api/PaymentMethodService";
import { getDefaultAddress, formatAddressDisplay } from "../api/AddressService";
import ShippingService from "../api/ShippingService";
import { isPaymentGatewayEnabled, areApiCallsPrevented } from '../config/paymentConfig';
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

export default function CheckoutPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const product = location.state?.product
    const { offerId, offerAmount } = location.state || {}
    console.log('Checkout - product:', product)
    console.log('Checkout - product._id:', product?._id)
    console.log('Checkout - product.id:', product?.id)
    console.log('Checkout - location.state:', location.state)

    // Add error handling for missing product data
    if (!product) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">No Product Data</h2>
                    <p className="text-gray-600">Unable to load checkout information. Please try again.</p>
                </div>
            </div>
        );
    }
    const [openCard, setOpenCard] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [useEscrow, setUseEscrow] = useState(true);
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [userBankAccounts, setUserBankAccounts] = useState([]);
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [bankAccountsLoading, setBankAccountsLoading] = useState(true);
    const [paymentMethodType, setPaymentMethodType] = useState('card'); // 'card' or 'bank'
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addressLoading, setAddressLoading] = useState(true);
    const [shippingRates, setShippingRates] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [shippingLoading, setShippingLoading] = useState(false);

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    // const normalizedBaseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;


    const shipping = product?.shipping_cost;
    const tax = 0.72;
    const productPrice = offerAmount || product.price || 0;
    const buyerProtectionFee = (productPrice * 0.05);
    const platformFee = (productPrice * 0.1)// 10% platform fee for escrow
    const total = productPrice + (useEscrow ? platformFee : buyerProtectionFee) + shipping + tax;

    // Debug shipping cost calculation
    console.log('🚚 Shipping cost debug:', {
        selectedShipping: selectedShipping,
        shippingCostFromSelection: selectedShipping?.cost?.total,
        productShippingCost: product?.shipping_cost,
        finalShippingCost: shipping,
        productPrice: productPrice
    });

    useEffect(() => {
        // Load user cards, bank accounts, default address, and shipping rates
        // loadUserCards();
        // loadUserBankAccounts();
        loadDefaultAddress();
        loadShippingRates(); // Load shipping rates immediately
    }, []);

    const loadDefaultAddress = async () => {
        try {
            setAddressLoading(true);
            const response = await getDefaultAddress();
            if (response.success && response.data.address) {
                setSelectedAddress(response.data.address);
            }
        } catch (error) {
            console.error('Failed to load default address:', error);
            // If no default address, keep selectedAddress as null
        } finally {
            setAddressLoading(false);
        }
    };

    const loadUserCards = async () => {
        try {
            setCardsLoading(true);
            const response = await getUserCards(true);
            if (response.success) {
                setUserCards(response.data.cards);
                // Set default card as selected if available
                const defaultCard = response.data.cards.find(card => card.isDefault);
                if (defaultCard) {
                    setSelectedCard(defaultCard);
                } else if (response.data.cards.length > 0) {
                    setSelectedCard(response.data.cards[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load cards:', error);
            toast.error('Failed to load saved cards');
        } finally {
            setCardsLoading(false);
        }
    };

    const loadUserBankAccounts = async () => {
        try {
            setBankAccountsLoading(true);
            const response = await getBankAccounts(true);
            if (response.success) {
                setUserBankAccounts(response.data.accounts);
                // Set default bank account as selected if available
                const defaultAccount = response.data.accounts.find(account => account.isDefault);
                if (defaultAccount) {
                    setSelectedBankAccount(defaultAccount);
                } else if (response.data.accounts.length > 0) {
                    setSelectedBankAccount(response.data.accounts[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load bank accounts:', error);
            toast.error('Failed to load saved bank accounts');
        } finally {
            setBankAccountsLoading(false);
        }
    };

    const handleCardSaved = (newCard) => {
        // Refresh cards list when a new card is saved
        loadUserCards();
        toast.success('Card saved successfully!');
    };

    const loadShippingRates = async () => {
        try {
            setShippingLoading(true);
            console.log('🔄 Loading delivery options and providers...');

            // Get both delivery options and providers with pricing
            const [deliveryResponse, providersResponse] = await Promise.all([
                ShippingService.getDeliveryOptions(),
                ShippingService.getProviders()
            ]);

            console.log('📦 Delivery options API response:', deliveryResponse);
            console.log('🏢 Providers API response:', providersResponse);

            if (deliveryResponse.success && deliveryResponse.data.deliveryOptions &&
                providersResponse.success && providersResponse.data.providers) {

                const deliveryOptions = deliveryResponse.data.deliveryOptions;
                const providers = providersResponse.data.providers;

                console.log(`✅ Found ${deliveryOptions.length} delivery options:`, deliveryOptions);
                console.log(`✅ Found ${providers.length} providers:`, providers);

                // Create a map of providers for easy lookup
                const providerMap = {};
                providers.forEach(provider => {
                    providerMap[provider._id] = provider;
                });

                // Transform delivery options to match the expected format
                const transformedRates = deliveryOptions.map(option => {
                    console.log('🔄 Transforming option:', option);

                    // Get provider pricing data from the providers API
                    const providerData = providerMap[option.shippingProvider._id] || option.shippingProvider;

                    // Calculate pricing using provider data
                    const baseFee = providerData?.pricing?.baseFee || 0;
                    const perKgRate = providerData?.pricing?.perKg || 0;
                    const originalCurrency = providerData?.pricing?.currency || 'AED';

                    // Force USD currency for SOUQ project as per requirements
                    const currency = 'USD';

                    // Convert AED to USD (approximate rate: 1 USD = 3.67 AED)
                    // For Middle East providers (Zajel, Aramex, etc.), assume AED pricing
                    const convertToUSD = (amount) => {
                        const providerName = option.shippingProvider?.name?.toLowerCase();

                        // Special handling for Zajel - always treat as AED regardless of DB setting
                        if (providerName === 'zajel') {
                            const convertedAmount = Math.round((amount / 3.67) * 100) / 100;
                            console.log(`💱 Zajel conversion: ${amount} AED → ${convertedAmount} USD`);
                            return convertedAmount;
                        }

                        // Other Middle East providers typically use AED pricing
                        if (providerName === 'aramex' || providerName === 'fetchr' || originalCurrency === 'AED') {
                            return Math.round((amount / 3.67) * 100) / 100; // Convert AED to USD
                        }

                        // For other providers, check if already in USD
                        if (originalCurrency === 'USD') {
                            return amount; // Already in USD
                        }

                        // Default: assume AED and convert
                        return Math.round((amount / 3.67) * 100) / 100;
                    };

                    // Determine service type and pricing based on provider and service
                    let serviceCost = convertToUSD(baseFee);
                    let serviceName = option.serviceName || 'Standard Delivery';
                    let estimatedDays = { min: 1, max: 3 };

                    // Handle different provider types
                    const providerName = option.shippingProvider?.name?.toLowerCase();

                    console.log(`💰 Pricing for ${providerName}:`, {
                        baseFee,
                        perKgRate,
                        currency,
                        providerPricing: providerData?.pricing
                    });

                    if (providerName === 'local_pickup' || option.serviceCode === 'LOCAL_PICKUP') {
                        serviceCost = 0; // Local pickup is free
                        serviceName = 'Local Pickup';
                        estimatedDays = { min: 0, max: 1 };
                    } else if (providerName === 'local_dropoff' || option.serviceCode === 'LOCAL_DROPOFF') {
                        serviceCost = 0; // Drop-off point is free
                        serviceName = 'Drop-off Point';
                        estimatedDays = { min: 0, max: 1 };
                    } else if (providerName === 'local_delivery' || option.serviceCode === 'LOCAL_DELIVERY') {
                        serviceCost = option.settings?.localDelivery?.fee || 3;
                        serviceName = 'Local Delivery';
                        estimatedDays = { min: 0, max: 2 };
                    } else {
                        // For external providers (Aramex, DHL, Fetchr) - use provider pricing
                        const supportedService = providerData?.supportedServices?.find(
                            s => s.serviceCode === option.serviceCode
                        ) || option.shippingProvider?.supportedServices?.find(
                            s => s.serviceCode === option.serviceCode
                        );

                        if (supportedService) {
                            serviceName = supportedService.serviceName || option.serviceName;
                            estimatedDays = supportedService.estimatedDays || { min: 1, max: 3 };
                        }

                        // Calculate cost using provider pricing
                        if (perKgRate > 0) {
                            // Assume 1kg package weight for calculation
                            const packageWeight = 1;
                            const totalAEDCost = baseFee + (perKgRate * packageWeight);
                            serviceCost = convertToUSD(totalAEDCost);
                        } else {
                            // Fallback to base fee only
                            serviceCost = convertToUSD(baseFee);
                        }

                        console.log(`💰 Calculated cost for ${serviceName}:`, {
                            providerName: option.shippingProvider?.name,
                            originalCurrency,
                            baseFeeOriginal: baseFee,
                            perKgRateOriginal: perKgRate,
                            packageWeight: 1,
                            totalCostUSD: serviceCost,
                            conversionApplied: (option.shippingProvider?.name?.toLowerCase() === 'zajel' ||
                                option.shippingProvider?.name?.toLowerCase() === 'aramex' ||
                                originalCurrency === 'AED'),
                            conversionRate: '1 USD = 3.67 AED'
                        });
                    }

                    return {
                        id: option._id,
                        provider: {
                            name: option.shippingProvider?.name,
                            displayName: option.shippingProvider?.displayName || ShippingService.formatProviderName(option.shippingProvider?.name)
                        },
                        serviceCode: option.serviceCode,
                        serviceName: serviceName,
                        cost: {
                            total: serviceCost,
                            currency: currency
                        },
                        estimatedDays: estimatedDays,
                        features: {
                            tracking: option.preferences?.includeInsurance || false,
                            insurance: option.preferences?.includeInsurance || false
                        },
                        isDefault: option.isDefault,
                        deliveryOption: option // Keep reference to original option
                    };
                });

                console.log(`✅ Transformed ${transformedRates.length} shipping rates:`, transformedRates);
                setShippingRates(transformedRates);

                // Auto-select the default option or first option
                const defaultOption = transformedRates.find(rate => rate.isDefault);
                if (defaultOption) {
                    console.log('✅ Auto-selected default option:', defaultOption);
                    setSelectedShipping(defaultOption);
                } else if (transformedRates.length > 0) {
                    console.log('✅ Auto-selected first option:', transformedRates[0]);
                    setSelectedShipping(transformedRates[0]);
                }
            } else {
                // Fallback: show message that no delivery options are configured
                console.log('❌ API responses:', { deliveryResponse, providersResponse });
                setShippingRates([]);

                if (!deliveryResponse.success) {
                    toast.error('Failed to load delivery options');
                } else if (!providersResponse.success) {
                    toast.error('Failed to load provider pricing');
                } else {
                    toast.info('No delivery options configured. Please set up delivery options in settings.');
                }
            }
        } catch (error) {
            console.error('❌ Failed to load delivery options:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            });

            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else if (error.response?.status === 404) {
                toast.error('Delivery options endpoint not found.');
            } else {
                toast.error('Failed to load delivery options: ' + (error.message || 'Unknown error'));
            }
            setShippingRates([]);
        } finally {
            setShippingLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!selectedAddress?.fullName || !selectedAddress?.street1 || !selectedAddress?.city || !selectedAddress?.zipCode) {
                toast.error('Please fill in all required fields');
                return;
            }

            // For checkout page, we just close the modal
            // The address will be used for the current transaction
            setIsModalOpen(false);
            toast.success('Address updated successfully!');
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error('Failed to save address');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Helmet>
                <title>Checkout - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-4 rounded shadow">
                        <div className="flex gap-4">
                            {/* <img src={`${normalizedBaseURL}${product.product_photos[0]}`} alt={product.name} className="w-40 h-40 rounded object-cover border border-gray-100" /> */}
                            <img src={product.product_photos[0]} alt={product.name} className="w-40 h-40 rounded object-cover border border-gray-100" />
                            <div>
                                <h2 className="font-semibold">{product.title}</h2>
                                <p className="text-sm text-gray-500">{product.brand}</p>
                                <p className="text-sm text-gray-500">{product.size}</p>
                            </div>
                        </div>
                    </div>

                    {/* <div className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between">
                            <h3 className="font-semibold text-lg">Shipping Address</h3>
                            <LuPencil className="w-4 h-4 cursor-pointer" onClick={() => setIsModalOpen(true)} />
                        </div>
                        {addressLoading ? (
                            <div className="mt-2">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ) : selectedAddress ? (
                            <div className="mt-2">
                                <p className="text-sm text-gray-700 font-medium">{selectedAddress.fullName}</p>
                                <p className="text-sm text-gray-600">{selectedAddress.addressLine1}</p>
                                {selectedAddress.addressLine2 && (
                                    <p className="text-sm text-gray-600">{selectedAddress.addressLine2}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                    {selectedAddress.city}{selectedAddress.state && `, ${selectedAddress.state}`} {selectedAddress.zipCode}
                                </p>
                                <p className="text-sm text-gray-600">{selectedAddress.country}</p>
                                {selectedAddress.phoneNumber && (
                                    <p className="text-sm text-gray-600">Phone: {selectedAddress.phoneNumber}</p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">No shipping address selected</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-teal-600 text-sm hover:underline mt-1"
                                >
                                    Add shipping address
                                </button>
                            </div>
                        )}
                    </div> */}

                    {/* <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-semibold text-lg mb-2">{t("delivery_options")}</h3>
                        {shippingLoading ? (
                            <div className="border p-3 rounded">
                                <div className="animate-pulse flex space-x-4">
                                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ) : shippingRates.length > 0 ? (
                            <div className="space-y-2">
                                {shippingRates.map((rate, index) => (
                                    <div
                                        key={rate.id || index}
                                        className={`border p-3 rounded cursor-pointer transition-colors ${selectedShipping === rate
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedShipping(rate)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ${selectedShipping === rate
                                                    ? 'border-teal-500 bg-teal-500'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {selectedShipping === rate && (
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {rate.provider?.name === 'zajel' ? (
                                                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                                            <img
                                                                src="/images/shipping/zajel-logo.svg"
                                                                alt="Zajel"
                                                                className="w-6 h-6"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'block';
                                                                }}
                                                            />
                                                            <span className="text-blue-600 text-xs font-bold hidden">Z</span>
                                                        </div>
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center ${rate.provider?.name === 'aramex' ? 'bg-red-100' :
                                                            rate.provider?.name === 'fetchr' ? 'bg-green-100' :
                                                                rate.provider?.name === 'dhl' ? 'bg-yellow-100' :
                                                                    'bg-orange-100'
                                                            }`}>
                                                            <span className={`text-xs font-bold ${rate.provider?.name === 'aramex' ? 'text-red-600' :
                                                                rate.provider?.name === 'fetchr' ? 'text-green-600' :
                                                                    rate.provider?.name === 'dhl' ? 'text-yellow-600' :
                                                                        'text-orange-600'
                                                                }`}>
                                                                {rate.provider?.displayName?.charAt(0) || '🚚'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {rate.provider?.displayName || rate.serviceName} - {rate.serviceName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {rate.estimatedDays?.min === rate.estimatedDays?.max
                                                                ? `${rate.estimatedDays.min} business day${rate.estimatedDays.min > 1 ? 's' : ''}`
                                                                : `${rate.estimatedDays?.min}-${rate.estimatedDays?.max} business days`
                                                            }
                                                        </p>
                                                        {rate.features && (rate.features.tracking || rate.features.insurance) && (
                                                            <div className="flex gap-2 mt-1">
                                                                {rate.features.tracking && (
                                                                    <span className="text-xs text-blue-600">{t("tracking")}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {ShippingService.formatCurrency(rate.cost.total, rate.cost.currency)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : selectedAddress ? (
                            <div className="border p-4 rounded text-center">
                                <div className="text-gray-500 mb-2">
                                    <Truck className="w-12 h-12 text-gray-400 mx-auto" />
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{t("no_delivery_options")}</p>
                                <p className="text-xs text-gray-500">
                                    {t("setDeliveryOptions")}
                                    <Link to="/settings/delivery" className="text-teal-600 hover:text-teal-700 ml-1 rtl:mr-1 hover:underline">{t("settings")}</Link>
                                </p>
                            </div>
                        ) : (
                            <div className="border p-3 rounded text-center">
                                <p className="text-sm text-gray-500">{t("selectShippingAddress")}</p>
                            </div>
                        )}
                    </div> */}
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-semibold text-lg mb-2">{t("delivery")}</h3>

                        {product?.shipping_cost ? (
                            <div
                                className="border p-3 rounded cursor-pointer transition-colors border-teal-500 bg-teal-50"
                            // onClick={() =>
                            //     setSelectedShipping({
                            //         id: "default",
                            //         provider: { name: "default", displayName: t("standard_shipping") },
                            //         serviceName: t("default_service"),
                            //         estimatedDays: product.shipping_cost.estimatedDays || { min: 3, max: 7 },
                            //         cost: {
                            //             total: product.shipping_cost.amount,
                            //             currency: product.shipping_cost.currency || "USD",
                            //         },
                            //     })
                            // }
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        {/* Radio Circle */}
                                        <div
                                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 border-teal-500 bg-teal-500"                                        >
                                            {/* {selectedShipping?.id === "default" && ( */}
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                            {/* )} */}
                                        </div>

                                        {/* Shipping info */}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                               {t("deliveryCharge")}
                                            </p>
                                            {/* <p className="text-xs text-gray-500 mt-1">
                                                Shiping
                                            </p> */}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {ShippingService.formatCurrency(
                                                product.shipping_cost || "USD"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border p-3 rounded text-center">
                                <p className="text-sm text-gray-500">{t("no_shipping_available")}</p>
                            </div>
                        )}
                    </div>


                    {/* Payment Protection Options */}
                    <div className="bg-white p-4 sm:p-4 md:p-4 rounded shadow">
                        <h3 className="font-semibold text-lg sm:text-xl md:text-2xl mb-4">{t("payment_protection")}</h3>

                        <div className="space-y-4 ">
                            {/* Escrow Protection Option */}
                            <div
                                className={`border rounded-lg p-4 sm:p-5 cursor-pointer transition-all ${useEscrow ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => setUseEscrow(true)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-2 sm:space-y-0 rtl:space-x-reverse rtl:space-y-reverse">
                                    {/* Radio indicator */}
                                    <div
                                        className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${useEscrow ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                                            }`}
                                    >
                                        {useEscrow && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                    {/* Description */}
                                    <div className="flex-1">
                                        <div className="flex items-center flex-wrap gap-2 mb-1">
                                            <Shield className="w-4 h-4 text-teal-600" />
                                            <h4 className="font-medium text-gray-900">{t("escrow_protection")}</h4>
                                            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full">{t("recommended")}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {t("payment_held_until_delivery")}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            • {t("funds_held_until_delivery")} • {t("dispute_resolution")}• 10% {t("platformFee")}
                                        </div>
                                    </div>

                                    {/* Fee */}
                                    <div className="sm:text-right text-left sm:mt-0 mt-2">
                                        <div className="text-sm font-medium text-gray-900">USD {platformFee.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{t("protection_fee")}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Standard Protection Option */}
                            <div
                                className={`border rounded-lg p-4 sm:p-5 cursor-pointer transition-all ${!useEscrow ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => setUseEscrow(false)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-2 sm:space-y-0 rtl:space-x-reverse rtl:space-y-reverse">
                                    {/* Radio indicator */}
                                    <div
                                        className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${!useEscrow ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                                            }`}
                                    >
                                        {!useEscrow && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">{t("standard_payment")}</h4>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {t("direct_payment_to_seller")}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            • {t("immediate_payment")} • {t("basic_dispute_resolution")}
                                        </div>
                                    </div>

                                    {/* Fee */}
                                    <div className="sm:text-right text-left sm:mt-0 mt-2">
                                        <div className="text-sm font-medium text-gray-900">USD {buyerProtectionFee.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{t("serviceFee")}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* <div className="bg-white p-4 rounded shadow"> */}
                    {/* <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Payment Method</h3>
                            <Plus className="w-5 h-5 cursor-pointer text-teal-600 hover:text-teal-700" onClick={() => setOpenCard(true)} />
                        </div> */}

                    {/* Payment Method Type Selection */}

                    <div className="flex space-x-4 mb-4">
                        {/* <button
                                onClick={() => setPaymentMethodType('card')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                    paymentMethodType === 'card'
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Card Details</span>
                            </button> */}
                        {/* <button
                                onClick={() => setPaymentMethodType('bank')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                    paymentMethodType === 'bank'
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                <span>Bank Details</span>
                            </button> */}
                    </div>

                    {/* Card Details Section */}
                    {/* {paymentMethodType === 'card' && (
                            <>
                                {cardsLoading ? (
                                    <div className="mt-3 p-4 border rounded">
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : userCards.length > 0 ? (
                                    <div className="mt-3 space-y-2">
                                        {userCards.map((card) => (
                                            <div
                                                key={card._id}
                                                className={`border p-3 rounded cursor-pointer transition-colors ${
                                                    selectedCard?._id === card._id
                                                        ? 'border-teal-500 bg-teal-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedCard(card)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 ${
                                                            selectedCard?._id === card._id
                                                                ? 'border-teal-500 bg-teal-500'
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {selectedCard?._id === card._id && (
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {getCardBrandInfo(card.cardBrand).name} •••• {card.lastFourDigits}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {card.cardholderName} • Expires {card.expiryMonth}/{card.expiryYear}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {card.isDefault && (
                                                            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                        <span style={{ color: getCardBrandInfo(card.cardBrand).color }}>
                                                            {getCardBrandInfo(card.cardBrand).icon}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border p-3 rounded flex justify-between items-center mt-2">
                                        <div>
                                            <p className="text-sm font-medium">No saved cards</p>
                                            <p className="text-gray-500 text-sm">Add a credit or debit card</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" className="h-5" alt="mc" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" className="h-5" alt="visa" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )} */}

                    {/* Bank Details Section */}
                    {/* {paymentMethodType === 'bank' && (
                            <>
                                {bankAccountsLoading ? (
                                    <div className="mt-3 p-4 border rounded">
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : userBankAccounts.length > 0 ? (
                                    <div className="mt-3 space-y-2">
                                        {userBankAccounts.map((account) => (
                                            <div
                                                key={account._id}
                                                className={`border p-3 rounded cursor-pointer transition-colors ${
                                                    selectedBankAccount?._id === account._id
                                                        ? 'border-teal-500 bg-teal-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedBankAccount(account)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 ${
                                                            selectedBankAccount?._id === account._id
                                                                ? 'border-teal-500 bg-teal-500'
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {selectedBankAccount?._id === account._id && (
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5"></div>
                                                            )}
                                                        </div>
                                                        <div className="text-2xl">🏦</div>
                                                        <div>
                                                            <p className="text-sm font-medium">****{account.lastFourDigits}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {account.accountHolderName} • {account.bankName || 'Bank Account'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {account.isDefault && (
                                                            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border p-3 rounded flex justify-between items-center mt-2">
                                        <div>
                                            <p className="text-sm font-medium">No saved bank accounts</p>
                                            <p className="text-gray-500 text-sm">Add a bank account from settings</p>
                                        </div>
                                        <div className="text-2xl">🏦</div>
                                    </div>
                                )}
                            </>
                        )} */}
                    {/* </div> */}

                </div>

                <div className="bg-white p-4 rounded shadow self-start">
                    <h3 className="font-semibold text-lg mb-4">{t("order_summary")}</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex justify-between">
                            <span>{t("productPrice")}</span>
                            <span>USD {productPrice.toFixed(2)}</span>
                        </div>
                        {offerAmount && (
                            <div className="flex justify-between text-green-600">
                                <span>{t("offerApplied")}</span>
                                <span>-USD {(product.price - offerAmount).toFixed(2)}</span>
                            </div>
                        )}
                        {useEscrow ? (
                            <div className="flex justify-between">
                                <span>{t("escrow_protection_fee")}</span>
                                <span>USD {platformFee.toFixed(2)}</span>
                            </div>
                        ) : (
                            <div className="flex justify-between">
                                <span>{t("buyer_protection_fee")}</span>
                                <span>USD {buyerProtectionFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>{t("shipping")}</span>
                            <span>USD {shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t("sales_tax")}</span>
                            <span>USD {tax.toFixed(2)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold text-black">
                            <span>{t("total_to_pay")}</span>
                            <span>USD {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {useEscrow ? (
                        <button
                            className="bg-teal-600 w-full text-white py-2 rounded mt-3 hover:bg-teal-700 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed rtl:space-x-reverse"
                            // disabled={
                            //     (paymentMethodType === 'card' && !selectedCard) ||
                            //     (paymentMethodType === 'bank' && !selectedBankAccount) ||
                            //     !selectedAddress
                            // }
                            onClick={() => {
                                const productId = product?._id || product?.id;
                                if (!product || !productId) {
                                    console.error('Checkout - Cannot navigate to escrow: product or product ID is missing');
                                    console.error('Product object:', product);
                                    toast.error('Product information is missing. Please refresh the page and try again.');
                                    return;
                                }

                                // if (paymentMethodType === 'card' && !selectedCard) {
                                //     toast.error('Please select a card');
                                //     return;
                                // }

                                // if (paymentMethodType === 'bank' && !selectedBankAccount) {
                                //     toast.error('Please select a bank account');
                                //     return;
                                // }

                                if (!selectedAddress) {
                                    toast.error('Please add a shipping address');
                                    return;
                                }

                                const navigationState = {
                                    product: product,
                                    productId: productId,
                                    offerId,
                                    offerAmount,
                                    selectedCard: paymentMethodType === 'card' ? selectedCard : null,
                                    selectedBankAccount: paymentMethodType === 'bank' ? selectedBankAccount : null,
                                    paymentMethodType: paymentMethodType,
                                    shippingAddress: selectedAddress,
                                    selectedShipping: product?.shipping_cost
                                };
                                console.log('Checkout - Navigating to escrow with state:', navigationState);
                                navigate('/continue-checkout', { state: navigationState });
                            }}
                        >
                            <Shield className="w-4 h-4" />
                            <span>{t("pay_with_escrow")}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            className="bg-teal-600 w-full text-white py-2 rounded mt-3 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            // disabled={
                            //     (paymentMethodType === 'card' && !selectedCard) ||
                            //     (paymentMethodType === 'bank' && !selectedBankAccount) ||
                            //     !selectedAddress
                            // }
                            onClick={() => {
                                const productId = product?._id || product?.id;
                                if (!product || !productId) {
                                    console.error('Checkout - Cannot navigate to standard payment: product or product ID is missing');
                                    console.error('Product object:', product);
                                    toast.error('Product information is missing. Please refresh the page and try again.');
                                    return;
                                }

                                // if (paymentMethodType === 'card' && !selectedCard) {
                                //     toast.error('Please select a card');
                                //     return;
                                // }

                                // if (paymentMethodType === 'bank' && !selectedBankAccount) {
                                //     toast.error('Please select a bank account');
                                //     return;
                                // }

                                if (!selectedAddress) {
                                    toast.error('Please add a shipping address');
                                    return;
                                }

                                const navigationState = {
                                    product: product,
                                    productId: productId,
                                    offerId,
                                    offerAmount,
                                    selectedCard: paymentMethodType === 'card' ? selectedCard : null,
                                    selectedBankAccount: paymentMethodType === 'bank' ? selectedBankAccount : null,
                                    paymentMethodType: paymentMethodType,
                                    shippingAddress: selectedAddress,
                                    selectedShipping: product?.shipping_cost,
                                    paymentType: 'standard'
                                };
                                console.log('Checkout - Navigating to standard payment with state:', navigationState);
                                navigate('/continue-checkout', { state: navigationState });
                            }}
                        >
                            {t("continueWithStandardPayment")}
                        </button>
                    )}
                    <p className="text-xs text-center text-gray-500 mt-2">🔒 {t("payment_encrypted_secure")}</p>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-sm rounded-lg p-6 shadow-lg relative">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Add Address</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-600 hover:text-black text-xl"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={selectedAddress?.fullName || ''}
                                    onChange={(e) =>
                                        setSelectedAddress({ ...selectedAddress, fullName: e.target.value })
                                    }
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                                <input
                                    type="text"
                                    value={selectedAddress?.street1 || ''}
                                    onChange={(e) =>
                                        setSelectedAddress({ ...selectedAddress, street1: e.target.value })
                                    }
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                                <input
                                    type="text"
                                    value={selectedAddress?.street2 || ''}
                                    onChange={(e) =>
                                        setSelectedAddress({ ...selectedAddress, street2: e.target.value })
                                    }
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Zip Code</label>
                                <input
                                    type="text"
                                    value={selectedAddress?.zipCode || ''}
                                    onChange={(e) =>
                                        setSelectedAddress({ ...selectedAddress, zipCode: e.target.value })
                                    }
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    value={selectedAddress?.city || ''}
                                    onChange={(e) =>
                                        setSelectedAddress({ ...selectedAddress, city: e.target.value })
                                    }
                                    className="w-full border rounded p-2"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">State</label>
                                <input
                                    type="text"
                                    value={selectedAddress?.state || ''}
                                    onChange={(e) =>
                                        setSelectedAddress({ ...selectedAddress, state: e.target.value })
                                    }
                                    className="w-full border rounded p-2"
                                    placeholder="State/Province"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Country</label>
                                <select
                                    value={selectedAddress?.country || 'United States'}
                                    onChange={(e) =>
                                        setSelectedAddress({ ...selectedAddress, country: e.target.value })
                                    }
                                    className="w-full border rounded p-2 bg-white"
                                >
                                    <option value="">Select Country</option>
                                    <option value="United States">United States</option>
                                    <option value="Canada">Canada</option>
                                    <option value="India">India</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <button
                                className="text-teal-600 font-medium"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                                onClick={handleSave}
                            >
                                Save address
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <CardModal
                openCard={openCard}
                setOpenCard={setOpenCard}
                onCardSaved={handleCardSaved}
            />
        </div>
    );
}
