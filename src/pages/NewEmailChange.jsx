import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { emailChange } from '../api/AuthService';
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function NewEmailChange() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [newEmail, setNewEmail] = useState("");
    const [currentEmail, setCurrentEmail] = useState("");

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm();

    useEffect(() => {
        if (location?.state?.email) {
            setCurrentEmail(location.state.email);
            setNewEmail(location.state.email); // pre-fill
        }
    }, [location]);

    const onSubmit = async () => {
        try {
            if (!newEmail || !currentEmail) {
                toast.error(t("email_required"));
                return;
            }

            const payload = {
                currentEmail,
                newEmail,
            };

            const response = await emailChange(payload);

            if (response?.success) {
                toast.success(t("verification_code_sent"));
                navigate("/email-verify", {
                    state: { email: newEmail, emailNewChange: true },
                });
            } else {
                toast.error(response?.message || t("email_change_failed"));
            }
        } catch (error) {
            console.error("Email change failed:", error);
            toast.error(
                error?.response?.data?.message || t("something_went_wrong")
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full mx-auto">
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    {t("change_email")}
                </h1>

                <p className="text-center mb-6 text-gray-700">
                    {t("current_email")}:{" "}
                    <span className="font-medium">{currentEmail}</span>
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input
                        type="email"
                        placeholder={t("enter_new_email")}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md text-lg focus:outline-none border-gray-300"
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold disabled:opacity-60"
                    >
                        {isSubmitting ? t("sending") : t("send_verification_code")}
                    </button>
                </form>
            </div>
        </div>
    );
}
