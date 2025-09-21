import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import {
  setBrand,
  setCondition,
  setColor,
  setMaterial,
  setSortBy,
  setSize,
  setPrice,
} from "../../redux/slices/FilterSlice";
import {
  setCategory,
  setChildCategory,
  setItem,
  setSubcategory,
} from "../../redux/slices/CategorySlice";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";

const FilterModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { t, i18 } = useTranslation();
  const categoryData = useSelector((state) => state.categoryData.data);

  const [localSelection, setLocalSelection] = useState({
    category: null,
    subcategory: null,
    childCategory: null,
    item: null,
  });

  const [localFilters, setLocalFilters] = useState({
    brand: "",
    condition: "",
    color: "",
    material: "",
    sortBy: "",
    size: "",
    priceFrom: "",
    priceTo: "",
    category: "",
  });

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        brand: "",
        condition: "",
        color: "",
        material: "",
        sortBy: "",
        size: "",
        priceFrom: "",
        priceTo: "",
      });

      setLocalSelection({
        category: null,
        subcategory: null,
        childCategory: null,
        item: null,
      });
    }
  }, [isOpen]);

  const brands = [
    "Nike",
    "Adidas",
    "Zara",
    "H&M",
    "Puma",
    "Gucci",
    "Levis",
    "Uniqlo",
    "Under Armour",
    "Reebok",
  ];

  const colors = [
    "Black",
    "Blue",
    "White",
    "Multi",
    "Gray",
    "Pink",
    "Brown",
    "Red",
    "Green",
    "Beige",
    "Silver",
  ];

  const conditions = [
    { label: "New with tags", value: "new" },
    { label: "New without tags", value: "like new" },
    { label: "Very good", value: "used" },
    { label: "Good", value: "very used" },
    { label: "Satisfactory", value: "satisfactory" },
  ];

  const materials = [
    "Acrylic",
    "Alpaca",
    "Bamboo",
    "Canvas",
    "Cardboard",
    "Cashmere",
    "Ceramic",
    "Chiffon",
    "Corduroy",
    "Cotton",
    "Denim",
  ];

  const sortOptions = [
    "Newest first",
    "Oldest first",
    "Price: Low to High",
    "Price: High to Low",
    "Relevance",
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    if (localFilters.brand) dispatch(setBrand(localFilters.brand));
    if (localFilters.condition) {
      const selectedCondition = conditions.find(
        (cond) => cond.value === localFilters.condition
      );
      if (selectedCondition) {
        dispatch(
          setCondition({
            value: selectedCondition.value,
            label: selectedCondition.label,
          })
        );
      }
    }
    if (localFilters.color) dispatch(setColor(localFilters.color));
    if (localFilters.material) dispatch(setMaterial(localFilters.material));
    if (localFilters.sortBy) dispatch(setSortBy(localFilters.sortBy));
    if (localFilters.size) dispatch(setSize(localFilters.size));
    dispatch(
      setPrice({ from: localFilters.priceFrom, to: localFilters.priceTo })
    );
    dispatch(setCategory(localSelection.category));
    dispatch(setSubcategory(localSelection.subcategory));
    dispatch(setChildCategory(localSelection.childCategory));
    dispatch(setItem(localSelection.item));

    onClose();
  };

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const handleOpen = () => {
    setOpen(!open);
    setStep(1);
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-2 sm:px-4">
      <div className="bg-white w-full max-w-3xl max-h-[95vh] rounded-lg shadow-xl overflow-y-auto p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-500 hover:text-black">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">{t("filters")}</h2>

        <div className="relative">
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              {t("category")}
            </label>
            <button
              onClick={handleOpen}
              // ref={dropdownRef}
              className="w-full border border-gray-300 p-3 rounded shadow-sm focus:outline-none bg-white flex items-center justify-between">
              {localSelection.item?.name ||
                localSelection.childCategory?.name ||
                localSelection.subcategory?.name ||
                localSelection.category?.name ||
                t("category")}
              {open ? (
                <LuChevronUp className="text-gray-600 w-5 h-5" />
              ) : (
                <LuChevronDown className="text-gray-600 w-5 h-5" />
              )}
            </button>
          </div>

          {open && (
            <div
              className="absolute z-10 w-full bg-white shadow-lg rounded mt-2 max-h-[80vh] overflow-y-auto"
              ref={dropdownRef}>
              {/* Step 1: Categories */}
              {step === 1 &&
                categoryData?.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setLocalSelection({
                        category,
                        subcategory: null,
                        childCategory: null,
                        item: null,
                      });
                      setStep(2);
                    }}>
                    <span>{category.name}</span>
                    <FaArrowRight className="text-gray-400" />
                  </div>
                ))}

              {/* Step 2: Subcategories */}
              {step === 2 && localSelection.category && (
                <>
                  <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                    <FaArrowLeft
                      onClick={() => {
                        setStep(1);
                        setLocalSelection({
                          category: null,
                          subcategory: null,
                          childCategory: null,
                          item: null,
                        });
                      }}
                      className="cursor-pointer text-gray-600"
                    />
                    <span className="flex-1 text-center font-medium">
                      {localSelection.category.name}
                    </span>
                    <span className="w-5" />
                  </div>

                  {localSelection.category.subCategories?.map((subcat) => (
                    <div
                      key={subcat.id}
                      className="flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setLocalSelection((prev) => ({
                          ...prev,
                          subcategory: subcat,
                          childCategory: null,
                          item: null,
                        }));
                        setStep(3);
                      }}>
                      <span>{subcat.name}</span>
                      <FaArrowRight className="text-gray-400" />
                    </div>
                  ))}
                </>
              )}

              {/* Step 3: Child Categories */}
              {step === 3 && localSelection.subcategory && (
                <>
                  <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                    <FaArrowLeft
                      onClick={() => {
                        setStep(2);
                        setLocalSelection((prev) => ({
                          ...prev,
                          childCategory: null,
                          item: null,
                        }));
                      }}
                      className="cursor-pointer text-gray-600"
                    />
                    <span className="flex-1 text-center font-medium">
                      {localSelection.subcategory.name}
                    </span>
                    <span className="w-5" />
                  </div>

                  {localSelection.subcategory.childCategories?.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setLocalSelection((prev) => ({
                          ...prev,
                          childCategory: child,
                          item: null,
                        }));
                        setStep(4);
                      }}>
                      <span>{child.name}</span>
                      <FaArrowRight className="text-gray-400" />
                    </div>
                  ))}
                </>
              )}

              {/* Step 4: Items */}
              {step === 4 && localSelection.childCategory && (
                <>
                  <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                    <FaArrowLeft
                      onClick={() => {
                        setStep(3);
                        setLocalSelection((prev) => ({
                          ...prev,
                          item: null,
                        }));
                      }}
                      className="cursor-pointer text-gray-600"
                    />
                    <span className="flex-1 text-center font-medium">
                      {localSelection.childCategory.name}
                    </span>
                    <span className="w-5" />
                  </div>

                  {/* All Option */}
                  <div
                    className="flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setLocalSelection((prev) => ({
                        ...prev,
                        item: {
                          id: localSelection.childCategory.id,
                          name: "All",
                        },
                      }));
                      setOpen(false);
                    }}>
                    <span>All</span>
                    {localSelection.item?.id ===
                      localSelection.childCategory.id &&
                    localSelection.item?.name === "All" ? (
                      <MdRadioButtonChecked className="text-teal-600" />
                    ) : (
                      <MdRadioButtonUnchecked className="text-teal-600" />
                    )}
                  </div>

                  {/* Items */}
                  {localSelection.childCategory.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setLocalSelection((prev) => ({
                          ...prev,
                          item,
                        }));
                        setOpen(false);
                      }}>
                      <span>{item.name}</span>
                      {localSelection.item?.id === item.id ? (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {/* Size */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("size")}
              </label>
              <select
                value={localFilters.size}
                onChange={(e) => handleChange("size", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded shadow-sm focus:outline-none bg-white">
                <option value="">{t("selectSize")}</option>
                {sizes.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("brand")}
              </label>
              <select
                value={localFilters.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded shadow-sm focus:outline-none bg-white">
                <option value="">{t("selectBrand")}</option>
                {brands.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("color")}
              </label>
              <select
                value={localFilters.color}
                onChange={(e) => handleChange("color", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded shadow-sm focus:outline-none bg-white">
                <option value="">{t("selectColor")}</option>
                {colors.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("condition")}
              </label>
              <select
                value={localFilters.condition}
                onChange={(e) => handleChange("condition", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded shadow-sm focus:outline-none bg-white">
                <option value="">{t("selectCondition")}</option>
                {conditions.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("material")}
              </label>
              <select
                value={localFilters.material}
                onChange={(e) => handleChange("material", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded shadow-sm focus:outline-none bg-white">
                <option value="">{t("selectMaterial")}</option>
                {materials.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("sort_by")}
              </label>
              <select
                value={localFilters.sortBy}
                onChange={(e) => handleChange("sortBy", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded shadow-sm focus:outline-none bg-white">
                <option value="">Select</option>
                {sortOptions.map((opt) => (
                  <option className="" key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("min-price")}
              </label>
              <input
                type="number"
                value={localFilters.priceFrom}
                onChange={(e) => handleChange("priceFrom", e.target.value)}
                placeholder="$0"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                {t("max-price")}
              </label>
              <input
                type="number"
                value={localFilters.priceTo}
                onChange={(e) => handleChange("priceTo", e.target.value)}
                placeholder="$999"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
            {t("cancel")}
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
            {t("apply")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
