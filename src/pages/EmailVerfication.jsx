import React from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/AuthService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

export default function EmailVerification() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        setValue,
        setError,
        watch,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            code: ""
        }
    });

    const navigate = useNavigate();
    const location = useLocation();
    const email = location?.state?.email;
    const user = location?.state?.user;
    const emailChange = location?.state?.emailChange
    const emailNewChange = location?.state?.emailNewChange
    const code = watch("code");
    const { t, i18n } = useTranslation();

    // console.log(user, "user")

    const onSubmit = async (data) => {
        try {
            const response = await verifyEmail({
                otp: data.code,
            });
            if (response.success) {
                if (emailChange) {
                    navigate("/email-change-new", {
                        state: {
                            email: email,
                        }
                    });
                } else if (emailNewChange) {
                    navigate("/");
                    toast.success("Email change successfully")
                } else {
                    navigate("/send-phone-otp", {
                        state: {
                            user: user
                        }
                    });
                }
            } else {
                setError("code", {
                    type: "manual",
                    message: response.error || "Invalid verification code",
                });
            }
        } catch (err) {
            setError("code", {
                type: "manual",
                message: "Something went wrong. Please try again.",
            });
        }
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 6) {
            setValue("code", value, { shouldValidate: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <Helmet>
                <title>Email verify - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full mx-auto">
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    {t("email_verification")}
                </h1>

                <p className="text-center mb-6 text-gray-700">
                    {t("enter_verification_code")} <br />
                    <span className="font-medium">{email}</span>
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder={t("enter_code_placeholder")}
                        {...register("code", {
                            required: t("code_required"),
                            minLength: { value: 6, message: t("code_6_digits") },
                            maxLength: { value: 6, message: t("code_6_digits") },
                            pattern: { value: /^\d+$/, message: t("only_numbers") }
                        })}
                        value={code}
                        onChange={handleCodeChange}
                        className={`w-full px-4 py-2 border rounded-md text-lg focus:outline-none ${errors.code ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.code && (
                        <p className="text-red-500 text-sm">{errors.code.message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold disabled:opacity-60"
                    >
                        {isSubmitting ? t("verifying") : t("verify")}
                    </button>
                </form>
                {
                    !emailChange || !emailNewChange &&
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/email-not-receive", { state: { email } })}
                            className="w-full hover:bg-gray-100 text-teal-700 py-2 rounded-md font-semibold border border-teal-600"
                        >
                            {t("didnt_receive_email")}
                        </button>
                    </div>
                }

            </div>
        </div>
    );
}
