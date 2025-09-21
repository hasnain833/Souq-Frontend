import React, { useEffect, useMemo, useState } from "react";
import ProfileDetails from "./ProfileDetails";
import AccountSettings from "./AccountDetails";
import Address from "./Address";
import { getProfile } from "../../api/AuthService";
import PaymentOptions from "./PaymentOptions";
import BundleDiscounts from "./BundalDiscount";
import NotificationSettings from "./NotificationSettings";
import PrivacySettings from "./PrivacySetting";
import Security from "./Security";
import { useTranslation } from "react-i18next";
import DeliverySettings from "./DeliverySettings";
import { useNavigate, useParams } from "react-router-dom";

const SettingsTabs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tab } = useParams();

  const tabs = useMemo(() => [
    { key: "profile_details", component: ProfileDetails },
    { key: "account_settings", component: AccountSettings },
    { key: "shipping", component: Address },
    { key: "delivery", component: DeliverySettings },
    { key: "payments", component: PaymentOptions },
    { key: "notifications", component: NotificationSettings },
    { key: "privacy_settings", component: PrivacySettings },
    { key: "security", component: Security },
  ], []);

  const selectedTab = tab && tabs.some((t) => t.key === tab) ? tab : "profile_details";
  const [profileData, setProfileData] = useState("");
  const [apiRefresh, seApiRefresh] = useState("");

  useEffect(() => {
    getProfile().then((res) => {
      if (res?.success) {
        setProfileData(res?.data?.data);
      }
    });
  }, [apiRefresh]);

  useEffect(() => {
    if (!tab) {
      navigate("/settings/profile_details", { replace: true });
    }
  }, [tab, navigate]);

  const activeTab = tabs.find((t) => t.key === tab);

  const renderTabContent = () => {
    if (!activeTab) return <div className="p-4">Select a tab</div>;

    const TabComponent = activeTab.component;
    const needsProfile = ["profile_details", "account_settings"].includes(tab);

    return needsProfile ? (
      <TabComponent
        profileData={profileData}
        apiRefresh={apiRefresh}
        seApiRefresh={seApiRefresh}
      />
    ) : (
      <TabComponent />
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Tabs sidebar */}
      <div className="w-full md:w-1/4 ltr:border-r rtl:border-l p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-4">{t("settings")}</h2>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(`/settings/${tab.key}`)}
            className={`w-full text-left rtl:text-right px-4 py-2 rounded-md transition-all duration-200 ${selectedTab === tab.key
              ? "bg-gray-100 font-semibold text-black"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            {t(tab.key)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-4">{renderTabContent()}</div>
    </div>
  );
};

export default SettingsTabs;
