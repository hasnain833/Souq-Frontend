import { Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateProfile, uploadProfile } from '../../api/AuthService';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { setProfileImage } from '../../redux/slices/ProfileSlice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CountrySelector from '../Location/CountrySelector';
import CitySelector from '../Location/CitySelector';
import { getCountryByCode, getCityById, getCitiesByCountry, searchCities } from '../../api/LocationService';
import ProfileSkeleton from '../Skeleton/ProfileSkeleton';
// import LoadingSpinner from '../common/LoadingSpinner';

const ProfileDetails = ({ profileData, apiRefresh, seApiRefresh }) => {
    const { register, handleSubmit, setValue, watch, reset } = useForm();
    const [showCity, setShowCity] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    // const [profileData, setProfileData] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    // const baseURL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    const dispatch = useDispatch()
    const { t } = useTranslation()

    const [isUsernameDisabled, setIsUsernameDisabled] = useState(false);
    const [usernameChangeRemainingDays, setUsernameChangeRemainingDays] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission

    useEffect(() => {
        if (profileData) {
            console.log('Profile data received:', profileData);
            reset({
                username: profileData.userName || '',
                about: profileData.about || '',
                country: profileData.country,
                city: profileData.city || '',
                language: profileData.language
            });

            setShowCity(profileData.cityShow);

            if (profileData.profile) {
                // setSelectedImage(`${baseURL}${profileData.profile}`);
                setSelectedImage(profileData.profile);
            }

            // Check if username can be updated
            if (profileData.userNameUpdatedAt) {
                const lastUpdated = new Date(profileData.userNameUpdatedAt);
                const now = new Date();
                const daysPassed = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
                const remaining = 30 - daysPassed;

                setIsUsernameDisabled(remaining > 0);
                setUsernameChangeRemainingDays(remaining);
            }
            loadLocationData();
        }
    }, [profileData, reset]);

    const loadLocationData = async () => {
        try {
            console.log('Loading location data for:', {
                country: profileData.country,
                city: profileData.city,
                cityId: profileData.cityId
            });

            let loadedCountry = null;

            // Load country if country code exists
            if (profileData.country) {
                console.log('Loading country by code:', profileData.country);
                const countryResponse = await getCountryByCode(profileData.country);
                if (countryResponse.success) {
                    loadedCountry = countryResponse.data.country;
                    setSelectedCountry(loadedCountry);
                    console.log('Country loaded:', loadedCountry);
                }
            }

            // Load city - try by ID first, then by name
            if (profileData.cityId) {
                console.log('Loading city by ID:', profileData.cityId);
                // If we have a city ID, load by ID
                const cityResponse = await getCityById(profileData.cityId);
                if (cityResponse.success) {
                    setSelectedCity(cityResponse.data.city);
                    console.log('City loaded by ID:', cityResponse.data.city);
                }
            } else if (profileData.city && loadedCountry) {
                console.log('Searching for city by name:', profileData.city, 'in country:', loadedCountry.name);
                // If we only have city name, search for it within the country
                try {
                    const citiesResponse = await getCitiesByCountry(loadedCountry._id);
                    if (citiesResponse.success) {
                        console.log('Available cities:', citiesResponse.data.cities.map(c => c.name));
                        const matchingCity = citiesResponse.data.cities.find(
                            city => city.name.toLowerCase() === profileData.city.toLowerCase()
                        );
                        if (matchingCity) {
                            setSelectedCity(matchingCity);
                            console.log('City found by name:', matchingCity);
                        } else {
                            console.log('No matching city found for:', profileData.city);
                        }
                    }
                } catch (searchError) {
                    console.log('Could not find city by name:', profileData.city, searchError);
                }
            }
        } catch (error) {
            console.error('Error loading location data:', error);
        }
    };

    // const mapCountryCodeToName = (code) => {
    //     const map = {
    //         IN: 'India',
    //         US: 'United States',
    //         UK: 'United Kingdom',
    //         AE: 'UAE',
    //     };
    //     return map[code] || '';
    // };

    // const mapLanguageCodeToName = (code) => {
    //     const map = {
    //         en: 'English',
    //         ar: 'Arabic',
    //     };
    //     return map[code] || '';
    // };

    const onSubmit = async (formData) => {
        // Set submitting state to true when starting submission
        setIsSubmitting(true);
        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        const formattedBirthday = dayjs(profileData.dateOfBirth).format('DD/MM/YYYY');

        const updatedProfile = {
            fullName: fullName,
            about: formData.about,
            city: selectedCity?.name || (formData.city?.trim() || undefined),
            cityId: selectedCity?._id || undefined,
            country: selectedCountry?.code || (formData.country?.trim() || undefined),
            countryId: selectedCountry?._id,
            language: formData.language,
            cityShow: showCity,
            userName: formData.username,
            dateOfBirth: profileData.dateOfBirth
        };
        try {
            const response = await updateProfile(updatedProfile);
            toast.success(response.data.message)
            seApiRefresh(!apiRefresh)
        } catch (error) {
            toast.error("User profile not update")
        } finally {
            // Set submitting state back to false after submission completes
            setIsSubmitting(false);
        }
    }

    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setSelectedImage(previewUrl);
        setIsUploading(true);  // <-- Start spinner

        const formData = new FormData();
        formData.append('profile', file);

        try {
            const response = await uploadProfile(formData);
            const imageUrl = response.data.data.profile;
            dispatch(setProfileImage(imageUrl));
            seApiRefresh(!apiRefresh);
            toast.success(response?.data?.message);
        } catch (error) {
            console.error('Error uploading profile:', error);
        } finally {
            setIsUploading(false);  // <-- Stop spinner
        }
    };

    if (!profileData) {
        return <ProfileSkeleton />;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Info Card */}
            <div className="bg-white shadow rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 gap-4">
                    <label className="text-sm font-medium text-gray-700">{t("your_photo")}</label>
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12">
                            {selectedImage ? (
                                <>
                                    <img
                                        src={selectedImage}
                                        alt="Preview"
                                        className={`w-12 h-12 rounded-full object-cover border border-gray-200 transition duration-300 ${isUploading ? 'blur-sm' : ''}`}
                                    />
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center rounded-full">
                                            <svg
                                                className="animate-spin h-5 w-5 text-teal-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                ></path>
                                            </svg>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-12 h-12 bg-teal-600 text-white flex items-center justify-center rounded-full text-lg font-bold">
                                    {profileData?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>

                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                id="photo-upload"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                            <label
                                htmlFor="photo-upload"
                                className="px-4 cursor-pointer hover:bg-gray-100 text-teal-700 py-1 rounded-md font-semibold border border-teal-600"
                            >
                                {t("choose_photo")}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border-t p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">{t("username")}</label>
                        {isUsernameDisabled ? (
                            <p className="text-xs text-teal-700 mt-1">
                                {t("username_change", { days: usernameChangeRemainingDays })}
                            </p>
                        ) : <p className="text-xs text-teal-700 mt-1">
                            {t("username_change_note")}
                        </p>}
                    </div>
                    <input
                        type="text"
                        placeholder={t("enter_username")}
                        disabled={isUsernameDisabled}
                        className={`border border-gray-300 rounded p-3 w-full md:w-1/3 focus:outline-none ${isUsernameDisabled
                            ? 'bg-gray-100 cursor-not-allowed'
                            : 'hover:border-teal-500 focus:border-teal-500'
                            }`}
                        {...register('username')}
                    />
                </div>

                <div className="border-t p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <label className="text-sm font-medium text-gray-700">{t("about_you")}</label>
                    <textarea
                        className="border border-gray-300 rounded p-3 w-full md:w-2/3 h-28 resize-none focus:outline-none hover:border-teal-500 focus:border-teal-500"
                        placeholder={t("about_you_placeholder")}
                        {...register('about')}
                    />
                </div>
            </div>

            {/* Country & City */}
            <div className="bg-white shadow rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 gap-4">
                    <label className="text-sm font-medium text-gray-700">{t("country")}</label>
                    <div className="w-full md:w-1/3">
                        <CountrySelector
                            selectedCountry={selectedCountry}
                            onCountrySelect={(country) => {
                                setSelectedCountry(country);
                                setSelectedCity(null); // Clear city when country changes
                                setValue('country', country?.code || '');
                            }}
                            placeholder="Select Country"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="border-t flex flex-col md:flex-row md:justify-between md:items-center p-4 gap-4">
                    <label className="text-sm font-medium text-gray-700">{t("town_city")}</label>
                    <div className="w-full md:w-1/3">
                        <CitySelector
                            selectedCountry={selectedCountry}
                            selectedCity={selectedCity}
                            onCitySelect={(city) => {
                                setSelectedCity(city);
                                setValue('city', city?.name || '');
                            }}
                            placeholder="Select City"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="border-t flex flex-col md:flex-row md:justify-between md:items-center p-4 gap-4">
                    <label className="text-sm font-medium text-gray-700">{t("show_city_in_profile")}</label>
                    <Switch
                        checked={showCity}
                        onChange={() => setShowCity(!showCity)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#0D9488' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0D9488' },
                        }}
                    />
                </div>
            </div>

            {/* Language */}
            <div className="bg-white shadow rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 gap-4">
                    <label className="text-sm font-medium text-gray-700">{t("language")}</label>
                    <select
                        className="border border-gray-300 rounded p-3 w-full md:w-1/3 appearance-none focus:outline-none hover:border-teal-500 focus:border-teal-500"
                        {...register('language')}
                    >
                        <option value="en">{t("english")}</option>
                        <option value="ar">{t("arabic")}</option>

                        {/* <option value="hi">{t("hindi")}</option>
                        <option value="fr">{t("french")}</option>
                        <option value="de">{t("german")}</option> */}
                    </select>
                </div>
            </div>

            {/* Update Button with Loading Spinner */}
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
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t("updating")}
                        </>
                    ) : (
                        t("update_profile")
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProfileDetails;