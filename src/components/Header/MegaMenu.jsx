import React, { useRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setSubcategory,
  setChildCategory,
  setItem,
} from "../../redux/slices/CategorySlice";
import { useAppContext } from "../../context/AppContext";
import {
  Folder,
  ShoppingBag,
  Gift,
  User,
  Star,
  Scissors,
  Home,
  Palette,
  Package,
  Zap,
} from "lucide-react";

// Subcategory icons map
const subcategoryIcons = {
  "women-clothing": <ShoppingBag size={20} />,
  "women-shoes": <ShoppingBag size={20} />,
  "women-accessories": <Gift size={20} />,
  "women-beauty": <Palette size={20} />,
  "men-clothing": <ShoppingBag size={20} />,
  "men-shoes": <ShoppingBag size={20} />,
  "men-accessories": <Gift size={20} />,
  "men-grooming": <Scissors size={20} />,
  girls: <User size={20} />,
  boys: <User size={20} />,
  baby: <User size={20} />,
  toys: <Package size={20} />,
  "home-textiles": <Home size={20} />,
  "home-decor": <Home size={20} />,
  "home-furniture": <Home size={20} />,
  "home-kitchen": <Home size={20} />,
  "beauty-makeup": <Palette size={20} />,
  "beauty-skin": <Zap size={20} />,
  "beauty-hair": <Scissors size={20} />,
  "beauty-fragrance": <Star size={20} />,
  default: <Folder size={20} />,
};

const MegaMenu = ({ categoryData }) => {
  const dispatch = useDispatch();
  const {
    isMegaMenuOpen,
    setIsMegaMenuOpen,
    activeCategory,
    setActiveCategory,
  } = useAppContext();

  const [hoveredSubId, setHoveredSubId] = useState(null);
  const [hoveredChildId, setHoveredChildId] = useState(null);
  const [defaultSubId, setDefaultSubId] = useState(null);
  const [defaultChildId, setDefaultChildId] = useState(null);
  const megaMenuRef = useRef(null);

  // Set defaults when mega menu opens
  useEffect(() => {
    if (isMegaMenuOpen && activeCategory) {
      const activeCat = categoryData.find((c) => c.id === activeCategory);
      const defaultSub = activeCat?.subCategories?.[0];
      const defaultChild = defaultSub?.childCategories?.[0];

      setDefaultSubId(defaultSub?.id || null);
      setDefaultChildId(defaultChild?.id || null);
      setHoveredSubId(null);
      setHoveredChildId(null);
    }
  }, [isMegaMenuOpen, activeCategory, categoryData]);

  // Close when clicked outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setIsMegaMenuOpen(false);
        setHoveredSubId(null);
        setHoveredChildId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const activeCat = categoryData.find((c) => c.id === activeCategory);
  const subCategories = activeCat?.subCategories || [];

  const visibleSubId = hoveredSubId || defaultSubId;
  const currentSub = subCategories.find((sub) => sub.id === visibleSubId);
  const childCategories = currentSub?.childCategories || [];

  const visibleChildId = hoveredChildId || defaultChildId;
  const currentChild = childCategories.find(
    (child) => child.id === visibleChildId
  );
  const items = currentChild?.items || [];

  if (!isMegaMenuOpen || !activeCat) return null;

  return (
    <div
      ref={megaMenuRef}
      className="absolute left-0 top-full w-full bg-white shadow-xl border-t z-50 transition-all duration-300 ease-in-out"
      onMouseLeave={() => {
        setIsMegaMenuOpen(false);
        setHoveredSubId(null);
        setHoveredChildId(null);
      }}>
      <div className="container mx-auto px-6 py-6 flex gap-4">
        {/* Subcategories */}
        <div className="w-1/4 ltr:border-r rtl:border-l pr-4 rtl:pl-4">
          <ul className="space-y-1">
            {subCategories.map((sub) => (
              <li
                key={sub.id}
                onMouseEnter={() => setHoveredSubId(sub.id)}
                onClick={() => dispatch(setSubcategory(sub))}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                  visibleSubId === sub.id
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                {/* <span className="text-teal-600">{subcategoryIcons[sub.slug] || subcategoryIcons.default}</span> */}
                <span>{sub.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Child categories */}
        <div className="w-1/4 ltr:border-r rtl:border-l pr-4 rtl:pl-4">
          <ul className="space-y-1">
            {childCategories.map((child) => (
              <li
                key={child.id}
                onMouseEnter={() => setHoveredChildId(child.id)}
                onClick={() => dispatch(setChildCategory(child))}
                className={`px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                  visibleChildId === child.id
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}>
                {child.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Items */}
        {/* Items */}
        <div className="w-2/4 pl-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  dispatch(setItem(item));
                  setIsMegaMenuOpen(false);
                  setActiveCategory(null);
                }}
                className="px-3 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-teal-700">
                {item.name}
              </li>
            ))}
            {items.length === 0 && (
              <li className="px-3 py-2 text-gray-500">No items available</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
