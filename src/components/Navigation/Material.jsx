import React, { useEffect, useRef, useState } from "react";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setMaterial } from "../../redux/slices/FilterSlice";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";

const materials = [
  "Acrylic", "Alpaca", "Bamboo", "Canvas", "Cardboard", "Cashmere", "Ceramic", "Chiffon",
  "Corduroy", "Cotton", "Denim", "Down", "Elastane", "Faux fur", "Faux leather", "Felt",
  "Flannel", "Fleece", "Foam", "Glass", "Gold", "Jute", "Lace", "Latex", "Leather", "Linen",
  "Merino", "Mesh", "Metal", "Mohair", "Neoprene", "Nylon", "Paper", "Patent leather",
  "Plastic", "Polyester", "Porcelain", "Rattan", "Rayon", "Rubber", "Satin", "Sequin",
  "Silicone", "Silk", "Silver", "Steel", "Stone", "Straw", "Suede", "Tulle", "Tweed",
  "Velour", "Velvet", "Wood", "Wool"
];

export default function MaterialSelector() {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
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
    setSelectedMaterial(null);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
      >
        {t('material')}
        {open ? (
          <LuChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <LuChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 w-80 bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
          {materials.map((mat) => (
            <div
              key={mat}
              className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                dispatch(setMaterial(mat));
                setSelectedMaterial(mat);
                setOpen(false);
              }}
            >
              <span>{mat}</span>
              {selectedMaterial === mat ? (
                <MdRadioButtonChecked className="text-teal-600" />
              ) : (
                <MdRadioButtonUnchecked className="text-teal-600" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* {selectedMaterial && (
        <button className="border px-4 py-2 rounded-full bg-white shadow mt-3 flex items-center min-w-[100px]">
          <span>{selectedMaterial}</span>
          <FaTimes className="ml-2 cursor-pointer text-gray-600" onClick={reset} size={16} />
        </button>
      )} */}
    </div>
  );
}
