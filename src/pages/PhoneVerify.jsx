import React from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyPhoneOtp } from "../api/AuthService";
import { useTranslation } from "react-i18next";
import { saveUser } from "../utils/TokenStorage";

const PhoneVeriy = () => {
  const location = useLocation();
  const phone = location?.state?.phone || ""; // Ensure phone is passed via router state
  const phoneNumberChange = location?.state?.phonenumberchange;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
  });

  const code = watch("code");
  const { t } = useTranslation();
  const user = location?.state?.user;
  console.log(user, "user");

  // Limit input to 6 digits
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setValue("code", value);
  };

  const onSubmit = async (data) => {
    try {
      const response = await verifyPhoneOtp({ otp: data.code });

      if (response.success) {
        navigate("/");
        if (!phoneNumberChange) {
          saveUser(user);
        }
      } else {
        // Show error under the input
        setError("code", {
          type: "manual",
          message: response.error || "Invalid OTP. Try again.",
        });
      }
    } catch (err) {
      setError("code", {
        type: "manual",
        message: "Something went wrong. Please try again.",
      });
      console.error("OTP Verification Error:", err);
    }
  };

  const handleResend = () => {
    console.log("Resending OTP...");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {t("phoneVerifyTitle")}
        </h1>
        <p className="text-center mb-6 text-gray-700">
          {t("phoneVerifyInstruction")}
          <br />
          <span className="font-medium">+{phone}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder={t("codePlaceholder")}
            {...register("code", {
              required: t("code_required"),
              minLength: { value: 6, message: t("code_6_digits") },
              maxLength: { value: 6, message: t("code_6_digits") },
              pattern: { value: /^\d+$/, message: t("only_numbers") },
            })}
            value={code || ""}
            onChange={handleCodeChange}
            className={`w-full px-4 py-2 border rounded-md text-lg focus:outline-none ${
              errors.code ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !code || code.length !== 6}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {isSubmitting && (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            )}
            {t("verify")}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSubmitting}
            className="w-full hover:bg-gray-100 text-teal-700 py-2 rounded-md font-semibold border border-teal-600">
            {t("resend")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneVeriy;
