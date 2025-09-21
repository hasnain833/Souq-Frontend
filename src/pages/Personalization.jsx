import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getPersonalization, saveOrUpdatePersonalization } from "../api/Personalization";
import PersonalizationSkeleton from "../components/Skeleton/PersonalizationSkeleton";
import { Helmet } from "react-helmet";

const brandCategories = {
    topBrands: ["Nike", "Adidas", "Zara", "H&M", "Puma"],
    allBrands: [
        "Nike", "Adidas", "Zara", "H&M", "Puma",
        "Gucci", "Levis", "Uniqlo", "Under Armour", "Reebok"
    ],
};

export default function Personalization() {
    const [activeTab, setActiveTab] = useState("categories");
    const [followedBrands, setFollowedBrands] = useState([]);
    const categoryData = useSelector((state) => state.categoryData.data);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiRefresh, setApiRefresh] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getPersonalization();
                const categoryIds = response.data?.followedCategories?.map(cat => cat._id) || [];
                const brands = (response.data?.followedBrands || []).map(b => b.toLowerCase());
                setFollowedBrands(brands);
                setSelectedCategories(categoryIds);
            } catch (err) {
                console.error("Error loading personalization:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiRefresh]);

    const toggleFollow = (brand) => {
        const normalized = brand.toLowerCase();
        setFollowedBrands((prev) =>
            prev.includes(normalized)
                ? prev.filter((b) => b !== normalized)
                : [...prev, normalized]
        );
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories((prevSelected) =>
            prevSelected.includes(categoryId)
                ? prevSelected.filter((id) => id !== categoryId)
                : [...prevSelected, categoryId]
        );
    };

    const savePreferences = async () => {
        try {
            setLoading(true);
            await saveOrUpdatePersonalization({
                categories: selectedCategories,
                brands: [...new Set(followedBrands.map(b => b.toLowerCase()))],
            });
            setApiRefresh(!apiRefresh)
            // alert("Preferences saved!");
        } catch (err) {
            console.error("Error saving preferences:", err);
            alert("Failed to save preferences.");
        } finally {
            setLoading(false);
        }
    };

    const renderBrandList = (brandList) =>
        brandList.map((brand) => {
            const normalized = brand.toLowerCase();
            const isChecked = followedBrands.includes(normalized);

            return (
                <div
                    key={brand}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                    <div className="flex items-center space-x-3">
                        <span className="font-medium">{brand}</span>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFollow(brand)}
                            className="accent-teal-600 w-5 h-5"
                        />
                    </div>
                </div>
            );
        });

    return (
        <div className="flex flex-col md:flex-row min-h-screen container mx-auto">
            <Helmet>
                <title>Personalization - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            {/* Sidebar */}
            <div className="md:w-64 border-b md:border-b-0 ltr:md:border-r rtl:md:border-l p-4 md:p-6 flex md:block justify-between">
                <h2 className="text-lg md:text-xl font-semibold md:mb-4">Personalization</h2>
                <ul className="flex md:flex-col gap-4 text-sm md:text-base">
                    <li
                        className={`cursor-pointer ${activeTab === "categories" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                        onClick={() => setActiveTab("categories")}
                    >
                        Categories and sizes
                    </li>
                    <li
                        className={`cursor-pointer ${activeTab === "brands" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                        onClick={() => setActiveTab("brands")}
                    >
                        Brands
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                {loading && <PersonalizationSkeleton />}

                {/* Categories */}
                {activeTab === "categories" && !loading && (
                    <>
                        <h1 className="text-lg md:text-xl font-semibold mb-1">Select categories and sizes</h1>
                        <p className="text-sm text-gray-500 mb-6">Select the categories and sizes you want to see in your feed</p>
                        <div className="border rounded-lg divide-y">
                            {categoryData?.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleCategoryToggle(cat.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="font-medium">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.id)}
                                            readOnly
                                            className="accent-teal-600 w-5 h-5"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Brands */}
                {activeTab === "brands" && !loading && (
                    <>
                        <h1 className="text-lg md:text-xl font-semibold mb-1">Select your favorite brands</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Items from these brands will appear in your feed more often.
                        </p>

                        {/* Top Brands */}
                        <div className="mb-6 border rounded-lg overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 border-b">
                                <span className="font-semibold text-gray-700">Top Brands</span>
                            </div>
                            <div className="divide-y px-4">{renderBrandList(brandCategories.topBrands)}</div>
                        </div>

                        {/* All Brands */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 border-b">
                                <span className="font-semibold text-gray-700">All Brands</span>
                            </div>
                            <div className="divide-y px-4">{renderBrandList(brandCategories.allBrands)}</div>
                        </div>
                    </>
                )}

                {!loading && (
                    <button
                        className="w-full sm:w-auto self-center sm:self-end mt-8 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        onClick={savePreferences}
                    >
                        Save Preferences
                    </button>
                )}
            </div>
        </div>
    );
}
