import axios from 'axios';
import { DropletsIcon, HomeIcon, InfoIcon, LocateIcon, X, Plus, Trash2, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { LuDroplet, LuPencil } from 'react-icons/lu';
import { FaMapLocationDot } from "react-icons/fa6";
import {
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    validateAddress,
    formatAddressDisplay,
    getAddressTypeDisplayName
} from '../../api/AddressService';
import CountrySelector from '../Location/CountrySelector';
import CitySelector from '../Location/CitySelector';
import { searchCountries, searchCities } from '../../api/LocationService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddressSkeleton from '../Skeleton/AddressSkeleton';
import { useTranslation } from 'react-i18next';

const Address = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        phoneNumber: "",
        addressType: "home"
    });
    const [errors, setErrors] = useState({});
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false)
    const { t } = useTranslation()
    // Load addresses on component mount
    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const response = await getUserAddresses();
            if (response.success) {
                setAddresses(response.data.addresses || []);
            }
        } catch (error) {
            console.error('Failed to load addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setFormData({
            fullName: "",
            street1: "",
            street2: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            phoneNumber: "",
            addressType: "home"
        });
        setSelectedCountry(null);
        setSelectedCity(null);
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = async (address) => {
        setEditingAddress(address);
        const addressData = {
            fullName: address.fullName || "",
            street1: address.street1 || "",
            street2: address.street2 || "",
            city: address.city || "",
            state: address.state || "",
            zipCode: address.zipCode || "",
            country: address.country || "",
            phoneNumber: address.phoneNumber || "",
            addressType: address.addressType || "home"
        };
        setFormData(addressData);

        // Reset selectors initially
        setSelectedCountry(null);
        setSelectedCity(null);

        setErrors({});
        setIsModalOpen(true);

        // Populate selectors with country and city objects after modal opens
        await populateSelectorsFromAddress(addressData);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validate form data
            const validation = validateAddress(formData);
            if (!validation.isValid) {
                setErrors(validation.errors);
                return;
            }

            let response;
            if (editingAddress) {
                // Update existing address
                response = await updateAddress(editingAddress._id, formData);
            } else {
                // Add new address
                const setAsDefault = addresses.length === 0; // First address becomes default
                response = await addAddress(formData, setAsDefault);
            }

            if (response.success) {
                await loadAddresses(); // Reload addresses
                setIsModalOpen(false);
                setEditingAddress(null);
            }
        } catch (error) {
            console.error('Failed to save address:', error);
            setErrors({ general: error.error || 'Failed to save address' });
        } finally {
            setSaving(false);
        }
    };

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const handleDelete = async (addressId) => {
        // if (!window.confirm('Are you sure you want to delete this address?')) {
        //     return;
        // }

        try {
            const response = await deleteAddress(addressId);
            if (response.success) {
                await loadAddresses(); // Reload addresses
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await setDefaultAddress(addressId);
            if (response.success) {
                await loadAddresses(); // Reload addresses
            }
        } catch (error) {
            console.error('Failed to set default address:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setSelectedCity(null); // Clear city when country changes
        setFormData(prev => ({
            ...prev,
            country: country ? country.name : '',
            city: '' // Clear city when country changes
        }));
        // Clear country and city errors
        if (errors.country) {
            setErrors(prev => ({ ...prev, country: '' }));
        }
        if (errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
    };

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setFormData(prev => ({
            ...prev,
            city: city ? city.name : '',
            state: city ? (city.state || '') : prev.state
        }));
        // Clear city error
        if (errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
    };

    // Function to populate selectors when editing existing address
    const populateSelectorsFromAddress = async (address) => {
        if (!address) return;

        console.log('🔍 Populating selectors from address:', address);

        // Find country by name
        if (address.country) {
            try {
                console.log('🔍 Searching for country:', address.country);
                const countryResponse = await searchCountries(address.country);
                if (countryResponse.success && countryResponse.data.countries?.length > 0) {
                    const foundCountry = countryResponse.data.countries.find(
                        c => c.name.toLowerCase() === address.country.toLowerCase()
                    );
                    if (foundCountry) {
                        console.log('✅ Found country:', foundCountry);
                        setSelectedCountry(foundCountry);

                        // Find city by name within the found country
                        if (address.city) {
                            try {
                                console.log('🔍 Searching for city:', address.city, 'in country:', foundCountry._id);
                                const cityResponse = await searchCities(address.city, foundCountry._id);
                                if (cityResponse.success && cityResponse.data.cities?.length > 0) {
                                    const foundCity = cityResponse.data.cities.find(
                                        c => c.name.toLowerCase() === address.city.toLowerCase()
                                    );
                                    if (foundCity) {
                                        console.log('✅ Found city:', foundCity);
                                        setSelectedCity(foundCity);
                                    } else {
                                        console.log('⚠️ City not found in API, keeping text value');
                                        setSelectedCity(null);
                                    }
                                }
                            } catch (error) {
                                console.error('❌ Error searching for city:', error);
                                setSelectedCity(null);
                            }
                        }
                    } else {
                        console.log('⚠️ Country not found in API, keeping text value');
                        setSelectedCountry(null);
                    }
                }
            } catch (error) {
                console.error('❌ Error searching for country:', error);
                setSelectedCountry(null);
            }
        }
    };

    if (loading) {
        return <AddressSkeleton />;
    }

    return (
        <>
            <div className="space-y-6">
                {/* Addresses Section */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">{t("your_address")}</h2>
                        {addresses.length < 4 && (
                            <button
                                onClick={handleAddNew}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {t("add_address")}
                            </button>
                        )}
                    </div>

                    {addresses.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">{t("no_addresses")}</p>
                            <button
                                onClick={handleAddNew}
                                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                            >
                                {t("add_first_address")}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-semibold text-lg">{address.fullName}</p>
                                                {address.isDefault && (
                                                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full font-medium">
                                                        ✓ {t("default")}
                                                    </span>
                                                )}
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    {getAddressTypeDisplayName(address.addressType)}
                                                </span>
                                            </div>
                                            <div className="text-gray-600 space-y-1">
                                                <p>{address.street1}</p>
                                                {address.street2 && <p>{address.street2}</p>}
                                                <p>{address.city}, {address.state} {address.zipCode}</p>
                                                <p>{address.country}</p>
                                                {address.phoneNumber && <p>Phone: {address.phoneNumber}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-4">
                                            <button
                                                onClick={() => handleEdit(address)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-50"
                                                title="Edit address"
                                            >
                                                <LuPencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAddressId(address._id);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-gray-50"
                                                title="Delete address"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                    {addresses.length >= 4 && (
                        <p className="text-sm text-gray-500 mt-4">
                            Maximum of 4 addresses allowed. Delete an address to add a new one.
                        </p>
                    )}
                </section>

                {/* Info Box */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-blue-800">
                                <strong>Disabling shipping options may reduce sales.</strong> If a member can only buy from you with a disabled option, we may still offer it.{' '}
                                <a href="#" className="text-blue-600 underline hover:no-underline">
                                    Learn more about disabled options.
                                </a>
                            </p>
                        </div>
                    </div>
                </div> */}


                {/* Shipping as a seller */}
                {/* <section>
                    <h2 className="text-2xl font-semibold mb-2">Shipping as a seller</h2>
                    <p className="text-gray-600 mb-6">
                        Choose which options you’d like to use for each shipping type.
                    </p>

                    <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-gray-50 opacity-60">
                            <div className="flex items-center gap-3 mb-2">
                                <HomeIcon className="w-5 h-5 text-gray-400" />
                                <h3 className="font-medium text-gray-500">From your address</h3>
                            </div>
                            <p className="text-sm text-gray-500 ml-8">
                                A courier collects the order from you.
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 -mt-2">
                            Currently, there are no options that ship from your address.
                        </p>

                        <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-2">
                                <FaMapLocationDot className="w-5 h-5 text-gray-700" />
                                <h3 className="font-medium text-gray-900">From a drop-off point</h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">
                                You take the order to a location like a locker or package shop.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
                    <p>
                        Some shipping options are enabled for all sellers on our platform and
                        can’t be turned off.
                    </p>
                    <p>
                        <a
                            href="#"
                            className="text-teal-600 underline mt-1 inline-block"
                        >
                            See compensation information {" "}
                        </a>
                        {"  "}  for sellers using integrated shipping.
                    </p>

                </div> */}

            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingAddress ? t('edit_address') : t('add_address')}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {errors.general}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1">{t("full_name")} *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    placeholder="Full Name"
                                    className={`w-full border rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Street Address 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("address_line1")} *</label>
                                    <input
                                        type="text"
                                        value={formData.street1}
                                        onChange={(e) => handleInputChange('street1', e.target.value)}
                                        placeholder="Street address, P.O. box, company name"
                                        className={`w-full border rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500 ${errors.street1 ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.street1 && (
                                        <p className="text-red-500 text-xs mt-1">{errors.street1}</p>
                                    )}
                                </div>

                                {/* Street Address 2 */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("address_line2")} 2</label>
                                    <input
                                        type="text"
                                        value={formData.street2}
                                        onChange={(e) => handleInputChange('street2', e.target.value)}
                                        placeholder="Apartment, suite, unit, building, floor, etc."
                                        className="w-full border border-gray-300 rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>
                            {/* Country */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("country")} *</label>
                                    <CountrySelector
                                        selectedCountry={selectedCountry}
                                        onCountrySelect={handleCountrySelect}
                                        placeholder="Select Country"
                                        required={true}
                                        error={errors.country}
                                        className="w-full"
                                    />
                                    {errors.country && (
                                        <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("city")} *</label>
                                    <CitySelector
                                        selectedCountry={selectedCountry}
                                        selectedCity={selectedCity}
                                        onCitySelect={handleCitySelect}
                                        placeholder="Select City"
                                        required={true}
                                        error={errors.city}
                                        className="w-full"
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                                    )}
                                </div>
                            </div>

                            {/* City */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* State */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("state_province")}</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        placeholder="State or Province"
                                        className="w-full border border-gray-300 rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                {/* ZIP Code */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("zip_code")} *</label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                        placeholder="ZIP or Postal Code"
                                        className={`w-full border rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.zipCode && (
                                        <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("phone_number")}</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        placeholder="Phone number for delivery"
                                        className="w-full border border-gray-300 rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                {/* Address Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t("address_type")}</label>
                                    <select
                                        value={formData.addressType}
                                        onChange={(e) => handleInputChange('addressType', e.target.value)}
                                        className="w-full border border-gray-300 rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                disabled={saving}
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                                disabled={saving}
                            >
                                {saving ? t('saving') : t('save_address')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    handleDelete(selectedAddressId); // your actual delete function
                    setDeleteModalOpen(false);
                }}
                itemType={t("address")}
            />
        </>

    )
}

export default Address