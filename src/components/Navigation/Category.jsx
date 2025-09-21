import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { User, Scissors, Smile, Home as HomeIcon, Palette } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCategory,
  setSubcategory,
  setItem,
  resetCategory,
  setChildCategory,
} from "../../redux/slices/CategorySlice";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { getAllCategory } from "../../api/ProductService";

const categoryIcons = {
  women: <User size={18} className="text-teal-600" />,
  men: <Scissors size={18} className="text-teal-600" />,
  kids: <Smile size={18} className="text-teal-600" />,
  home: <HomeIcon size={18} className="text-teal-600" />,
  beauty: <Palette size={18} className="text-teal-600" />,
};

export default function Category() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    selectedCategory,
    selectedSubcategory,
    selectedChildCategory,
    selectedItem,
  } = useSelector((state) => state.category);

  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [fetchedCategories, setFetchedCategories] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategory();
        if (res?.data?.success) {
          const transformed = res.data.data.map((cat) => ({
            id: cat._id,
            name: cat.name,
            subcategories: cat.subCategories.map((sub) => ({
              id: sub._id,
              name: sub.name,
              childCategories: sub.childCategories.map((child) => ({
                id: child._id,
                name: child.name,
                items: child.items.map((item) => ({
                  id: item._id,
                  name: item.name,
                })),
              })),
            })),
          }));
          setFetchedCategories(transformed);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenCategory = () => {
    if (!open) {
      if (!selectedCategory || selectedCategory.id === "all") {
        dispatch(resetCategory());
        setStep(1);
      } else if (selectedChildCategory) {
        setStep(4);
      } else if (selectedSubcategory) {
        setStep(3);
      } else {
        setStep(2);
      }
    }
    setOpen(!open);
  };



  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenCategory}
        className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
      >
        {t("category")}
        {open ? (
          <LuChevronUp className="text-gray-600 w-5 h-5" />
        ) : (
          <LuChevronDown className="text-gray-600 w-5 h-5" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 w-80 bg-white shadow-lg rounded mt-2 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Categories */}
          {step === 1 &&
            fetchedCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  dispatch(setCategory(category));
                  setStep(2);
                }}
              >
                <div className="flex items-center gap-2">
                  {categoryIcons[category.name.toLowerCase()] || (
                    <span className="text-gray-400">❓</span>
                  )}
                  <span>{category.name}</span>
                </div>
                <FaArrowRight className="text-gray-400" />
              </div>
            ))}

          {/* Step 2: Subcategories */}
          {step === 2 && selectedCategory && (
            <>
              <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                <FaArrowLeft
                  className="cursor-pointer text-gray-600"
                  onClick={() => {
                    setStep(1);
                    dispatch(setCategory(null));
                    dispatch(setSubcategory(null));
                    dispatch(setChildCategory(null));
                    dispatch(setItem(null));
                  }}
                />
                <span className="text-center flex-1 font-medium">
                  {selectedCategory.name}
                </span>
                <span className="w-5" />
              </div>

              {selectedCategory.subcategories.map((subcat) => {
                const isLeaf = !subcat.childCategories?.length;
                const isSelected = selectedSubcategory?.id === subcat.id;

                return (
                  <div
                    key={subcat.id}
                    className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      dispatch(setSubcategory(subcat));
                      dispatch(setChildCategory(null));
                      dispatch(setItem(null));

                      if (isLeaf) {
                        setOpen(false);
                      } else {
                        setStep(3);
                      }
                    }}
                  >
                    <span>{subcat.name}</span>
                    {isLeaf ? (
                      isSelected ? (
                        <MdRadioButtonChecked className="text-teal-600" />
                      ) : (
                        <MdRadioButtonUnchecked className="text-teal-600" />
                      )
                    ) : (
                      <FaArrowRight className="text-gray-400" />
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Step 3: Child Categories */}
          {step === 3 && selectedSubcategory && (
            <>
              <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                <FaArrowLeft
                  className="cursor-pointer text-gray-600"
                  onClick={() => {
                    setStep(2);
                    dispatch(setChildCategory(null));
                    dispatch(setItem(null));
                  }}
                />
                <span className="text-center flex-1 font-medium">
                  {selectedSubcategory.name}
                </span>
                <span className="w-5" />
              </div>

              {selectedSubcategory.childCategories.map((child) => {
                const isLeaf = !child.items?.length;
                const isSelected = selectedChildCategory?.id === child.id;

                return (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      dispatch(setChildCategory(child));
                      dispatch(setItem(null));

                      if (isLeaf) {
                        setOpen(false);
                      } else {
                        setStep(4);
                      }
                    }}
                  >
                    <span>{child.name}</span>
                    {isLeaf ? (
                      isSelected ? (
                        <MdRadioButtonChecked className="text-teal-600" />
                      ) : (
                        <MdRadioButtonUnchecked className="text-teal-600" />
                      )
                    ) : (
                      <FaArrowRight className="text-gray-400" />
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Step 4: Items */}
          {step === 4 && selectedChildCategory && (
            <>
              <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                <FaArrowLeft
                  className="cursor-pointer text-gray-600"
                  onClick={() => {
                    setStep(3);
                    dispatch(setItem(null));
                  }}
                />
                <span className="text-center flex-1 font-medium">
                  {selectedChildCategory.name}
                </span>
                <span className="w-5" />
              </div>

              {/* "All" Option */}
              <div
                className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  dispatch(setItem({ id: selectedChildCategory?.id, name: "All" }));
                  setOpen(false);
                }}
              >
                <span>All</span>
                {selectedItem?.id === "all" ? (
                  <MdRadioButtonChecked className="text-teal-600" />
                ) : (
                  <MdRadioButtonUnchecked className="text-teal-600" />
                )}
              </div>

              {/* Items */}
              {selectedChildCategory.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    dispatch(setItem(item));
                    setOpen(false);
                  }}
                >
                  <span>{item.name}</span>
                  {selectedItem?.id === item.id ? (
                    <MdRadioButtonChecked className="text-teal-600" />
                  ) : (
                    <MdRadioButtonUnchecked className="text-teal-600" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

    </div>
  );
}
