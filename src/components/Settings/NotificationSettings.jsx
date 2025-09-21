// import React, { useState } from "react";
// import { Switch } from "@headlessui/react";
// import { useTranslation } from "react-i18next";

// const NotificationSettings = () => {
//     const [emailEnabled, setEmailEnabled] = useState(true);
//     const { t } = useTranslation();

//     const notifications = {
//         news: [t("vintedUpdates"), t("marketingCommunications")],
//         high: [t("newMessages"), t("newFeedback"), t("discountedItems")],
//         other: [t("favoritedItems"), t("newFollowers"), t("newItems")],
//     };

//     return (
//         <div className="space-y-6">
//             <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold">{t("enableEmailNotifications")}</h2>
//                 <Switch
//                     checked={emailEnabled}
//                     onChange={setEmailEnabled}
//                     className={`${emailEnabled ? "bg-teal-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
//                 >
//                     <span className="sr-only">{t("enable")}</span>
//                     <span
//                         className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${emailEnabled ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"}`}
//                     />
//                 </Switch>
//             </div>

//             {emailEnabled && (
//                 <div className="space-y-4">
//                     <Section title={t("news")} items={notifications.news} />
//                     <Section title={t("highPriority")} items={notifications.high} />
//                     <Section title={t("otherNotifications")} items={notifications.other} />

//                     <div className="border p-2 rounded-md shadow-sm flex justify-between items-center">
//                         <span className="ml-1">{t("dailyLimit")}</span>
//                         <select className="border p-2 rounded-md max-w-xs text-sm text-gray-700">
//                             <option>{t("limit2")}</option>
//                             <option>{t("limit5")}</option>
//                             <option>{t("noLimit")}</option>
//                         </select>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// const Section = ({ title, items }) => (
//     <div>
//         <h3 className="text-lg font-medium mb-3">{title}</h3>
//         <div className="grid gap-2 md:grid-cols-1">
//             {items.map((label, index) => (
//                 <SettingToggle key={index} label={label} />
//             ))}
//         </div>
//     </div>
// );

// const SettingToggle = ({ label }) => {
//     const [enabled, setEnabled] = useState(true);
//     return (
//         <div className="flex justify-between items-center border p-3 rounded-md bg-white shadow-sm">
//             <span>{label}</span>
//             <Switch
//                 checked={enabled}
//                 onChange={setEnabled}
//                 className={`${enabled ? "bg-teal-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
//             >
//                 <span className="sr-only">Toggle</span>
//                 <span
//                     className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"}`}
//                 />
//             </Switch>
//         </div>
//     );
// };

// export default NotificationSettings;


import React, { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { toast } from 'react-toastify';
import { NotificationService } from '../../api/NotificationService';
import NotificationSettingsSkeleton from "../Skeleton/NotificationSettingsSkeleton";
import { useTranslation } from "react-i18next";

const NotificationSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { t } = useTranslation();

    // Load notification settings on component mount
    useEffect(() => {
        loadNotificationSettings();
    }, []);

    const loadNotificationSettings = async () => {
        try {
            setLoading(true);
            const response = await NotificationService.getNotificationSettings();
            setSettings(response.data.settings);
        } catch (error) {
            console.error('Error loading notification settings:', error);
            toast.error('Failed to load notification settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            setSaving(true);
            await NotificationService.updateNotificationSettings(newSettings);
            setSettings(newSettings);
            toast.success('Notification settings updated successfully');
        } catch (error) {
            console.error('Error updating notification settings:', error);
            toast.error('Failed to update notification settings');
        } finally {
            setSaving(false);
        }
    };

    const handleEmailEnabledChange = (enabled) => {
        const newSettings = { ...settings, emailEnabled: enabled };
        updateSettings(newSettings);
    };

    const handleHighPriorityChange = (key, enabled) => {
        const newSettings = {
            ...settings,
            highPriority: {
                ...(settings.highPriority || {}),
                [key]: enabled
            }
        };
        updateSettings(newSettings);
    };

    const handleOtherChange = (key, enabled) => {
        const newSettings = {
            ...settings,
            other: {
                ...(settings.other || {}),
                [key]: enabled
            }
        };
        updateSettings(newSettings);
    };

    const handleOrdersChange = (key, enabled) => {
        const newSettings = {
            ...settings,
            orders: {
                ...(settings.orders || {}),
                [key]: enabled
            }
        };
        updateSettings(newSettings);
    };

    const handleOffersChange = (key, enabled) => {
        const newSettings = {
            ...settings,
            offers: {
                ...(settings.offers || {}),
                [key]: enabled
            }
        };
        updateSettings(newSettings);
    };

    const handleSocialChange = (key, enabled) => {
        const newSettings = {
            ...settings,
            social: {
                ...(settings.social || {}),
                [key]: enabled
            }
        };
        updateSettings(newSettings);
    };

    const handleDeliveryPreferenceChange = (key, enabled) => {
        const newSettings = {
            ...settings,
            deliveryPreferences: {
                ...(settings.deliveryPreferences || {}),
                [key]: enabled
            }
        };
        updateSettings(newSettings);
    };

    const handleQuietHoursChange = (key, value) => {
        const newSettings = {
            ...settings,
            quietHours: {
                ...(settings.quietHours || {}),
                [key]: value
            }
        };
        updateSettings(newSettings);
    };

    const handleDailyLimitChange = (limit) => {
        const newSettings = { ...settings, dailyLimit: parseInt(limit) };
        updateSettings(newSettings);
    };

    if (loading) {
        return (
            <NotificationSettingsSkeleton />
        );
    }

    if (!settings) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Failed to load notification settings</p>
                <button
                    onClick={loadNotificationSettings}
                    className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                    Retry
                </button>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold">{t("enableEmailNotifications")}</h2>
                <Switch
                    checked={settings.emailEnabled}
                    onChange={handleEmailEnabledChange}
                    disabled={saving}
                    className={`${settings.emailEnabled ? "bg-teal-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="sr-only">{t("enable")}</span>
                    <span
                        className={`${settings.emailEnabled ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                </Switch>
            </div>

            {settings.emailEnabled && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium mb-3">{t("highPriority")}</h3>
                        <div className="grid gap-2 md:grid-cols-1">
                            <SettingToggle
                                label={t("newMessages")}
                                enabled={settings.highPriority?.newMessages || false}
                                onChange={(enabled) => handleHighPriorityChange('newMessages', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("newFeedback")}
                                enabled={settings.highPriority?.newFeedback || false}
                                onChange={(enabled) => handleHighPriorityChange('newFeedback', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("discountedItems")}
                                enabled={settings.highPriority?.discountedItems || false}
                                onChange={(enabled) => handleHighPriorityChange('discountedItems', enabled)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-3">{t("otherNotifications")}</h3>
                        <div className="grid gap-2 md:grid-cols-1">
                            <SettingToggle
                                label={t("favoritedItems")}
                                enabled={settings.other?.favoritedItems || false}
                                onChange={(enabled) => handleOtherChange('favoritedItems', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("newFollowers")}
                                enabled={settings.other?.newFollowers || false}
                                onChange={(enabled) => handleOtherChange('newFollowers', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("newItems")}
                                enabled={settings.other?.newProducts || false}
                                onChange={(enabled) => handleOtherChange('newProducts', enabled)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Orders Notifications */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">{t("order_notifications")}</h3>
                        <div className="grid gap-2 md:grid-cols-1">
                            <SettingToggle
                                label={t("order_confirmed")}
                                enabled={settings.orders?.orderConfirmed || false}
                                onChange={(enabled) => handleOrdersChange('orderConfirmed', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("order_shipped")}
                                enabled={settings.orders?.orderShipped || false}
                                onChange={(enabled) => handleOrdersChange('orderShipped', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("order_delivered")}
                                enabled={settings.orders?.orderDelivered || false}
                                onChange={(enabled) => handleOrdersChange('orderDelivered', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("payment_received")}
                                enabled={settings.orders?.paymentReceived || false}
                                onChange={(enabled) => handleOrdersChange('paymentReceived', enabled)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Offers Notifications */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">{t("offer_notifications")}</h3>
                        <div className="grid gap-2 md:grid-cols-1">
                            <SettingToggle
                                label={t("offer_received")}
                                enabled={settings.offers?.offerReceived || false}
                                onChange={(enabled) => handleOffersChange('offerReceived', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("offer_accepted")}
                                enabled={settings.offers?.offerAccepted || false}
                                onChange={(enabled) => handleOffersChange('offerAccepted', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("offer_declined")}
                                enabled={settings.offers?.offerDeclined || false}
                                onChange={(enabled) => handleOffersChange('offerDeclined', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("offer_expired")}
                                enabled={settings.offers?.offerExpired || false}
                                onChange={(enabled) => handleOffersChange('offerExpired', enabled)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Social Notifications */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">{t("social_notifications")}</h3>
                        <div className="grid gap-2 md:grid-cols-1">
                            <SettingToggle
                                label={t("newFollowers")}
                                enabled={settings.social?.newFollower || false}
                                onChange={(enabled) => handleSocialChange('newFollower', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("product_liked")}
                                enabled={settings.social?.productLiked || false}
                                onChange={(enabled) => handleSocialChange('productLiked', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("new_rating")}
                                enabled={settings.social?.newRating || false}
                                onChange={(enabled) => handleSocialChange('newRating', enabled)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Delivery Preferences */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">{t("delivery_preferences")}</h3>
                        <div className="grid gap-2 md:grid-cols-1">
                            <SettingToggle
                                label={t("in_app_notifications")}
                                enabled={settings.deliveryPreferences?.inApp || false}
                                onChange={(enabled) => handleDeliveryPreferenceChange('inApp', enabled)}
                                disabled={saving}
                            />
                            <SettingToggle
                                label={t("email_notifications")}
                                enabled={settings.deliveryPreferences?.email || false}
                                onChange={(enabled) => handleDeliveryPreferenceChange('email', enabled)}
                                disabled={saving}
                            />
                            {/* <SettingToggle
                                label={t("push_notifications")}
                                enabled={settings.deliveryPreferences?.push || false}
                                onChange={(enabled) => handleDeliveryPreferenceChange('push', enabled)}
                                disabled={saving}
                            /> */}
                        </div>
                    </div>

                    {/* Quiet Hours */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">{t("quiet_hours")}</h3>
                        <div className="space-y-4">
                            <SettingToggle
                                label={t("enable_quiet_hours")}
                                enabled={settings.quietHours?.enabled || false}
                                onChange={(enabled) => handleQuietHoursChange('enabled', enabled)}
                                disabled={saving}
                            />
                            {settings.quietHours?.enabled && (
                                <div className="grid grid-cols-2 gap-4 pl-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("start_time")}
                                        </label>
                                        <input
                                            type="time"
                                            value={settings.quietHours?.startTime || '22:00'}
                                            onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                                            disabled={saving}
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("end_time")}
                                        </label>
                                        <input
                                            type="time"
                                            value={settings.quietHours?.endTime || '08:00'}
                                            onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                                            disabled={saving}
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border p-2 rounded-md shadow-sm flex justify-between items-center">
                        <span className="ml-1">
                            {t("dailyLimit")}
                        </span>
                        <select
                            className="border p-2 rounded-md max-w-xs text-sm text-gray-700"
                            value={settings.dailyLimit}
                            onChange={(e) => handleDailyLimitChange(e.target.value)}
                            disabled={saving}
                        >
                            <option value={2}>{t("limit2")}</option>
                            <option value={5}>{t("limit5")}</option>
                            <option value={-1}>{t("noLimit")}</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingToggle = ({ label, enabled, onChange, disabled = false }) => {
    return (
        <div className="flex justify-between items-center border p-3 rounded-md bg-white shadow-sm">
            <span className={disabled ? 'text-gray-500' : ''}>{label}</span>
            <Switch
                checked={enabled}
                onChange={onChange}
                disabled={disabled}
                className={`${enabled ? "bg-teal-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className="sr-only">Toggle</span>
                <span
                    className={`${enabled ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
            </Switch>
        </div>
    );
};
export default NotificationSettings;
