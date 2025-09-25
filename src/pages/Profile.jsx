import { useEffect, useRef, useState } from "react";
import ProductGrid from "../components/Products/ProductGrid";
// import ReviewSection from "../components/Profile/ReviewSection";
import {
    FaBoxOpen,
    FaMapMarkerAlt,
    FaClock,
    FaUserCheck,
    FaUserFriends,
    FaStar
} from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi"; // horizontal three-dot icon
// import AuthModal from "../components/Auth/AuthModal";
import { useAppContext } from "../context/AppContext";
import LoginModal from "../components/Auth/LoginModal";
import ForgotPasswordModal from "../components/Auth/ForgotPasswordModal";
import SignUpModal from "../components/Auth/SignUpModal";
import { getProfileById } from "../api/AuthService";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/common/Animations";
import { CheckCircle2 } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';
import { follow, getUserProduct, getUserProductBuyerProduct, unFollow } from "../api/ProductService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useTranslation } from "react-i18next";
import MemberProfileSkeleton from "../components/Skeleton/MemberProfileSkeleton";
// import RateProductModal from "../components/Profile/RateProductModal";
import { blockUser, reportUser } from "../api/ChatService";
import { X, User, Shield, Flag, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Helmet } from "react-helmet";

export default function UserProfile() {
    const navigate = useNavigate()
    const { id, tab } = useParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const menuRef = useRef();

    // Get rating data from profile
    const rating = profile?.ratings?.averageRating || 0;
    const totalRatings = profile?.ratings?.totalRatings || 0;
    const {
        setIsAuthModalOpen,
        setAuthMode,
    } = useAppContext();

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const normalizedURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const [apiRefresh, setApiRefresh] = useState("");
    const [profileApiRefresh, setProfileApiRefresh] = useState("");
    const [following, setFollowing] = useState(profile?.isFollowingUser || false);
    const authUser = JSON.parse(localStorage.getItem("user"));
    const { t } = useTranslation();
    const tabs = ["listings", "reviews"];
    const currentTab = tabs.includes(tab) ? tab : "listings";
    const [activeTab, setActiveTab] = useState(currentTab);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);

    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');

    const reportReasons = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'inappropriate_content', label: 'Inappropriate Content' },
        { value: 'fake_profile', label: 'Fake Profile' },
        { value: 'scam_fraud', label: 'Scam/Fraud' },
        { value: 'hate_speech', label: 'Hate Speech' },
        { value: 'violence_threats', label: 'Violence/Threats' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        if (tab && tabs.includes(tab)) {
            setActiveTab(tab);
        }
    }, [tab]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        console.log('🔍 Profile.jsx - Loading profile for ID:', id);
        console.log('🔍 Profile.jsx - ID type:', typeof id);
        console.log('🔍 Profile.jsx - ID length:', id?.length);

        setLoadingProfile(true);
        getProfileById(id)
            .then((res) => {
                console.log('✅ Profile.jsx - Profile loaded successfully:', res);
                setProfile(res?.data?.data);
                setFollowing(res?.data?.data.isFollowingUser);
            })
            .catch((err) => {
                console.error("❌ Profile.jsx - Failed to fetch profile:", err);
                console.error("❌ Profile.jsx - Error details:", {
                    status: err.response?.status,
                    message: err.response?.data?.message,
                    url: err.config?.url
                });
            })
            .finally(() => {
                setLoadingProfile(false);
            });
    }, [id, profileApiRefresh]);


    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/profile/${id}/${tab}`);
    };

    useEffect(() => {
        if (profile?.id) {
            setLoadingProducts(true);
            getUserProduct(profile.id, { page: 1, limit: 10 })
                .then((res) => {
                    const items = res?.data?.data?.items || [];
                    setProducts(items);
                    setPage(1);
                    setTotalPages(res?.data?.data?.totalPages || 0);
                })
                .catch((err) => {
                    console.log("Fetch error:", err);
                })
                .finally(() => {
                    setLoadingProducts(false);
                });
        }
    }, [profile?.id, apiRefresh]);


    const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                !isLoadingMore &&
                !isFetchingRef.current && // ✅ extra safety
                page < 3 &&
                page < totalPages
            ) {
                handleLoadMore();
            }

            if (page >= 3) {
                setShowLoadMoreButton(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoadingMore, page, totalPages]);

    const isFetchingRef = useRef(false); // ✅ add ref

    const handleLoadMore = () => {
        if (isFetchingRef.current) return; // already fetching → stop
        if (page >= totalPages) return; // no more pages

        const nextPage = page + 1;
        isFetchingRef.current = true;
        setIsLoadingMore(true);

        getUserProduct(profile.id, { page: nextPage, limit: 10 })
            .then((res) => {
                const newItems = res?.data?.data?.items || [];

                // ✅ duplicate avoid: ensure unique product IDs
                setProducts((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const filteredNew = newItems.filter((p) => !existingIds.has(p.id));
                    return [...prev, ...filteredNew];
                });

                setPage(nextPage);
            })
            .catch((err) => {
                console.error("Load more error:", err);
            })
            .finally(() => {
                setIsLoadingMore(false);
                isFetchingRef.current = false; // release lock
            });
    };

    const handleLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    // Single loader condition: show if either profile OR products loading
    // const isLoading = loadingProfile || loadingProducts || !profile;

    if (!profile) {
        return <MemberProfileSkeleton />;
    }


    const handleFollow = async () => {
        if (!authUser) {
            setAuthMode('login');
            setIsAuthModalOpen(true);
            return;
        }
        try {
            if (following) {
                await unFollow(profile.id).then((res) => {
                    if (res?.data?.success) {
                        setProfileApiRefresh(!profileApiRefresh)
                    }
                });
            } else {
                await follow(profile.id).then((res) => {
                    if (res?.data?.success) {
                        setProfileApiRefresh(!profileApiRefresh)
                    }
                })
            }
        } catch (error) {
            console.error('Error following/unfollowing:', error);
        }
    };

    const handleRateSeller = () => {
        if (!authUser) {
            setAuthMode('login');
            setIsAuthModalOpen(true);
            return;
        }
        setShowRateModal(true);
    };

    const handleRatingSubmitted = (ratingData) => {
        console.log('✅ Rating submitted for seller:', ratingData);
        // Optionally refresh the profile data to show updated ratings
        setProfileApiRefresh(!profileApiRefresh);
    };

    const resetReportForm = () => {
        setReportReason('');
        setReportDescription('');
    };

    const handleBlockUser = async () => {
        try {
            setLoading(true);
            await blockUser(profile.id, 'other', 'Blocked from chat');
            toast.success('User blocked successfully');
        } catch (error) {
            console.error('Error blocking user:', error);
            toast.error('Failed to block user');
        } finally {
            setLoading(false);
            setShowBlockConfirm(false);
        }
    };

    const handleReportUser = async () => {
        if (!reportReason || !reportDescription.trim()) {
            toast.error('Please select a reason and provide a description');
            return;
        }

        try {
            setLoading(true);
            await reportUser(profile.id, reportReason, reportDescription);
            toast.success('User reported successfully');
            resetReportForm();
            setShowReportModal(false);
        } catch (error) {
            console.error('Error reporting user:', error);
            toast.error('Failed to report user');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container mx-auto p-4">
            <Helmet>
                <title>Member profile - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex flex-col items-center md:flex-row md:items-start">
                    <img
                        // src={profile?.profile ? `${normalizedURL}${profile?.profile}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        src={profile?.profile ? profile?.profile : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="Profile"
                        className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-md "
                    />
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                        <h2 className="text-2xl font-semibold text-gray-800">{profile?.firstName} {profile?.lastName}</h2>
                        <div className="relative flex items-center gap-2">
                            <button
                                className="text-sm px-3 py-1.5 sm:px-5 sm:py-2 sm:text-base bg-teal-600 text-white rounded-md"
                                onClick={handleFollow}
                            >
                                {following ? t("following") : t("follow")}
                            </button>
                            <button
                                className="text-sm px-3 py-1.5 sm:px-5 sm:py-2 sm:text-base bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
                                onClick={handleRateSeller}
                            >
                                <FaStar className="w-4 h-4" />
                                {t("rate-seller")}
                            </button>
                            <div className="relative" ref={menuRef}>
                                <button
                                    className="text-gray-600 hover:text-black p-2 "
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <FiMoreHorizontal size={20} />
                                </button>
                                {menuOpen && (
                                    <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                                        <button
                                            className="w-full text-left rtl:text-right px-4 py-2 text-gray-500 hover:bg-gray-100 border-b border-gray-200"
                                            onClick={() => {
                                                if (authUser) {
                                                    setShowReportModal(true);
                                                } else {
                                                    handleLogin();
                                                }
                                            }}
                                        >
                                            {t("report")}
                                        </button>
                                        <button
                                            className="w-full text-left rtl:text-right px-4 py-2 text-gray-500 hover:bg-gray-100"
                                            onClick={() => {
                                                if (authUser) {
                                                    setShowBlockConfirm(true);
                                                } else {
                                                    handleLogin();
                                                }
                                            }}

                                        >
                                            {t("block")}
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center text-yellow-500 text-2xl">
                        {totalRatings > 0 ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={`text-xl ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                                    />
                                ))}
                                <span className="text-gray-700 text-lg ml-2 rtl:mr-2">
                                    {rating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? t("review") : t("reviews")})
                                </span>
                            </>
                        ) : (
                            <span className="text-gray-500 text-lg">{t("no-reviews-yet")}</span>
                        )}
                    </div>


                    {/* Location, Last seen, Followers */}
                    <div className="flex items-start gap-12 flex-wrap text-md text-gray-600">
                        <div className="space-y-3">
                            <span className="text-sm font-semibold text-gray-700">{t("about")}:</span>
                            {profile?.country &&
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-xl" />
                                    <span>{profile?.cityShow && `${profile.city}, `}{profile?.country}</span>
                                </div>}
                            <div className="flex items-center gap-2">
                                <FaClock className="text-xl" />
                                <span>{t("last_seen")} {"  "}{profile?.lastLoginAt ? formatDistanceToNowStrict(new Date(profile?.lastLoginAt), { addSuffix: true }) : "1 Hours ago"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaUserFriends className="text-xl" />
                                <span>
                                    <span className="font-semibold text-teal-600 underline cursor-pointer" onClick={() => navigate(`/followers/${profile.id}`)}>
                                        {profile?.followers}
                                    </span>{" "}
                                    {t("followers")},{" "}
                                    <span className="cursor-pointer font-semibold text-teal-600 underline" onClick={() => navigate(`/following/${profile.id}`)}>
                                        {profile?.following}
                                    </span>{" "}
                                    {t("following")}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="text-sm font-semibold text-gray-700">{t("verified_info")}:</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 />
                                <span>{t("email")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 />
                                <span>{t("google")}</span>
                            </div>
                        </div>
                    </div>
                    <span className="flex items-start flex-wrap text-md text-gray-600">{profile?.about}</span>
                </div>
            </div>

            <div className="mt-6 border-b flex gap-6 text-sm font-medium text-gray-600">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`pb-2 ${activeTab === tab
                            ? "border-b-2 border-teal-700 text-teal-700"
                            : "hover:text-teal-700"
                            }`}
                    >
                        {t(tab)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4 min-h-[600px]">
                {activeTab === "listings" ? (
                    <div className="flex-grow">
                        {loadingProducts ? (
                            <LoadingSpinner fullScreen={false} />
                        ) : products && products.length > 0 ? (
                            <>
                                <ProductGrid
                                    products={products}
                                    apiRefresh={apiRefresh}
                                    setApiRefresh={setApiRefresh}
                                />

                                {isLoadingMore && (
                                    <div className="flex justify-center py-4">
                                        <LoadingSpinner />
                                    </div>
                                )}
                                
                                {showLoadMoreButton && page < totalPages && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            onClick={handleLoadMore}
                                            className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                                            disabled={isLoadingMore}
                                        >
                                            {isLoadingMore ? 'Loading...' : t("load_more")}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState />
                        )}

                    </div>
                ) : (
                    <div className="text-gray-600">
                        <ReviewSection userProfile={profile} />
                    </div>
                )}
            </div>
            {showBlockConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-orange-600">{t("block-user")}</h3>
                            <button
                                onClick={() => setShowBlockConfirm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center space-x-3 mb-4 rtl:space-x-reverse">
                                <Shield className="w-8 h-8 text-orange-500" />
                                <div>
                                    <p className="font-medium">{t("block")} {profile?.userName}</p>
                                    <p className="text-sm text-gray-600">
                                        {t("block-info")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-3 rtl:space-x-reverse">
                                <button
                                    onClick={() => setShowBlockConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleBlockUser}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Blocking...' : t('block')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-red-600">{t("report-user")}</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("report-reason")}
                                </label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
                                >
                                    <option value="">{t("select-reason")}</option>
                                    {reportReasons.map((reason) => (
                                        <option key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("description")}
                                </label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder={t("report-description-placeholder")}
                                    className="w-full p-2 border border-gray-300 rounded-lg resize-none h-28 focus:outline-none"
                                    rows={4}
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {reportDescription.length}/1000 {t("characters")}
                                </p>
                            </div>

                            <div className="flex space-x-3 rtl:space-x-reverse">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleReportUser}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Reporting...' : t('report')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <RateProductModal
                isOpen={showRateModal}
                onClose={() => setShowRateModal(false)}
                sellerProfile={profile}
                sellerProducts={products || []}
                onRatingSubmitted={handleRatingSubmitted}
            />
            <AuthModal />
            <LoginModal />
            <ForgotPasswordModal />
            <SignUpModal />
        </div>
    );
}
