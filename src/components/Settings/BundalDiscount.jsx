import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";

const BundleDiscounts = () => {
    const [enabled, setEnabled] = useState(false);
    const { t, i18n } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border p-4 rounded-md shadow-sm">
                <h2 className="font-semibold">{t("enableBundleDiscounts")}</h2>
                <Switch
                    checked={enabled}
                    onChange={setEnabled}
                    className={`${enabled ? "bg-teal-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                    <span className="sr-only">{t("enable")}</span>
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled
                            ? "translate-x-6 rtl:-translate-x-6"
                            : "translate-x-1 rtl:-translate-x-1"
                            }`}
                    />
                </Switch>
            </div>

            <span className="text-gray-600 text-sm ml-4 block">
                {t("bundleDiscountNote")}{" "}
                <a
                    href="#"
                    className="text-teal-600 underline text-sm"
                >
                    {t("helpCentre")}
                </a>
            </span>

            {enabled && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[2, 3, 5].map((itemCount) => (
                        <div
                            key={itemCount}
                            className="border rounded-xl shadow-md p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-200"
                        >
                            <h4 className="text-lg font-semibold mb-2">
                                {t("itemCount", { count: itemCount })}
                            </h4>
                            <select className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <option value="">{t("selectDiscount")}</option>
                                <option value="5">5%</option>
                                <option value="10">10%</option>
                                <option value="15">15%</option>
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BundleDiscounts;
