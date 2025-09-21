import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setCondition } from "../../redux/slices/FilterSlice";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";

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

export default function ConditionSelector() {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
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
    setSelectedCondition(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
      >
        {t('condition')}
        {open ? (
          <LuChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <LuChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 w-96 bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
          {conditions.map((condition) => (
            <div
              key={condition.label}
              className="flex items-start gap-2 p-3 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedCondition(condition.label);
                dispatch(setCondition(condition));
                setOpen(false);
              }}
            >
              {selectedCondition === condition.label ? (
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

      {/* {selectedCondition && (
        <button className="border px-4 py-2 rounded-full bg-white shadow mt-3 flex items-center min-w-[100px]">
          <span>{selectedCondition}</span>
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
