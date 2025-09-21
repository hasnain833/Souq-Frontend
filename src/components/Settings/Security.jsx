import React from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Security = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  return (
    <div>
      <h2 className="text-xl font-semibold">{t("heading")}</h2>
      <span className="text-sm text-gray-500">{t("subheading")}</span>

      <div
        className="border p-4 rounded-md shadow-sm cursor-pointer mb-3 mt-3"
        onClick={() => navigate("/email-change", { state: { email } })}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{t("emailTitle")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("emailDesc")}</p>
          </div>
          <FaChevronRight className="text-gray-500 text-lg rtl:rotate-180" />
        </div>
      </div>

      <div
        className="border p-4 rounded-md shadow-sm cursor-pointer mb-3"
        onClick={() => navigate("/reset-password")}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{t("passwordTitle")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("passwordDesc")}</p>
          </div>
          <FaChevronRight className="text-gray-500 text-lg rtl:rotate-180" />
        </div>
      </div>

      <div
        className="border p-4 rounded-md shadow-sm cursor-pointer mb-3"
        onClick={() => navigate("/send-phone-otp")}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{t("verificationTitle")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("verificationDesc")}</p>
          </div>
          <FaChevronRight className="text-gray-500 text-lg rtl:rotate-180" />
        </div>
      </div>

      <div
        className="border p-4 rounded-md shadow-sm cursor-pointer mb-3"
        onClick={() => navigate("/login-activity")}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{t("loginTitle")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("loginDesc")}</p>
          </div>
          <FaChevronRight className="text-gray-500 text-lg rtl:rotate-180" />
        </div>
      </div>
    </div>
  );
};

export default Security;
