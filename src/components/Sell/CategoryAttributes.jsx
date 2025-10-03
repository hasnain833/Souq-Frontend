import React, { useEffect, useRef, useState } from 'react';
import { attributeOptions } from '../../data/categoryData';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import { MdRadioButtonChecked, MdRadioButtonUnchecked, MdAdd } from 'react-icons/md';
import { getSize } from '../../api/ProductService';
import { useTranslation } from 'react-i18next';

const CategoryAttributes = ({ category, attributes, onChange }) => {
    const { t } = useTranslation()
    // Get the attributes that should be shown for this category
    const getAttributesForCategory = () => {
        // In a real implementation, this would depend on the category
        return ['brand', 'size', 'condition', 'color', 'material'];
    };

    const [sizes, setSizes] = useState([]);

   useEffect(() => {
      if (category) {
        getSize(category)
          .then((res) => {
            const sizeList = res?.data?.sizes;

            if (sizeList && sizeList.length > 0) {
              setSizes(sizeList);
            } else {
              // fallback to local attributeOptions
              setSizes(attributeOptions.sizes[category] || attributeOptions.sizes.default);
            }
          })
          .catch((err) => {
            console.error("Failed to fetch sizes", err);
            // fallback to local attributeOptions
            setSizes(attributeOptions.sizes[category] || attributeOptions.sizes.default);
          });
      }
    }, [category]);

    const brandCategories = {
        topBrands: ["Nike", "Adidas", "Zara", "H&M", "Puma", "No label"],
        allBrands: [
            "Nike", "Adidas", "Zara", "H&M", "Puma",
            "Gucci", "Levis", "Uniqlo", "Under Armour", "Reebok", "No label"
        ],
    };

    const conditions = [
        {
            label: "New with tags",
            description: "A brand-new, unused item with tags attached or in the original packaging.",
            value: "new"
        },
        {
            label: "New without tags",
            description: "A brand-new, unused item without tags or original packaging.",
            value: "like new"
        },
        {
            label: "Very good",
            description: "A lightly used item that may have slight imperfections, but still looks great.",
            value: "used"
        },
        {
            label: "Good",
            description: "A used item that may show imperfections and signs of wear.",
            value: "very used"
        },
        {
            label: "Satisfactory",
            description: "A frequently used item with imperfections and signs of wear.",
            value: "very used"
        }
    ];


    const getSizesForCategory = () => {
        return attributeOptions.sizes[category] || attributeOptions.sizes.default;
    };

    const visibleAttributes = getAttributesForCategory();
    const [openBrand, setOpenBrand] = useState(false);
    const [searchBrand, setSearchBrand] = useState("");
    const [showAddBrand, setShowAddBrand] = useState(false); // State to show add brand input
    const [newBrand, setNewBrand] = useState(""); // State for new brand input
    const [brandError, setBrandError] = useState(""); // State for brand error message
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenBrand(false);
                setShowAddBrand(false); // Reset add brand view when closing dropdown
                setNewBrand(""); // Clear new brand input
                setBrandError(""); // Clear error message
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredBrands = brandCategories.allBrands.filter((brand) =>
        brand.toLowerCase().includes(searchBrand.toLowerCase())
    );

    // Function to add a new brand
    const handleAddBrand = () => {
        const trimmedBrand = newBrand.trim();

        // Check if brand name is empty
        if (!trimmedBrand) {
            setBrandError("Brand name cannot be empty");
            return;
        }

        // Check if brand already exists
        if (brandCategories.allBrands.some(brand => brand.toLowerCase() === trimmedBrand.toLowerCase())) {
            setBrandError("This brand already exists");
            return;
        }

        // If validation passes, add the brand
        onChange("brand", trimmedBrand);
        setOpenBrand(false);
        setShowAddBrand(false);
        setNewBrand("");
        setSearchBrand("");
        setBrandError(""); // Clear error message
    };

    const [openCondition, setOpenCondition] = useState(false);
    const dropdownConditionRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownConditionRef.current &&
                !dropdownConditionRef.current.contains(event.target)
            ) {
                setOpenCondition(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const colors = [
        "Black", "Blue", "White", "Multi", "Gray", "Pink", "Brown", "Red",
        "Green", "Beige", "Silver", "Gold", "Cream", "Navy", "Purple", "Yellow",
        "Orange", "Light blue", "Khaki", "Rose", "Burgundy", "Turquoise",
        "Dark green", "Lilac", "Coral", "Apricot", "Mint", "Mustard"
    ];

    const colorMap = {
        Black: "#000000", Blue: "#0000FF", White: "#FFFFFF", Multi: "linear-gradient(45deg, red, blue, yellow)",
        Gray: "#808080", Pink: "#FFC0CB", Brown: "#A52A2A", Red: "#FF0000", Green: "#008000", Beige: "#F5F5DC",
        Silver: "#C0C0C0", Gold: "#FFD700", Cream: "#FFFDD0", Navy: "#000080", Purple: "#800080", Yellow: "#FFFF00",
        Orange: "#FFA500", "Light blue": "#ADD8E6", Khaki: "#F0E68C", Rose: "#FF007F", Burgundy: "#800020",
        Turquoise: "#40E0D0", "Dark green": "#006400", Lilac: "#C8A2C8", Coral: "#FF7F50", Apricot: "#FBCEB1",
        Mint: "#98FF98", Mustard: "#FFDB58"
    };

    const [openColor, setOpenColor] = useState(false);
    const colorRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorRef.current && !colorRef.current.contains(event.target)) {
                setOpenColor(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!visibleAttributes.includes("color")) return null;

    const [openMaterial, setOpenMaterial] = useState(false);
    const materialRef = useRef(null);

    const materials = [
        "Acrylic", "Alpaca", "Bamboo", "Canvas", "Cardboard", "Cashmere", "Ceramic", "Chiffon",
        "Corduroy", "Cotton", "Denim", "Down", "Elastane", "Faux fur", "Faux leather", "Felt",
        "Flannel", "Fleece", "Foam", "Glass", "Gold", "Jute", "Lace", "Latex", "Leather", "Linen",
        "Merino", "Mesh", "Metal", "Mohair", "Neoprene", "Nylon", "Paper", "Patent leather",
        "Plastic", "Polyester", "Porcelain", "Rattan", "Rayon", "Rubber", "Satin", "Sequin",
        "Silicone", "Silk", "Silver", "Steel", "Stone", "Straw", "Suede", "Tulle", "Tweed",
        "Velour", "Velvet", "Wood", "Wool"
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (materialRef.current && !materialRef.current.contains(event.target)) {
                setOpenMaterial(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [openSize, setOpenSize] = useState(false);
    const sizeRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sizeRef.current && !sizeRef.current.contains(event.target)) {
                setOpenSize(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-4">
            {visibleAttributes.includes('brand') && (
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("brand")}</label>
                    <div ref={dropdownRef}>
                        <button
                            onClick={() => setOpenBrand(!openBrand)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white flex justify-between items-center"
                        >
                            {attributes.brand || t("selectBrand")}
                            {openBrand ? <LuChevronUp className="w-5 h-5 text-gray-600" /> : <LuChevronDown className="w-5 h-5 text-gray-600" />}
                        </button>

                        {openBrand && (
                            <div className="absolute z-10 w-full bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
                                {/* Search input - only shown when not adding a new brand */}
                                {!showAddBrand && (
                                    <div className="p-3 border-b">
                                        <input
                                            type="text"
                                            placeholder="Search for brand..."
                                            value={searchBrand}
                                            onChange={(e) => setSearchBrand(e.target.value)}
                                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none hover:border-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                )}

                                {/* Add new brand option - only shown when not adding a new brand */}
                                {!showAddBrand && (
                                    <div
                                        className="flex items-center px-4 py-2 border-b cursor-pointer hover:bg-gray-50 text-teal-600"
                                        onClick={() => setShowAddBrand(true)}
                                    >
                                        <MdAdd className="mr-2" />
                                        <span>Add new brand</span>
                                    </div>
                                )}

                                {/* Add new brand input */}
                                {showAddBrand && (
                                    <div className="p-3 border-b">
                                        <input
                                            type="text"
                                            placeholder="Enter new brand name"
                                            value={newBrand}
                                            onChange={(e) => {
                                                setNewBrand(e.target.value);
                                                setBrandError(""); // Clear error when user types
                                            }}
                                            className={`w-full border rounded px-3 py-2 text-sm mb-3 focus:outline-none ${brandError ? 'border-red-500' : 'hover:border-teal-500 focus:border-teal-500'}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddBrand();
                                                }
                                            }}
                                        />
                                        {/* Error message */}
                                        {brandError && (
                                            <div className="text-red-500 text-sm mb-2">{brandError}</div>
                                        )}
                                        <div className="flex gap-3"> {/* Increased gap for more spacing */}
                                            <button
                                                onClick={handleAddBrand}
                                                className="flex-1 bg-teal-600 text-white py-1 px-3 rounded text-sm hover:bg-teal-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowAddBrand(false);
                                                    setNewBrand("");
                                                    setBrandError(""); // Clear error message
                                                }}
                                                className="flex-1 bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Brand list - only shown when not adding a new brand */}
                                {!showAddBrand && (
                                    <>
                                        {filteredBrands.length > 0 ? (
                                            filteredBrands.map((brand) => (
                                                <div
                                                    key={brand}
                                                    className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => {
                                                        onChange("brand", brand);
                                                        setOpenBrand(false);
                                                        setSearchBrand("");
                                                    }}
                                                >
                                                    <span>{brand}</span>
                                                    {attributes.brand === brand ? (
                                                        <MdRadioButtonChecked className="text-teal-600" />
                                                    ) : (
                                                        <MdRadioButtonUnchecked className="text-teal-600" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-gray-500 text-sm text-center">No brands found.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {visibleAttributes.includes('size') && (
                <div className="relative" ref={sizeRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("size")}</label>
                    <button
                        type="button"
                        onClick={() => setOpenSize(!openSize)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white flex justify-between items-center"
                    >
                        {attributes.size || t("selectSize")}
                        {openSize ? (
                            <LuChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <LuChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {openSize && (
                        <div className="absolute z-10 w-full bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
                            {sizes.map((size) => (
                                <div
                                    key={size}
                                    className="flex justify-between items-center px-4 py-2 border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => {
                                        onChange('size', size);
                                        setOpenSize(false);
                                    }}
                                >
                                    <span>{size}</span>
                                    {attributes.size === size ? (
                                        <MdRadioButtonChecked className="text-teal-600" />
                                    ) : (
                                        <MdRadioButtonUnchecked className="text-gray-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {visibleAttributes.includes('condition') && (
                <div className="relative mb-4" ref={dropdownConditionRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("condition")}
                    </label>

                    <button
                        onClick={() => setOpenCondition(!openCondition)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white flex justify-between items-center"
                    >
                        {attributes.condition || t("selectCondition")}
                        {openCondition ? (
                            <LuChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <LuChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {openCondition && (
                        <div className="absolute z-10 w-full bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
                            {conditions.map((condition) => (
                                <div
                                    key={condition.label}
                                    className="flex items-start gap-2 p-3 border-b hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        onChange("condition", condition.value);
                                        setOpenCondition(false);
                                    }}
                                >
                                    {attributes.condition === condition.value ? (
                                        <MdRadioButtonChecked className="mt-1 text-teal-600" />
                                    ) : (
                                        <MdRadioButtonUnchecked className="mt-1 text-teal-600" />
                                    )}
                                    <div>
                                        <div className="font-medium">{condition.label}</div>
                                        <div className="text-sm text-gray-500">{condition.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {visibleAttributes.includes("color") && (
                <div className="relative" ref={colorRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("color")}</label>
                    <button
                        onClick={() => setOpenColor(!openColor)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white flex justify-between items-center"
                        type="button"
                    >
                        {attributes.color || t("selectColor")}
                        {openColor ? (
                            <LuChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <LuChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {openColor && (
                        <div className="absolute z-10 bg-white shadow-lg rounded mt-2 w-full max-h-96 overflow-y-auto">
                            {colors.map((color) => (
                                <div
                                    key={color}
                                    className="flex items-center justify-between px-4 py-2 border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => {
                                        onChange("color", color);
                                        setOpenColor(false);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-6 h-6 rounded-full border"
                                            style={{
                                                background: color === "Multi" ? colorMap[color] : undefined,
                                                backgroundColor: color !== "Multi" ? colorMap[color] : undefined,
                                            }}
                                        />
                                        <span>{color}</span>
                                    </div>
                                    {attributes.color === color ? (
                                        <MdRadioButtonChecked className="text-green-600" />
                                    ) : (
                                        <MdRadioButtonUnchecked className="text-gray-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {visibleAttributes.includes('material') && (
                <div className="relative" ref={materialRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("material")}</label>
                    <button
                        type="button"
                        onClick={() => setOpenMaterial(!openMaterial)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white flex justify-between items-center"
                    >
                        {attributes.material || t("selectMaterial")}
                        {openMaterial ? (
                            <LuChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <LuChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {openMaterial && (
                        <div className="absolute z-10 w-full bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
                            {materials.map((mat) => (
                                <div
                                    key={mat}
                                    className="flex justify-between items-center px-4 py-2 border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => {
                                        onChange('material', mat);
                                        setOpenMaterial(false);
                                    }}
                                >
                                    <span>{mat}</span>
                                    {attributes.material === mat ? (
                                        <MdRadioButtonChecked className="text-teal-600" />
                                    ) : (
                                        <MdRadioButtonUnchecked className="text-gray-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default CategoryAttributes;