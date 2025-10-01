// pages/FollowersPage.jsx
import React, { useEffect, useState } from "react";
import FollowerCard from "../components/followers/FollowersCard";
import { FaClock, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { getProfileById } from "../api/AuthService";
import { getFollowers } from "../api/ProductService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDistanceToNowStrict } from "date-fns";
import { useTranslation } from "react-i18next";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ConnectionCardSkeleton from "../components/Skeleton/ConnectionCardSkeleton";
import { Helmet } from "react-helmet";
// import AuthModal from "../components/Auth/AuthModal";
import LoginModal from "../components/Auth/LoginModal";
import ForgotPasswordModal from "../components/Auth/ForgotPasswordModal";
import SignUpModal from "../components/Auth/SignUpModal";

const Followers = () => {
    const { id } = useParams();
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null);
    const [followersData, setFollowersData] = useState([]);
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const normalizedURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const authUser = JSON.parse(localStorage.getItem("user"));
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const limit = 20; // or 8, based on your grid size

    useEffect(() => {
        getProfileById(id)
            .then((res) => {
                setProfile(res?.data?.data);
            })
            .catch((err) => {
                console.error("Failed to fetch profile", err);
            })
            .finally(() => {

            });
    }, [id]);

    useEffect(() => {
        setLoading(true);
        getFollowers(id, { page, limit })
            .then((res) => {
                const { followers, totalPages } = res?.data?.data || {};
                setFollowersData(followers || []);
                setTotalPages(totalPages || 0);
            })
            .catch((err) => {
                console.error("Failed to fetch followers", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, page]);


    if (!profile) {
        return <ConnectionCardSkeleton />;
    }

    const userNavigate = () => {
        if (authUser?.id === profile?.id) {
            navigate("/member-profile")
        } else {
            navigate(`/profile/${profile?.id}`)
        }
    }

    return (
        <>
            <div className="bg-white min-h-[600px] p-6 flex flex-col">
                <Helmet>
                    <title>Followers - Habibi ماركت</title>
                    <meta
                        name="description"
                        content="Welcome to My Website. We provide the best services for your needs."
                    />
                </Helmet>
                <div className="container mx-auto flex flex-col flex-grow">
                    <div className="flex items-center gap-4 border-b pb-4 mb-6">
                        <img
                            // src={profile?.profile ? `${normalizedURL}${profile?.profile}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            src={profile?.profile ? profile?.profile : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            alt="danilelapink"
                            className="w-16 h-16 rounded-full object-cover border border-gray-100 cursor-pointer"
                            onClick={userNavigate}
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{profile?.firstName} {profile?.lastName}</span>
                            {profile?.ratings?.totalRatings > 0 ? (
                                <div className="flex items-center text-yellow-500 text-sm mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`text-lg ${i < Math.floor(profile.ratings.averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                                        />
                                    ))}
                                    <span className="text-gray-600 text-xs ml-1 rtl:mr-1">
                                        {profile.ratings.totalRatings}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500 mb-1">{t("no-reviews-yet")}</div>
                            )}
                            <div className="text-sm text-gray-500 mt-1 space-y-1 rtl:space-y-reverse">
                                {profile?.country && <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-sm" />{profile?.cityShow && `${profile.city}, `}{profile?.country}</div>}
                                <div className="flex items-center gap-2"><FaClock className="text-sm" />{profile?.lastLoginAt ? formatDistanceToNowStrict(new Date(profile?.lastLoginAt), { addSuffix: true }) : "1 Hour ago"}</div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {profile?.firstName} {profile?.lastName} {t("followers")}
                    </h2>

                    {loading ? (
                        <LoadingSpinner fullScreen={false} />
                    ) : followersData.length === 0 ? (
                        <div className="flex justify-center items-center h-60 w-full">
                            <p className="text-center text-gray-500">
                                {profile?.firstName} {profile?.lastName} doesn’t have any followers yet
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {followersData.map((person, index) => (
                                <FollowerCard key={index} person={person} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination always at bottom */}
                {totalPages > 1 && (
                    <div className="container mx-auto mt-6">
                        <div className="flex justify-end">
                            <Stack spacing={2}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(e, value) => setPage(value)}
                                    color="gray"
                                    variant="outlined"
                                    shape="rounded"
                                    size="medium"
                                />
                            </Stack>
                        </div>
                    </div>
                )}
            </div>
            {/* <AuthModal /> */}
            <LoginModal />
            <ForgotPasswordModal />
            <SignUpModal />
        </>

    )
}

export default Followers;