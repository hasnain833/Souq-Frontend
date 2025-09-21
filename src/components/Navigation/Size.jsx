// import React, { useEffect, useRef, useState } from "react";
// import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
// import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
// import { sizeCategories } from "../../data/sizeCategories";
// import { setSize } from "../../redux/slices/FilterSlice";
// import { useDispatch } from "react-redux";
// import { LuChevronDown, LuChevronUp } from "react-icons/lu";
// import { useTranslation } from "react-i18next";

// export default function SizeCategory() {
//   const { t } = useTranslation();
//   const dispatch = useDispatch()
//   const [open, setOpen] = useState(false);
//   const [step, setStep] = useState(1);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedSubcategory, setSelectedSubcategory] = useState(null);
//   const [selectedSize, setSelectedSize] = useState(null);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const reset = () => {
//     setStep(1);
//     setSelectedCategory(null);
//     setSelectedSubcategory(null);
//     setSelectedSize(null);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setOpen(!open)}
//         className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
//       >
//         {t('size')}
//         {open ? (
//           <LuChevronUp className="w-5 h-5 text-gray-600" />
//         ) : (
//           <LuChevronDown className="w-5 h-5 text-gray-600" />
//         )}
//       </button>

//       {open && (
//         <div className="absolute z-10 w-80 bg-white shadow-lg rounded mt-2">
//           {step === 1 &&
//             sizeCategories.map((cat) => (
//               <div
//                 key={cat.id}
//                 className="flex justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
//                 onClick={() => {
//                   setSelectedCategory(cat);
//                   setStep(2);
//                 }}
//               >
//                 <span>{cat.name}</span>
//                 <FaArrowRight className="text-gray-400" />
//               </div>
//             ))}

//           {step === 2 && selectedCategory && (
//             <>
//               <div className="flex justify-between items-center p-3 border-b bg-gray-100">
//                 <FaArrowLeft className="cursor-pointer" onClick={reset} />
//                 <span className="flex-1 text-center font-medium">{selectedCategory.name}</span>
//                 <span className="w-5" />
//               </div>

//               {selectedCategory.subcategories.map((sub) => (
//                 <div
//                   key={sub.id}
//                   className="flex justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
//                   onClick={() => {
//                     setSelectedSubcategory(sub);
//                     setStep(3);
//                   }}
//                 >
//                   <span>{sub.name}</span>
//                   <FaArrowRight className="text-gray-400" />
//                 </div>
//               ))}
//             </>
//           )}

//           {step === 3 && selectedSubcategory && (
//             <>
//               <div className="flex justify-between items-center p-3 border-b bg-gray-100">
//                 <FaArrowLeft className="cursor-pointer" onClick={() => setStep(2)} />
//                 <span className="flex-1 text-center font-medium">{selectedSubcategory.name}</span>
//                 <span className="w-5" />
//               </div>

//               {selectedSubcategory.sizes.map((size) => (
//                 <div
//                   key={size}
//                   className="flex justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
//                   onClick={() => {
//                     setSelectedSize(size);
//                     dispatch(setSize(size));
//                     setOpen(false);
//                   }}
//                 >
//                   <span>{size}</span>
//                   {selectedSize === size ? (
//                     <MdRadioButtonChecked className="text-teal-600" />
//                   ) : (
//                     <MdRadioButtonUnchecked className="text-teal-600" />
//                   )}
//                 </div>
//               ))}
//             </>
//           )}
//         </div>
//       )}

//       {/* {selectedSize && (
//         <button className="border px-4 py-2 rounded-full bg-white shadow mt-3 flex items-center min-w-[100px]">
//           <span>{selectedSize}</span>
//           <FaTimes className="ml-2 cursor-pointer text-gray-600" onClick={reset} size={16} />
//         </button>
//       )} */}
//     </div>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { setSize } from "../../redux/slices/FilterSlice";
import { useDispatch, useSelector } from "react-redux";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { getSize } from "../../api/ProductService"; // Import the API service
// Import category actions from Redux
import {
  setCategory,
  setSubcategory,
  setChildCategory,
  setItem,
} from "../../redux/slices/CategorySlice";

export default function SizeCategory() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [subcategorySizes, setSubcategorySizes] = useState([]); // Store sizes for the selected child category
  const [loadingSizes, setLoadingSizes] = useState(false); // Loading state for size fetching
  const dropdownRef = useRef(null);
  
  // Get the current size from Redux store
  const currentSize = useSelector((state) => state.filters.size);
  // Get category data from Redux store
  const categoryData = useSelector((state) => state.categoryData.data);
  // Get selected categories from Redux store
  const {
    selectedCategory: reduxSelectedCategory,
    selectedSubcategory: reduxSelectedSubcategory,
    selectedChildCategory: reduxSelectedChildCategory,
  } = useSelector((state) => state.category);

  const handleOpenSize = () => {
    if (!open) {
      // If no size is selected, determine which step to show based on Redux category state
      if (!currentSize) {
        if (!reduxSelectedCategory) {
          setStep(1);
        } else if (reduxSelectedChildCategory) {
          // Set local state to match Redux state
          setSelectedCategory(reduxSelectedCategory);
          setSelectedSubcategory(reduxSelectedSubcategory);
          setSelectedChildCategory(reduxSelectedChildCategory);
          setStep(4);
        } else if (reduxSelectedSubcategory) {
          // Set local state to match Redux state
          setSelectedCategory(reduxSelectedCategory);
          setSelectedSubcategory(reduxSelectedSubcategory);
          setStep(3);
        } else if (reduxSelectedCategory) {
          // Set local state to match Redux state
          setSelectedCategory(reduxSelectedCategory);
          setStep(2);
        } else {
          setStep(1);
        }
      }
      // If a size is selected, we'll show the category selection first (step 1)
      // but we'll keep the selected size in state
    }
    setOpen(!open);
  };

  useEffect(() => {
    // If there's already a selected size in Redux, set it
    if (currentSize) {
      setSelectedSize(currentSize);
    }
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentSize]);

  const reset = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedChildCategory(null);
    setSelectedSize(null);
    setSubcategorySizes([]);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    dispatch(setSize(size));
    
    // Only update Redux category state when a size is actually selected
    if (selectedCategory) {
      dispatch(setCategory(selectedCategory));
      if (selectedSubcategory) {
        dispatch(setSubcategory(selectedSubcategory));
        if (selectedChildCategory) {
          dispatch(setChildCategory(selectedChildCategory));
        }
      }
    }
    
    setOpen(false);
  };

  // Transform category data to match the size selection structure
  const transformCategoryData = () => {
    if (!categoryData || categoryData.length === 0) return [];
    
    return categoryData.map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategories: cat.subCategories ? cat.subCategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        childCategories: sub.childCategories ? sub.childCategories.map((child) => ({
          id: child.id,
          name: child.name
        })) : []
      })) : []
    }));
  };

  const transformedCategories = transformCategoryData();

  // Fetch sizes when a child category is selected
  useEffect(() => {
    const fetchSizes = async () => {
      if (selectedChildCategory && selectedChildCategory.id) {
        setLoadingSizes(true);
        try {
          const response = await getSize(selectedChildCategory.id);
          if (response?.success && response?.data?.sizes) {
            setSubcategorySizes(response.data.sizes);
          } else {
            setSubcategorySizes([]);
          }
        } catch (error) {
          console.error("Failed to fetch sizes:", error);
          setSubcategorySizes([]);
        } finally {
          setLoadingSizes(false);
        }
      }
    };

    fetchSizes();
  }, [selectedChildCategory]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenSize}
        className="border px-4 py-2 rounded-full bg-white shadow flex items-center gap-2 hover:ring-2 hover:ring-teal-500 transition-all duration-200"
      >
        {t('size')}
        {open ? (
          <LuChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <LuChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 w-80 bg-white shadow-lg rounded mt-2 max-h-96 overflow-y-auto">
          {step === 1 &&
            transformedCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedCategory(cat);
                  // Don't dispatch to Redux here, only set local state
                  setStep(2);
                }}
              >
                <span>{cat.name}</span>
                <FaArrowRight className="text-gray-400" />
              </div>
            ))}

          {step === 2 && selectedCategory && (
            <>
              <div className="flex justify-between items-center p-3 border-b bg-gray-100 sticky top-0">
                <FaArrowLeft className="cursor-pointer" onClick={reset} />
                <span className="flex-1 text-center font-medium">{selectedCategory.name}</span>
                <span className="w-5" />
              </div>

              {selectedCategory.subcategories && selectedCategory.subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="flex justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedSubcategory(sub);
                    // Don't dispatch to Redux here, only set local state
                    setStep(3);
                  }}
                >
                  <span>{sub.name}</span>
                  <FaArrowRight className="text-gray-400" />
                </div>
              ))}
            </>
          )}

          {step === 3 && selectedSubcategory && (
            <>
              <div className="flex justify-between items-center p-3 border-b bg-gray-100 sticky top-0">
                <FaArrowLeft 
                  className="cursor-pointer" 
                  onClick={() => {
                    setStep(2);
                    setSelectedChildCategory(null);
                  }} 
                />
                <span className="flex-1 text-center font-medium">{selectedSubcategory.name}</span>
                <span className="w-5" />
              </div>

              {selectedSubcategory.childCategories && selectedSubcategory.childCategories.map((child) => (
                <div
                  key={child.id}
                  className="flex justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedChildCategory(child);
                    // Don't dispatch to Redux here, only set local state
                    setStep(4);
                  }}
                >
                  <span>{child.name}</span>
                  <FaArrowRight className="text-gray-400" />
                </div>
              ))}
            </>
          )}

          {step === 4 && selectedChildCategory && (
            <>
              <div className="flex justify-between items-center p-3 border-b bg-gray-100 sticky top-0">
                <FaArrowLeft 
                  className="cursor-pointer" 
                  onClick={() => {
                    setStep(3);
                    setSubcategorySizes([]);
                  }} 
                />
                <span className="flex-1 text-center font-medium">{selectedChildCategory.name}</span>
                <span className="w-5" />
              </div>

              <div className="p-3">
                {loadingSizes ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading sizes...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {subcategorySizes && subcategorySizes.length > 0 ? (
                      subcategorySizes.map((size, index) => (
                        <div
                          key={index}
                          className={`p-2 border rounded text-center cursor-pointer transition-all duration-200 ${
                            selectedSize === size 
                              ? "border-teal-600 bg-teal-50 font-medium" 
                              : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSizeSelect(size)}
                        >
                          {size}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-4 text-gray-500">
                        No sizes available for this category
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* {selectedSize && (
        <button className="border px-4 py-2 rounded-full bg-white shadow mt-3 flex items-center min-w-[100px]">
          <span>{selectedSize}</span>
          <FaTimes 
            className="ml-2 cursor-pointer text-gray-600" 
            onClick={() => {
              setSelectedSize(null);
              dispatch(setSize(null));
            }} 
            size={16} 
          />
        </button>
      )} */}
    </div>
  );
}