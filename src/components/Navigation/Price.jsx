import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setPrice } from "../../redux/slices/FilterSlice";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";

export default function PriceSelector() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);
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
    setPriceFrom("");
    setPriceTo("");
    setSelectedPrice(null);
    dispatch(setPrice({ from: "", to: "" }));
  };

  const applyPrice = () => {
    const fromValue = priceFrom || "";
    const toValue = priceTo || "";
    if (!fromValue && !toValue) {
      setSelectedPrice(null);
      dispatch(setPrice({ from: "", to: "" }));
    } else {
      dispatch(setPrice({ from: fromValue, to: toValue }));
      setSelectedPrice(`${fromValue || "Min"} - ${toValue || "Max"}`);
    }
    setPriceFrom("");
    setPriceTo("");
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
        >
          {t("price")}
          {open ? (
            <LuChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <LuChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

      </div>

      {open && (
        <div className="absolute z-20 mt-2 w-72 bg-white rounded-xl shadow-xl p-5 transition-all duration-300 animate-fadeIn">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{t("from")}</label>
              <input
                type="number"
                min="0"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                placeholder={t("min-price")}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{t("to")}</label>
              <input
                type="number"
                min="0"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                placeholder={t("max-price")}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="flex justify-between gap-3 mt-3">
              <button
                onClick={reset}
                className="w-1/2 border border-gray-300 rounded-sm py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                {t("reset")}
              </button>
              <button
                onClick={applyPrice}
                className="w-1/2 bg-teal-600 text-white rounded-sm py-2 text-sm hover:bg-teal-700"
              >
                {t("apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
