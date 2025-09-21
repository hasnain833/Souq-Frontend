import { useEffect, useRef, useState } from "react";
import ProductGrid from "../components/Products/ProductGrid";
import ReviewSection from "../components/Profile/ReviewSection";
import {
    FaMapMarkerAlt,
    FaClock,
    FaUserFriends,
    FaStar,
} from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { getProfile } from "../api/AuthService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/Animations";
import { getProduct } from "../api/ProductService";
import { CheckCircle2 } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';
import { useTranslation } from "react-i18next";
import MemberProfileSkeleton from "../components/Skeleton/MemberProfileSkeleton";
import { Helmet } from "react-helmet";

export default function MemberProfile() {
    const [profileData, setProfileData] = useState(null); // store user profile
    const baseURL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tab } = useParams();
    const [product, setProduct] = useState([])
    const [user, setUser] = useState("")
    const tabs = ["listings", "reviews"];
    const currentTab = tabs.includes(tab) ? tab : "listings";
    const [activeTab, setActiveTab] = useState(currentTab);
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // You can change this if needed
    const [totalPages, setTotalPages] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (tab && tabs.includes(tab)) {
            setActiveTab(tab);
        }
    }, [tab]);

    useEffect(() => {
        getProfile().then((res) => {
            if (res?.success) {
                setProfileData(res?.data?.data);
            }
        });
    }, []);

    const rating = profileData?.ratings?.averageRating || 0;
    const totalRatings = profileData?.ratings?.totalRatings || 0;

    // useEffect(() => {
    //     if (profileData?.id) {
    //         setIsLoadingProducts(true); // Start loading
    //         getProduct()
    //             .then((res) => {
    //                 const items = res?.data?.data?.items || [];
    //                 setProduct(items);
    //                 setUser(profileData);
    //             })
    //             .catch((err) => {
    //                 console.log(err, "err");
    //             })
    //             .finally(() => {
    //                 setIsLoadingProducts(false); // Stop loading
    //             });
    //     }
    // }, [profileData?.id]);

    const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
    const isFetchingRef = useRef(false);

    // 🔹 Fetch Products
    const fetchMyProducts = async (pageNumber = 1, append = false) => {
        const query = { page: pageNumber, limit };

        const setLoading = append ? setIsLoadingMore : setIsLoadingProducts;
        setLoading(true);
        isFetchingRef.current = true;

        try {
            const res = await getProduct(query);
            const items = res?.data?.data?.items || [];

            setProduct(prev => {
                if (!append) return items;

                // ✅ Avoid duplicate products (by id)
                const existingIds = new Set(prev.map(p => p.id));
                const filteredNew = items.filter(p => !existingIds.has(p.id));
                return [...prev, ...filteredNew];
            });

            setTotalPages(res?.data?.data?.totalPages || 0);
            setUser(profileData);
        } catch (err) {
            console.error("Fetch my products failed:", err);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    // 🔹 First Load
    useEffect(() => {
        if (!profileData?.id) return;
        setPage(1);
        fetchMyProducts(1, false);
    }, [profileData?.id]);

    // 🔹 Handle Load More
    const handleLoadMore = () => {
        if (isFetchingRef.current || page >= totalPages) return; // prevent duplicate fetch

        const nextPage = page + 1;
        setPage(nextPage);
        fetchMyProducts(nextPage, true); // append
    };

    // 🔹 Infinite Scroll for first 3 pages
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                !isLoadingMore &&
                !isFetchingRef.current &&
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/member-profile/${tab}`);
    };

    if (!profileData) {
        return <MemberProfileSkeleton />;
    }

    return (
        <div className="container mx-auto p-4">
            <Helmet>
                <title>Profile - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <img
                    // src={profileData.profile ? `${baseURL}${profileData.profile}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    src={profileData.profile ? profileData.profile : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Profile"
                    className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-md"
                />

                <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {profileData?.firstName} {profileData?.lastName}
                        </h2>
                        <button
                            className="flex items-center gap-2 px-5 py-2 hover:bg-gray-100 text-teal-700 rounded-md font-semibold border border-teal-600"
                            onClick={() => navigate("/settings/profile_details")}
                        >
                            <LuPencil className="w-4 h-4" />
                            {t("edit_profile")}
                        </button>
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

                    {/* <div className="flex items-center gap-3 text-md text-gray-700">
                        <FaBoxOpen className="text-teal-700 text-2xl" />
                        <span className="text-teal-700 font-semibold">Frequent Uploads</span>
                        <span>· Regularly lists 5 or more items</span>
                    </div> */}

                    {/* Location, Last seen, Followers */}
                    <div className="flex items-start gap-12 flex-wrap text-md text-gray-600">
                        {/* Left Side - About Section */}
                        <div className="space-y-3">
                            <span className="text-sm font-semibold text-gray-700">{t("about")}:</span>
                            {profileData?.country &&
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-xl" />
                                    <span>{profileData?.cityShow && `${profileData.city}, `}{profileData?.country}</span>
                                </div>}
                            <div className="flex items-center gap-2">
                                <FaClock className="text-xl" />
                                <span>{t("last_seen")} {"  "}{profileData?.lastLoginAt ? formatDistanceToNowStrict(new Date(profileData?.lastLoginAt), { addSuffix: true }) : "1 Hours ago"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaUserFriends className="text-xl" />
                                <span>
                                    <span className="font-semibold text-teal-600 underline cursor-pointer" onClick={() => navigate(`/followers/${profileData.id}`)}>
                                        {profileData?.followers}
                                    </span>{" "}
                                    {t("followers")},{" "}
                                    <span className="cursor-pointer font-semibold text-teal-600 underline" onClick={() => navigate(`/following/${profileData.id}`)}>
                                        {profileData?.following}
                                    </span>{" "}
                                    {t("following")}
                                </span>
                            </div>
                        </div>

                        {/* Right Side - Verified Info */}
                        <div className="space-y-3">
                            <span className="text-sm font-semibold text-gray-700">{t("verified_info")}:</span>
                            {profileData?.email && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 />
                                    <span className=" ">{t("email")}</span>
                                </div>)}
                            {profileData?.loginWithGoogle && (<div className="flex items-center gap-2">
                                <CheckCircle2 />
                                <span className=" ">{t("google")} </span>
                            </div>)}
                            {profileData?.loginWithFacebook && (<div className="flex items-center gap-2">
                                <CheckCircle2 />
                                <span className=" ">{t("facebook")} </span>
                            </div>)}
                        </div>
                    </div>
                    <span className="flex items-start gap-12 flex-wrap text-md text-gray-600">{profileData?.about}</span>
                </div>
            </div>

            {/* Tabs */}
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
                        {isLoadingProducts ? (
                            <LoadingSpinner fullScreen={false} />
                        ) : product && product.length > 0 ? (
                            <>
                                <ProductGrid products={product} user={user} />

                                {isLoadingMore && (
                                    <div className="flex justify-center py-4">
                                        <LoadingSpinner />
                                    </div>
                                )}

                                {/* Load More Button */}
                                {showLoadMoreButton && page < totalPages && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            onClick={handleLoadMore}
                                            className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                                            disabled={isLoadingMore}
                                        >
                                            {isLoadingMore ? "Loading..." : t("load_more")}
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
                        <ReviewSection userProfile={profileData} />
                    </div>
                )}
            </div>
        </div>
    );
}
