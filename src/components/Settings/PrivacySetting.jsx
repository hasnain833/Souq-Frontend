import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import { FaChevronRight } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const PrivacySettings = () => {
    const { t } = useTranslation();
    const [toggles, setToggles] = useState({});

    const privacyOptions = [
        {
            key: "featureInMarketing",
            label: t("featureInMarketing"),
            desc: t("featureInMarketingDesc"),
        },
        {
            key: "notifyFavorites",
            label: t("notifyFavorites"),
        },
        {
            key: "allowTracking",
            label: t("allowTracking"),
        },
        {
            key: "personalizedFeed",
            label: t("personalizedFeed"),
        },
        {
            key: "showRecentlyViewed",
            label: t("showRecentlyViewed"),
            desc: t("showRecentlyViewedDesc"),
        },
    ];

    const toggleSwitch = (key) => {
        setToggles({ ...toggles, [key]: !toggles[key] });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t("privacySettings")}</h2>

            {privacyOptions.map(({ key, label, desc }) => (
                <div key={key} className="border p-4 rounded-md shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <p className="font-medium">{label}</p>
                            {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
                        </div>
                        <Switch
                            checked={!!toggles[key]}
                            onChange={() => toggleSwitch(key)}
                            className={`${toggles[key] ? "bg-teal-600" : "bg-gray-300"
                                } relative inline-flex h-6 w-11 items-center rounded-full mt-1`}
                        >
                            <span className="sr-only">{t("toggle")}</span>
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${toggles[key]
                                        ? "translate-x-6 rtl:-translate-x-6"
                                        : "translate-x-1 rtl:-translate-x-1"
                                    }`}
                            />
                        </Switch>
                    </div>
                </div>
            ))}

            <div className="border p-4 rounded-md shadow-sm cursor-pointer">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{t("downloadData")}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {t("downloadDataDesc")}
                        </p>
                    </div>
                    <FaChevronRight className="text-gray-500 text-lg rtl:rotate-180" />
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
