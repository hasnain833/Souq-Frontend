import { Star, CheckCircle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const seller = {
    name: "Ella Moreau",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYyxRDrJKhWSGOwCDdHS5K_6EOY20t0fsUFg&s",
    badge: "Top Rated",
    verified: true,
    tagline: "Handcrafted vibes & vintage treasures",
    rating: 4.8,
    reviews: 152,
    location: "Pompano Beach, FL",
    yearsOfExperience: 3,
};


export default function SellerInfoCard() {
    const navigate = useNavigate()  
    return (
        <div className="border rounded-xl p-4 bg-white shadow-md">
            <h2 className="text-md font-semibold text-gray-800 mb-3">About the Seller</h2>

            <div className="flex items-center gap-4">
                {/* Avatar with hover frame */}
                <div className="relative group cursor-pointer" onClick={() => navigate("/profile")}>
                    <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500 group-hover:ring-4 transition duration-200"
                    />
                    {seller.verified && (
                        <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
                    )}
                </div>

                {/* Seller details */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-medium text-gray-900 cursor-pointer" onClick={() => navigate("/profile")}>{seller.name}</p>
                        {seller.badge && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                {seller.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 italic">{seller.tagline}</p>

                    <div className="flex items-center gap-1 mt-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(seller.rating) ? "fill-yellow-500" : "fill-none"}`}
                            />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                            {seller.rating.toFixed(1)} • {seller.reviews} reviews
                        </span>
                    </div>
                </div>
            </div>

            {/* Extra info */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-4">
                <MapPin className="w-4 h-4" />
                <span>{seller.location}</span>
                <span className="text-gray-400">•</span>
                <span>{seller.yearsOfExperience}+ years of experience</span>
            </div>
        </div>
    );
}
