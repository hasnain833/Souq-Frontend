import React, { useState, useEffect } from 'react';
import { Plus, X, Truck, MapPin, Clock, Star, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';
import ShippingService from '../../api/ShippingService';
import LocalDeliverySettings from '../Delivery/LocalDeliverySettings';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DeliverySettingsSkeleton from '../Skeleton/DeliverySettingsSkeleton';
import { useTranslation } from 'react-i18next';

const DeliverySettings = () => {
  const [activeTab, setActiveTab] = useState('providers');
  const [providers, setProviders] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    shippingProvider: '',
    serviceCode: '',
    serviceName: '',
    isDefault: false,
    preferences: {
      autoSelectCheapest: false,
      autoSelectFastest: false,
      includeInsurance: false,
      requireSignature: false,
      allowCashOnDelivery: false
    },
    settings: {
      pickup: {
        enabled: false,
        timeSlots: []
      },
      dropoff: {
        enabled: false,
        locations: []
      },
      localDelivery: {
        enabled: false,
        radius: 10,
        fee: 0
      }
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading delivery settings data...');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('Has Token:', !!localStorage.getItem('accessToken'));

      const [providersResponse, optionsResponse] = await Promise.all([
        ShippingService.getProviders(),
        ShippingService.getDeliveryOptions()
      ]);

      console.log('📦 Providers Response:', providersResponse);
      console.log('⚙️ Options Response:', optionsResponse);

      if (providersResponse.success) {
        setProviders(providersResponse.data.providers);
        console.log(`✅ Loaded ${providersResponse.data.providers.length} providers`);
      } else {
        console.error('❌ Providers response not successful:', providersResponse);
      }

      if (optionsResponse.success) {
        setDeliveryOptions(optionsResponse.data.deliveryOptions);
        console.log(`✅ Loaded ${optionsResponse.data.deliveryOptions.length} delivery options`);
      } else {
        console.error('❌ Options response not successful:', optionsResponse);
      }
    } catch (error) {
      console.error('❌ Failed to load delivery data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });
      toast.error('Failed to load delivery settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingOption(null);
    setFormData({
      shippingProvider: '',
      serviceCode: '',
      serviceName: '',
      isDefault: deliveryOptions.length === 0,
      preferences: {
        autoSelectCheapest: false,
        autoSelectFastest: false,
        includeInsurance: false,
        requireSignature: false,
        allowCashOnDelivery: false
      },
      settings: {
        pickup: {
          enabled: false,
          timeSlots: []
        },
        dropoff: {
          enabled: false,
          locations: []
        },
        localDelivery: {
          enabled: false,
          radius: 10,
          fee: 0
        }
      }
    });
    setShowModal(true);
  };

  const handleEdit = (option) => {
    setEditingOption(option);
    setFormData({
      shippingProvider: option.shippingProvider._id,
      serviceCode: option.serviceCode,
      serviceName: option.serviceName,
      isDefault: option.isDefault,
      preferences: option.preferences || {
        autoSelectCheapest: false,
        autoSelectFastest: false,
        includeInsurance: false,
        requireSignature: false,
        allowCashOnDelivery: false
      },
      settings: option.settings || {
        pickup: {
          enabled: false,
          timeSlots: []
        },
        dropoff: {
          enabled: false,
          locations: []
        },
        localDelivery: {
          enabled: false,
          radius: 10,
          fee: 0
        }
      }
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!formData.shippingProvider || !formData.serviceCode) {
        toast.error('Please select a shipping provider and service');
        return;
      }

      const response = await ShippingService.saveDeliveryOption(
        formData,
        editingOption?._id
      );

      if (response.success) {
        toast.success(editingOption ? 'Delivery option updated' : 'Delivery option added');
        setShowModal(false);
        await loadData();
      }
    } catch (error) {
      console.error('Save delivery option error:', error);
      toast.error(error.error || 'Failed to save delivery option');
    } finally {
      setSaving(false);
    }
  };

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const handleDelete = async (optionId) => {
    if (!window.confirm('Are you sure you want to delete this delivery option?')) {
      return;
    }

    try {
      const response = await ShippingService.deleteDeliveryOption(optionId);
      if (response.success) {
        toast.success('Delivery option deleted');
        await loadData();
      }
    } catch (error) {
      console.error('Delete delivery option error:', error);
      toast.error(error.error || 'Failed to delete delivery option');
    }
  };

  const handleSetDefault = async (optionId) => {
    try {
      const response = await ShippingService.setDefaultDeliveryOption(optionId);
      if (response.success) {
        toast.success('Default delivery option updated');
        await loadData();
      }
    } catch (error) {
      console.error('Set default delivery option error:', error);
      toast.error(error.error || 'Failed to set default delivery option');
    }
  };

  const getSelectedProvider = () => {
    return providers.find(p => p._id === formData.shippingProvider);
  };

  const getAvailableServices = () => {
    const provider = getSelectedProvider();
    return provider?.supportedServices || [];
  };

  if (loading) {
    return (
      <DeliverySettingsSkeleton />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold">{t("delivery_settings")}</h2>
          <p className="text-gray-600 text-sm">{t("manage_delivery")}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
            {[
              { id: 'providers', label: t("shipping_providers"), icon: Truck },
              { id: 'local', label: t("local_delivery"), icon: MapPin }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            {/* Add Button */}
            <div className="flex justify-end">
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("add_delivery_option")}
              </button>
            </div>

            {/* Delivery Options List */}
            <div className="space-y-4">
              {deliveryOptions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{t("no_delivery_options")}</p>
                  <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    {t("add_first_delivery_option")}
                  </button>
                </div>
              ) : (
                deliveryOptions.map((option) => (
                  <div
                    key={option._id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{option.shippingProvider.displayName}</h3>
                          {option.isDefault && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                              <Star className="w-3 h-3 fill-current" />
                              {t("default")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{option.serviceName}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {option.preferences?.includeInsurance && (
                            <span className="flex items-center gap-1">
                              <span>🛡️</span> {t("insurance")}
                            </span>
                          )}
                          {option.preferences?.requireSignature && (
                            <span className="flex items-center gap-1">
                              <span>✍️</span> {t("signature_required")}
                            </span>
                          )}
                          {option.preferences?.allowCashOnDelivery && (
                            <span className="flex items-center gap-1">
                              <span>💰</span> {t("cash_on_delivery")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!option.isDefault && (
                          <button
                            onClick={() => handleSetDefault(option._id)}
                            className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                            title="Set as default"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(option)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit option"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAddressId(option._id);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Available Providers Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3">{t("available_shipping_providers")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {providers.map((provider) => (
                  <div key={provider._id} className="bg-white rounded-md p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-teal-600" />
                      <span className="font-medium text-sm">{provider.displayName}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>{provider.supportedServices?.length || 0} {t("services_available")}</p>
                      <p>{t("base_fee")}: {ShippingService.formatCurrency(provider.pricing?.baseFee || 0, provider.pricing?.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      {/* Local Delivery Tab */}
      {activeTab === 'local' && (
        <LocalDeliverySettings />
      )}
      {/* Modal for Add/Edit Delivery Option */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingOption ? t('edit_delivery_option') : t('add_delivery_option')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("shipping_provider")} *</label>
                <select
                  value={formData.shippingProvider}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    shippingProvider: e.target.value,
                    serviceCode: '',
                    serviceName: ''
                  }))}
                  className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                >
                  <option value="">{t("select_provider")}</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Selection */}
              {formData.shippingProvider && (
                <div>
                  <label className="block text-sm font-medium mb-1">{t("service")} *</label>
                  <select
                    value={formData.serviceCode}
                    onChange={(e) => {
                      const service = getAvailableServices().find(s => s.serviceCode === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        serviceCode: e.target.value,
                        serviceName: service?.serviceName || ''
                      }));
                    }}
                    className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                  >
                    <option value="">{t("select_service")}</option>
                    {getAvailableServices().map((service) => (
                      <option key={service.serviceCode} value={service.serviceCode}>
                        {service.serviceName} ({service.estimatedDays?.min}-{service.estimatedDays?.max} days)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preferences */}
              <div>
                <label className="block text-sm font-medium mb-2">{t("preferences")}</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.includeInsurance}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, includeInsurance: e.target.checked }
                      }))}
                      className="mr-2 accent-teal-600 w-5 h-5 rtl:ml-2"
                    />
                    <span className="text-sm">{t("include_insurance")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.requireSignature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, requireSignature: e.target.checked }
                      }))}
                      className="mr-2 accent-teal-600 w-5 h-5 rtl:ml-2"
                    />
                    <span className="text-sm">{t("require_signature")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.allowCashOnDelivery}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, allowCashOnDelivery: e.target.checked }
                      }))}
                      className="mr-2 accent-teal-600 w-5 h-5 rtl:ml-2"
                    />
                    <span className="text-sm">{t("allow_cod")}</span>
                  </label>
                </div>
              </div>

              {/* Set as Default */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="mr-2 accent-teal-600 w-5 h-5 rtl:ml-2"
                />
                <span className="text-sm">{t("set_default")}</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                disabled={saving || !formData.shippingProvider || !formData.serviceCode}
              >
                {saving ? t('saving') : t('save_option')}
              </button>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          handleDelete(selectedAddressId);
          setDeleteModalOpen(false);
        }}
        itemType={t("shipping_address")}
      />
    </>

  );
};

export default DeliverySettings;
