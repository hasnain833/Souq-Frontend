import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { follow, unFollow } from "../../api/ProductService";
import { useTranslation } from "react-i18next";

const StarRating = ({ stars = 0 }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={`text-sm ${i < Math.floor(stars) ? 'text-yellow-500' : 'text-gray-300'}`}
            />
        ))}
    </div>
);

const FollowerCard = ({ person }) => {
    const navigate = useNavigate()
    const { t } = useTranslation();
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const normalizedURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const [following, setFollowing] = useState(person?.isFollowedByMe || false);
    const authUser = JSON.parse(localStorage.getItem("user"));
    const {
        setIsAuthModalOpen,
        setAuthMode,
    } = useAppContext();

    const handleFollow = async () => {
        if (!authUser) {
            setAuthMode('login');
            setIsAuthModalOpen(true);
            return;
        }

        try {
            if (following) {
                await unFollow(person.id);
            } else {
                await follow(person.id);
            }
            setFollowing(!following);
        } catch (error) {
            console.error('Error following/unfollowing:', error);
        }
    };

    const userNavigate = () => {
        if (authUser?.id === person.id) {
            navigate("/member-profile")
        } else {
            navigate(`/profile/${person.id}`)
        }
    }

    return (
        <>
            <div className="flex items-center justify-between bg-white border rounded-md px-3 py-2 shadow hover:shadow-md transition">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img
                        src={person?.profile ? person?.profile : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        // src={person?.profile ? `${normalizedURL}${person?.profile}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={person.name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-100 cursor-pointer"
                        onClick={userNavigate}
                    />
                    <div className="flex flex-col text-sm">
                        <span className="font-medium text-gray-900 cursor-pointer" onClick={userNavigate}>{person.name}</span>
                        {person.totalRatings > 0 ? (
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                <StarRating stars={person.averageRating || 0} />
                                <span className="text-xs text-gray-500">
                                    {person.totalRatings} {person.totalRatings === 1 ? t("review") : t("reviews")}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500">{t("no-reviews-yet")}</span>
                        )}
                    </div>
                </div>
                {authUser?.id !== person?.id && (
                    <button
                        onClick={handleFollow}
                        className={`text-xs font-medium px-4 py-1 rounded transition duration-200 shadow-sm hover:shadow focus:outline-none ${following
                            ? "bg-gray-100 text-gray-700"
                            : "bg-teal-600 text-white hover:bg-teal-700"
                            }`}
                    >
                        {following ? t("following") : t("follow")}
                    </button>
                )}
            </div>
        </>
    );
};

export default FollowerCard;
