import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setBrand } from "../../redux/slices/FilterSlice";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";

export const brandCategories = {
  topBrands: ["Nike", "Adidas", "Zara", "H&M", "Puma", "No label"],
  allBrands: [
    "Nike", "Adidas", "Zara", "H&M", "Puma",
    "Gucci", "Levis", "Uniqlo", "Under Armour", "Reebok", "No label"
  ],
};


export default function BrandCategory() {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const reset = () => {
    setSelectedBrand(null);
    setSearchTerm("");
  };

  const filteredBrands = brandCategories.allBrands.filter((brand) =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    dispatch(setBrand(brand));
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
      >
        {t('brand')}
        {open ? (
          <LuChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <LuChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 w-80 bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
          {/* Search input */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search for brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none hover:border-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Show "Add brand" option if search term is not in the list */}
          {searchTerm && !brandCategories.allBrands.some(brand => brand.toLowerCase() === searchTerm.toLowerCase()) && (
            <div
              className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer bg-blue-50"
              onClick={() => handleBrandSelect(searchTerm)}
            >
              <span>Add "{searchTerm}"</span>
              <MdRadioButtonUnchecked className="text-teal-600" />
            </div>
          )}

          {/* Filtered brand list */}
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <div
                key={brand}
                className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleBrandSelect(brand)}
              >
                <span>{brand}</span>
                {selectedBrand === brand ? (
                  <MdRadioButtonChecked className="text-teal-600" />
                ) : (
                  <MdRadioButtonUnchecked className="text-teal-600" />
                )}
              </div>
            ))
          ) : searchTerm ? (
            <div className="p-3 text-gray-500 text-sm text-center">No brands found.</div>
          ) : (
            <div className="p-3 text-gray-500 text-sm text-center">Start typing to search or add a new brand</div>
          )}
        </div>
      )}

      {/* {selectedBrand && (
        <button className="border px-4 py-2 rounded-full bg-white shadow mt-3 flex items-center min-w-[100px]">
          <span>{selectedBrand}</span>
          <FaTimes
            className="ml-2 cursor-pointer text-gray-600"
            onClick={reset}
            size={16}
          />
        </button>
      )} */}
    </div>
  );
}