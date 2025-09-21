import React from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { sendPhoneOtp } from "../api/AuthService";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useTranslation } from "react-i18next";


const SendPhoneOTP = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const user = location?.state?.user;
    const phoneNumberChange = location?.state?.phonenumberchange;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            phone: "",
        },
    });

    const { t, i18n } = useTranslation();

    const validatePhoneNumber = (value) => {
        if (!value) return "Phone number is required";
        const regex = /^\+?[1-9]\d{9,14}$/;
        if (!regex.test(`+${value}`)) return "Invalid phone number format";
        return true;
    };

    const onSubmit = async ({ phone }) => {
        const validation = validatePhoneNumber(phone);
        if (validation !== true) {
            setError("phone", {
                type: "manual",
                message: validation,
            });
            return;
        }

        try {
            const response = await sendPhoneOtp({ phone });
            if (response.success) {
                navigate("/phone-verify", { state: { phone, user: user, phonenumberchange: phoneNumberChange, } });
            } else {
                setError("phone", {
                    type: "manual",
                    message: response.error || "Failed to send OTP",
                });
            }
        } catch (error) {
            setError("phone", {
                type: "manual",
                message: "Something went wrong. Please try again.",
            });
            console.error("Error sending OTP:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full mx-auto">
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    {t("enter_phone_number")}
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <PhoneInput
                        country={'in'}
                        value={watch("phone")}
                        onChange={(value) => {
                            setValue("phone", value);
                            const validation = validatePhoneNumber(value);
                            if (validation !== true) {
                                setError("phone", {
                                    type: "manual",
                                    message: validation,
                                });
                            } else {
                                clearErrors("phone");
                            }
                        }}
                        containerClass={`w-full ${i18n.language === 'ar' ? 'rtl' : ''}`}
                        inputClass={`!w-full text-lg py-3 px-6 rounded-md border ${errors.phone ? 'phone-input-border' : 'border-gray-300'} ${i18n.language === 'ar' ? 'text-right pr-14' : 'text-left pl-14'
                            }`}
                        buttonClass={`${i18n.language === 'ar' ? 'right-0 left-auto' : ''}`}
                        inputStyle={{
                            width: "100%",
                            direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                            textAlign: i18n.language === 'ar' ? 'right' : 'left',
                        }}
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.phone.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isSubmitting && (
                            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                        )}
                        {t("send_otp")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SendPhoneOTP;
