import React, { useEffect, useRef, useState } from "react";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setSortBy } from "../../redux/slices/FilterSlice";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";

const sortOptions = [
  "Newest first",
  "Oldest first",
  "Price: Low to High",
  "Price: High to Low",
  "Relevance",
];

export default function SortBySelector() {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(null);
  const dropdownRef = useRef(null);

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
    setSelectedSort(null);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
      >
        {t('sort_by')}
        {open ? (
          <LuChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <LuChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 w-72 bg-white shadow-lg rounded mt-2">
          {sortOptions.map((option) => (
            <div
              key={option}
              className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                dispatch(setSortBy(option));
                setSelectedSort(option);
                setOpen(false);
              }}
            >
              <span>{option}</span>
              {selectedSort === option ? (
                <MdRadioButtonChecked className="text-teal-600" />
              ) : (
                <MdRadioButtonUnchecked className="text-teal-600" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* {selectedSort && (
        <button className="border px-4 py-2 rounded-full bg-white shadow mt-3 flex items-center min-w-[100px]">
          <span>{selectedSort}</span>
          <FaTimes className="ml-2 cursor-pointer text-gray-600" onClick={reset} size={16} />
        </button>
      )} */}
    </div>
  );
}
