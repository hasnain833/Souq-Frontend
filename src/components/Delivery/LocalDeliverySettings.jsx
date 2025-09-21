import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, Clock, Edit3, Trash2, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import ShippingService from '../../api/ShippingService';
import DeleteConfirmationModal from '../Settings/DeleteConfirmationModal';
import LocalDeliverySkeleton from '../Skeleton/LocalDeliverySkeleton';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LocalDeliverySettings = () => {
  const [pickupLocations, setPickupLocations] = useState([]);
  const [dropoffLocations, setDropoffLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('pickup'); // 'pickup' or 'dropoff'
  const [editingLocation, setEditingLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United Arab Emirates'
    },
    coordinates: {
      latitude: null,
      longitude: null
    },
    operatingHours: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'saturday', startTime: '09:00', endTime: '15:00', isActive: true },
      { day: 'sunday', startTime: '', endTime: '', isActive: false }
    ],
    contactInfo: {
      phone: '',
      email: ''
    },
    isActive: true
  });

  useEffect(() => {
    console.log('🚀 LocalDeliverySettings component mounted, loading locations...');
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await ShippingService.getDeliveryOptions();

      if (response.success) {
        const options = response.data.deliveryOptions;

        // Extract pickup and dropoff locations from delivery options
        // Pickup: settings.pickup (single location with address, timeSlots)
        const pickup = options.filter(opt =>
          opt.shippingProvider.name === 'local_pickup' && opt.settings?.pickup?.enabled
        );

        // Dropoff: settings.dropoff.locations[] (array of locations)
        const dropoff = options.filter(opt =>
          opt.shippingProvider.name === 'local_dropoff' &&
          opt.settings?.dropoff?.enabled &&
          opt.settings?.dropoff?.locations?.length > 0
        );

        console.log('📍 Loaded locations:', { pickup: pickup.length, dropoff: dropoff.length });
        setPickupLocations(pickup);
        setDropoffLocations(dropoff);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast.error('Failed to load delivery locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = (type) => {
    setModalType(type);
    setEditingLocation(null);
    setFormData({
      name: '',
      address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United Arab Emirates'
      },
      coordinates: {
        latitude: null,
        longitude: null
      },
      operatingHours: [
        { day: 'monday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'thursday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'friday', startTime: '09:00', endTime: '17:00', isActive: true },
        { day: 'saturday', startTime: '09:00', endTime: '15:00', isActive: true },
        { day: 'sunday', startTime: '', endTime: '', isActive: false }
      ],
      contactInfo: {
        phone: '',
        email: ''
      },
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (location, type) => {
    console.log(location?.settings?.dropoff?.locations?.[0], "location.settings.dropoff")
    console.log(location.settings?.pickup, "location?.settings?.pickup")

    setModalType(type);
    setEditingLocation(location);

    // Extract location data based on type
    let locationData;
    if (type === 'pickup') {
      // For pickup: data is directly in settings.pickup
      locationData = location.settings?.pickup;
    } else {
      // For dropoff: data is in settings.dropoff.locations[0]
      locationData = location.settings?.dropoff?.locations?.[0];
    }

    console.log('📝 Editing location:', { type, locationData });

    if (locationData) {
      setFormData({
        name: locationData.name || '',
        address: locationData.address || {
          street1: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United Arab Emirates'
        },
        coordinates: locationData.coordinates || { latitude: null, longitude: null },
        operatingHours: type === 'pickup'
          ? (locationData.timeSlots || formData.operatingHours)
          : (locationData.operatingHours || formData.operatingHours),
        contactInfo: locationData.contactInfo || { phone: '', email: '' },
        isActive: locationData.isActive !== false
      });
    }

    setShowModal(true);
  };

  const key = editingLocation
    ? modalType === 'pickup'
      ? 'edit_pickup_location'
      : 'edit_dropoff_location'
    : modalType === 'pickup'
      ? 'add_pickup_location'
      : 'add_dropoff_location';

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!formData.name || !formData.address.street1 || !formData.address.city) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create delivery option data with correct structure for each type
      let deliveryOptionData;

      if (modalType === 'pickup') {
        // For pickup: data goes directly in settings.pickup
        deliveryOptionData = {
          shippingProvider: 'local_pickup',
          serviceCode: 'LOCAL_PICKUP',
          serviceName: 'Local Pickup',
          isDefault: false,
          settings: {
            pickup: {
              enabled: true,
              name: formData.name,
              address: formData.address,
              timeSlots: formData.operatingHours.map(hour => ({
                day: hour.day,
                startTime: hour.startTime,
                endTime: hour.endTime,
                isActive: hour.isActive
              })),
              instructions: formData.instructions || ''
            }
          }
        };
      } else {
        // For dropoff: data goes in settings.dropoff.locations[]
        deliveryOptionData = {
          shippingProvider: 'local_dropoff',
          serviceCode: 'LOCAL_DROPOFF',
          serviceName: 'Drop-off Point',
          isDefault: false,
          settings: {
            dropoff: {
              enabled: true,
              locations: [{
                name: formData.name,
                address: formData.address,
                coordinates: formData.coordinates,
                operatingHours: formData.operatingHours,
                contactInfo: formData.contactInfo,
                isActive: formData.isActive
              }]
            }
          }
        };
      }

      console.log('💾 Saving delivery option:', { modalType, editingLocation: !!editingLocation, data: deliveryOptionData });

      const response = await ShippingService.saveDeliveryOption(
        deliveryOptionData,
        editingLocation?._id
      );

      if (response.success) {
        toast.success(editingLocation ? 'Location updated' : 'Location added');
        setShowModal(false);
        await loadLocations();
      }
    } catch (error) {
      console.error('Save location error:', error);
      toast.error(error.error || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const handleDelete = async (locationId) => {
    // if (!window.confirm('Are you sure you want to delete this location?')) {
    //   return;
    // }

    try {
      const response = await ShippingService.deleteDeliveryOption(locationId);
      if (response.success) {
        toast.success('Location deleted');
        await loadLocations();
      }
    } catch (error) {
      console.error('Delete location error:', error);
      toast.error(error.error || 'Failed to delete location');
    }
  };

  const updateOperatingHours = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: prev.operatingHours.map((hour, index) =>
        index === dayIndex ? { ...hour, [field]: value } : hour
      )
    }));
  };

  const formatAddress = (address) => {
    console.log(address, "address12121")
    const parts = [
      address.street1,
      address.street2,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  if (loading) {
    return <LocalDeliverySkeleton />;
  }

  return (
    <>
      <div className="space-y-8 mt-4">
        {/* Pickup Locations */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">{t("pickup_locations")}</h3>
              <p className="text-sm text-gray-600">{t("pickup_description")}</p>
            </div>
            <button
              onClick={() => handleAddNew('pickup')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("add_pickup_location")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pickupLocations.length === 0 ? (
              <div className="col-span-full text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">{t("no_pickup_locations")}</p>
              </div>
            ) : (
              pickupLocations.map((location) => {
                // For pickup: data is directly in settings.pickup
                const locationData = location.settings?.pickup;
                console.log(locationData, "DropOff location data")
                return (
                  <div key={location._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{locationData?.name || 'Pickup Location'}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(location, 'pickup')}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit pickup location"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          // onClick={() => handleDelete(location._id)}
                          onClick={() => {
                            setSelectedAddressId(location._id);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete pickup location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatAddress(locationData?.address || {})}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {locationData?.timeSlots?.filter(slot => slot.isActive).length || 0} {t("active_time_slots")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drop-off Locations */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">{t("dropoff_locations")}</h3>
              <p className="text-sm text-gray-600">{t("dropoff_description")}</p>
            </div>
            <button
              onClick={() => handleAddNew('dropoff')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("add_dropoff_location")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dropoffLocations.length === 0 ? (
              <div className="col-span-full text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">{t("no_dropoff_locations")}</p>
              </div>
            ) : (
              dropoffLocations.map((location) => {
                const locationData = location.settings?.dropoff?.locations?.[0];

                return (
                  <div key={location._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{locationData?.name || 'Unnamed Location'}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(location, 'dropoff')}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAddressId(location._id);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatAddress(locationData?.address || {})}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{t("operating_hours_configured")}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {/* Modal for Add/Edit Location */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {t(key)}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("location_name")} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Office, Warehouse"
                  className="w-full border border-gray-300 rounded p-3 outline-none hover:border-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t("address_line1")} *</label>
                  <input
                    type="text"
                    value={formData.address.street1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street1: e.target.value }
                    }))}
                    placeholder="Street address"
                    className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t("address_line2")}</label>
                  <input
                    type="text"
                    value={formData.address.street2}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street2: e.target.value }
                    }))}
                    placeholder="Apartment, suite, etc."
                    className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("town_city")} *</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("zip_code")}</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="ZIP Code"
                    className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("phone_number")}</label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    placeholder="+971 50 123 4567"
                    className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("email")}</label>
                  <input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, email: e.target.value }
                    }))}
                    placeholder="contact@example.com"
                    className="w-full border border-gray-300 rounded p-2 outline-none hover:border-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <label className="block text-sm font-medium mb-2">{t("operating_hours")}</label>
                <div className="space-y-2">
                  {formData.operatingHours.map((hour, index) => (
                    <div key={hour.day} className="flex items-center gap-4">
                      <div className="w-20">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hour.isActive}
                            onChange={(e) => updateOperatingHours(index, 'isActive', e.target.checked)}
                            className="mr-2 accent-teal-600 rtl:ml-2"
                          />
                          <span className="text-sm">{getDayName(hour.day)}</span>
                        </label>
                      </div>
                      {hour.isActive && (
                        <>
                          <input
                            type="time"
                            value={hour.startTime}
                            onChange={(e) => updateOperatingHours(index, 'startTime', e.target.value)}
                            className="border border-gray-300 rounded p-1 text-sm rtl:mr-5"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <input
                            type="time"
                            value={hour.endTime}
                            onChange={(e) => updateOperatingHours(index, 'endTime', e.target.value)}
                            className="border border-gray-300 rounded p-1 text-sm"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                disabled={saving || !formData.name || !formData.address.street1}
              >
                {saving ? 'Saving...' : t("save_location")}
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
        itemType={t("local_delivery_address")}
      />
    </>

  );
};

export default LocalDeliverySettings;
