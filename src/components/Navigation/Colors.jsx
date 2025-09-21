import React, { useEffect, useRef, useState } from "react";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setColor } from "../../redux/slices/FilterSlice";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";

const colors = [
    "Black", "Blue", "White", "Multi", "Gray", "Pink", "Brown", "Red",
    "Green", "Beige", "Silver", "Gold", "Cream", "Navy", "Purple", "Yellow",
    "Orange", "Light blue", "Khaki", "Rose", "Burgundy", "Turquoise",
    "Dark green", "Lilac", "Coral", "Apricot", "Mint", "Mustard"
];

// Map color names to actual color values
const colorMap = {
    Black: "#000000", Blue: "#0000FF", White: "#FFFFFF", Multi: "linear-gradient(45deg, red, blue, yellow)",
    Gray: "#808080", Pink: "#FFC0CB", Brown: "#A52A2A", Red: "#FF0000", Green: "#008000", Beige: "#F5F5DC",
    Silver: "#C0C0C0", Gold: "#FFD700", Cream: "#FFFDD0", Navy: "#000080", Purple: "#800080", Yellow: "#FFFF00",
    Orange: "#FFA500", "Light blue": "#ADD8E6", Khaki: "#F0E68C", Rose: "#FF007F", Burgundy: "#800020",
    Turquoise: "#40E0D0", "Dark green": "#006400", Lilac: "#C8A2C8", Coral: "#FF7F50", Apricot: "#FBCEB1",
    Mint: "#98FF98", Mustard: "#FFDB58"
};

export default function ColorSelectorList() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const [selectedColor, setSelectedColor] = useState(null);
    const [open, setOpen] = useState(false);
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

    const reset = () => setSelectedColor(null);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
            >
                {t('color')}
                {open ? (
                    <LuChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                    <LuChevronDown className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {open && (
                <div className="absolute z-10 bg-white shadow-lg rounded mt-2 w-80 max-h-96 overflow-y-auto">
                    {colors.map((color) => (
                        <div
                            key={color}
                            className="flex items-center justify-between px-4 py-2 border-b cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                                setSelectedColor(color);
                                dispatch(setColor(color));
                                setOpen(false);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Color Circle */}
                                <div
                                    className="w-6 h-6 rounded-full border"
                                    style={{
                                        background:
                                            color === "Multi" ? colorMap[color] : undefined,
                                        backgroundColor:
                                            color !== "Multi" ? colorMap[color] : undefined
                                    }}
                                ></div>
                                {/* Color Name */}
                                <span>{color}</span>
                            </div>

                            {/* Radio Button */}
                            {selectedColor === color ? (
                                <MdRadioButtonChecked className="text-teal-600" />
                            ) : (
                                <MdRadioButtonUnchecked className="text-teal-600" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* {selectedColor && (
                <button className="border px-4 py-2 rounded-full bg-white shadow mt-3 flex items-center min-w-[100px]">
                    <span>{selectedColor}</span>
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
