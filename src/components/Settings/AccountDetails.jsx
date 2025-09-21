import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Switch } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { deleteUserProfile, logout, updateProfile } from '../../api/AuthService';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AccountDetailsSkeleton from '../Skeleton/AccountDetailsSkeleton';
import { clearTokens } from '../../utils/TokenStorage';
import { persistor } from '../../redux/store';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const AccountSettings = ({ profileData, apiRefresh, seApiRefresh }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission
    const { t } = useTranslation()

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            email: '',
            fullName: '',
            gender: '',
            birthday: null,
            vacationMode: false
        }
    });

    useEffect(() => {
        if (profileData) {
            console.log(profileData, "profileData")
            reset({
                email: profileData.email || '',
                fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
                gender: profileData.gender || '',
                birthday: profileData.dateOfBirth
                    ? dayjs(profileData.dateOfBirth, 'DD/MM/YYYY')
                    : null,
                vacationMode: profileData.vacationMode || false
            });
        }
    }, [profileData, reset]);

    const handleDelete = async () => {
        if (isConfirmed) {
            try {
                const res = await deleteUserProfile();
                if (res.success) {
                    await logout();
                    clearTokens();
                    await persistor.purge();
                    navigate("/");
                    window.location.reload();
                } else {
                    toast.error(res.message || 'Failed to delete account.');
                }
            } catch (err) {
                alert(err.message || 'Something went wrong.');
            }
        }
    };

    const onSubmit = async (data) => {
        // Set submitting state to true when starting submission
        setIsSubmitting(true);
        try {
            const updatedProfile = {
                fullName: data.fullName,
                gender: data.gender || '',
                vacationMode: data.vacationMode || false
            };

            // Only include dateOfBirth if data.birthday has a value
            if (data.birthday) {
                updatedProfile.dateOfBirth = dayjs(data.birthday).format('DD/MM/YYYY');
            }

            const response = await updateProfile(updatedProfile);

            if (response.success) {
                toast.success(response.data.message);
                seApiRefresh(!apiRefresh);
            } else {
                // Optionally handle error case here
            }
        } catch (error) {
            console.error(error);
            alert('Error updating profile.');
        } finally {
            // Set submitting state back to false after submission completes
            setIsSubmitting(false);
        }
    };

    if (!profileData) {
        return <AccountDetailsSkeleton />;
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="container space-y-6 mx-auto">
                {/* Email */}
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-md font-medium text-gray-800">{profileData.email}</p>
                        <button
                            type="button"
                            className="text-sm px-4 py-1 border border-teal-600 text-teal-700 font-semibold rounded hover:bg-gray-100"
                            onClick={() =>
                                navigate("/email-change", { state: { email: profileData.email } })
                            }
                        >
                            {t("change")}
                        </button>
                    </div>
                    <span className={`text-sm font-medium ${profileData.email ? "text-green-600" : "text-red-500"}`}>
                        {profileData.email ? t("verified") : t("not_verified")}
                    </span>
                </div>

                {/* Phone */}
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <p className="text-md font-medium text-gray-800">
                            {t("phone_number")}: {profileData.phone || t("not_added")}
                        </p>
                        <button
                            type="button"
                            className="text-sm px-4 py-1 border border-teal-600 text-teal-700 font-semibold rounded hover:bg-gray-100 w-max"
                            onClick={() => navigate("/send-phone-otp", {
                                state: {
                                    phonenumberchange: true,
                                },
                            })}
                        >
                            {profileData.phone ? t("verified") : t("verify")}
                        </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">{t("phone_usage_note")}</p>
                </div>

                {/* Personal Info */}
                <div className="bg-white rounded-xl shadow p-4 space-y-6">
                    <h3 className="text-md font-semibold text-gray-800">{t("personal_info")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("full_name")}</label>
                            <input
                                type="text"
                                {...register("fullName", { required: t("full_name_required") })}
                                className="mt-1 border px-3 py-3 rounded w-full focus:outline-none hover:border-teal-500 focus:border-teal-500"
                            />
                            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">{t("gender")}</label>
                            <select
                                {...register("gender", { required: t("gender_required") })}
                                className="mt-1 border px-3 py-3 rounded w-full focus:outline-none hover:border-teal-500 focus:border-teal-500"
                            >
                                <option value="">{t("select_gender")}</option>
                                <option value="male">{t("male")}</option>
                                <option value="female">{t("female")}</option>
                                <option value="other">{t("other")}</option>
                            </select>
                            {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">{t("birthday")}</label>
                            <Controller
                                name="birthday"
                                control={control}
                                render={({ field }) => (
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            value={field.value}
                                            onChange={(date) => field.onChange(date)}
                                            openTo="day"
                                            views={["year", "month", "day"]}
                                            format="DD/MM/YYYY"
                                            disableFuture
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    variant: "standard",
                                                    InputProps: {
                                                        disableUnderline: true,
                                                        className:
                                                            "px-3 py-2 rounded w-full border focus:outline-none focus:border-teal-500 hover:border-teal-500",
                                                    },
                                                    className: "mt-1",
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-xl shadow p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-md font-medium text-gray-800">{t("facebook")}</p>
                        <button
                            type="button"
                            className="text-sm px-4 py-1 border border-teal-600 text-teal-700 font-semibold rounded hover:bg-gray-100"
                            onClick={() => {
                                if (!profileData.loginWithFacebook) {
                                    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/user/auth/facebook`;
                                }
                            }}
                        >
                            {profileData.loginWithFacebook ? t("linked") : t("link")}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-md font-medium text-gray-800">{t("google")}</p>
                        <button
                            type="button"
                            className="text-sm px-4 py-1 border border-gray-400 text-gray-700 font-semibold rounded bg-gray-100"
                            onClick={() => {
                                if (!profileData.loginWithGoogle) {
                                    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/user/auth/google`;
                                }
                            }}
                        >
                            {profileData.loginWithGoogle ? t("linked") : t("link")}
                        </button>
                    </div>
                </div>

                {/* Change Password */}
                <div
                    className="bg-white rounded-xl shadow p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => navigate("/reset-password", { state: { reset: true } })}
                >
                    <p className="text-md font-medium text-gray-800">{t("change_password")}</p>
                    <button
                        type="button"
                        className="text-sm px-4 py-1 border border-teal-600 text-teal-700 font-semibold rounded hover:bg-gray-100"
                    >
                        {t("change")}
                    </button>
                </div>

                {/* Delete Account */}
                <div
                    className="bg-white rounded-xl shadow p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                >
                    <p className="text-md font-medium text-gray-800">{t("delete_account")}</p>
                    <button type="button" className="text-xl text-gray-500">›</button>
                </div>

                {/* Submit Button - Moved to the right side */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center text-white ${isSubmitting
                            ? 'bg-teal-600 cursor-not-allowed opacity-50'
                            : 'bg-teal-600 hover:bg-teal-700'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 mr-1" />
                                {t("saving")}
                            </>
                        ) : (
                            t("save")
                        )}
                    </button>
                </div>
            </form>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">{t("deleteMyAccount")}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <label className="block text-sm font-medium mb-1">{t("helpUsImprove")}</label>
                        <textarea
                            className="w-full border rounded-md p-2 mb-4 h-28 resize-none focus:outline-none hover:border-teal-500 focus:border-teal-500"
                            rows="3"
                            placeholder={t("reasonForClosing")}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />

                        <label className="flex items-center text-gray-600 mb-4">
                            <input
                                type="checkbox"
                                className="mr-2 w-5 h-5 accent-teal-600 rtl:ml-2"
                                checked={isConfirmed}
                                onChange={() => setIsConfirmed(!isConfirmed)}
                            />
                            {t("confirmOrdersCompleted")}
                        </label>

                        <p className="text-xs text-gray-600 mb-4">
                            {t("deleteAccountNotice")} <a href="#" className="text-teal-600 underline">Privacy Policy</a>.
                        </p>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-600 hover:text-black"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!isConfirmed || reason.trim() === ""}
                                className={`px-4 py-2 rounded text-white transition-colors ${isConfirmed && reason.trim() !== ""
                                    ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                                    : "bg-red-300 cursor-not-allowed"
                                    }`}
                            >
                                {t("deleteMyAccount")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>

    );
};

export default AccountSettings;