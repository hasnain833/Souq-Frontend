import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from 'react-icons/md';
import { User, Scissors, Smile, Home as HomeIcon, Palette } from "lucide-react";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { getAllCategory } from '../../api/ProductService';
import { useTranslation } from 'react-i18next';

const categoryIcons = {
  women: <User size={18} className="text-teal-600" />,
  men: <Scissors size={18} className="text-teal-600" />,
  kids: <Smile size={18} className="text-teal-600" />,
  home: <HomeIcon size={18} className="text-teal-600" />,
  beauty: <Palette size={18} className="text-teal-600" />,
};

const CategorySelector = ({ category, onChange, onSubcategoryChange }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategory();
        const rawCategories = res.data?.data || [];

        const formatted = rawCategories.map(cat => ({
          id: cat._id,
          name: cat.name,
          subcategories: cat.subCategories.map(sub => ({
            id: sub._id,
            name: sub.name,
            childCategories: sub.childCategories.map(child => ({
              id: child._id,
              name: child.name,
              items: child.items.map(item => ({
                id: item._id,
                name: item.name,
              })),
            })),
          })),
        }));

        setCategories(formatted);

        if (category) {
          outerLoop:
          for (const cat of formatted) {
            if (cat.id === category) {
              setSelectedCategory(cat);
              setSelectedSubcategory(null);
              setSelectedChildCategory(null);
              setSelectedItem(null);
              break;
            }
            for (const sub of cat.subcategories) {
              if (sub.id === category) {
                setSelectedCategory(cat);
                setSelectedSubcategory(sub);
                setSelectedChildCategory(null);
                setSelectedItem(null);
                break outerLoop;
              }
              for (const child of sub.childCategories) {
                if (child.id === category) {
                  setSelectedCategory(cat);
                  setSelectedSubcategory(sub);
                  setSelectedChildCategory(child);
                  setSelectedItem(null);
                  break outerLoop;
                }
                for (const item of child.items) {
                  if (item.id === category) {
                    setSelectedCategory(cat);
                    setSelectedSubcategory(sub);
                    setSelectedChildCategory(child);
                    setSelectedItem(item);
                    break outerLoop;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [category]);

  // useEffect(() => {
  //   if (onSubcategoryChange) {
  //     onSubcategoryChange(selectedChildCategory);
  //   }
  // }, [selectedChildCategory]);

  useEffect(() => {
    if (onSubcategoryChange) {
      onSubcategoryChange({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        childCategory: selectedChildCategory,
        item: selectedItem
      });
    }
  }, [selectedCategory, selectedSubcategory, selectedChildCategory, selectedItem]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayText = () => {
    if (selectedCategory && selectedSubcategory && selectedChildCategory && selectedItem) {
      return `${selectedCategory.name} › ${selectedSubcategory.name} › ${selectedChildCategory.name} › ${selectedItem.name}`;
    }
    if (selectedCategory && selectedSubcategory && selectedChildCategory) {
      return `${selectedCategory.name} › ${selectedSubcategory.name} › ${selectedChildCategory.name}`;
    }
    if (selectedCategory && selectedSubcategory) {
      return `${selectedCategory.name} › ${selectedSubcategory.name}`;
    }
    if (selectedCategory) {
      return `${selectedCategory.name}`;
    }
    return t("selectCategory");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors duration-200"
        onClick={() => setOpen(true)}
      >
        <span className={selectedCategory ? 'text-black' : 'text-gray-500'}>
          {getDisplayText()}
        </span>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {open && (
        <div className="absolute z-10 w-full bg-white shadow-lg rounded mt-2 max-h-[400px] overflow-auto">
          {/* Step 1: Categories */}
          {step === 1 && categories.map(cat => (
            <div key={cat.id}>
              <div
                className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubcategory(null);
                  setSelectedChildCategory(null);
                  setSelectedItem(null);

                  if (!cat.subcategories || cat.subcategories.length === 0) {
                    onChange(cat.id);
                    setOpen(false);
                    return;
                  }

                  setStep(2);
                }}
              >
                <div className="flex items-center gap-2">
                  {categoryIcons[cat.name.toLowerCase()] || <span className="text-gray-400">❓</span>}
                  <span>{cat.name}</span>
                </div>
                {(cat.subcategories && cat.subcategories.length > 0) ? (
                  <FaArrowRight className="text-gray-400" />
                ) : (
                  selectedCategory?.id === cat.id ? (
                    <MdRadioButtonChecked className="text-teal-600" />
                  ) : (
                    <MdRadioButtonUnchecked className="text-teal-600" />
                  )
                )}
              </div>
            </div>
          ))}

          {/* Step 2: Subcategories */}
          {step === 2 && selectedCategory && (
            <>
              <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                <FaArrowLeft
                  className="cursor-pointer text-gray-600"
                  onClick={() => setStep(1)}
                />
                <span className="text-center flex-1 font-medium">
                  {selectedCategory.name}
                </span>
                <span className="w-5" />
              </div>

              {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 ? (
                selectedCategory.subcategories.map(sub => (
                  <div key={sub.id}>
                    <div
                      className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedSubcategory(sub);
                        setSelectedChildCategory(null);
                        setSelectedItem(null);

                        if (!sub.childCategories || sub.childCategories.length === 0) {
                          onChange(sub.id);
                          setOpen(false);
                          return;
                        }

                        setStep(3);
                      }}
                    >
                      <span>{sub.name}</span>
                      {(sub.childCategories && sub.childCategories.length > 0) ? (
                        <FaArrowRight className="text-gray-400" />
                      ) : (
                        selectedSubcategory?.id === sub.id ? (
                          <MdRadioButtonChecked className="text-teal-600" />
                        ) : (
                          <MdRadioButtonUnchecked className="text-teal-600" />
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onChange(selectedCategory.id);
                    setOpen(false);
                  }}
                >
                  <span>{selectedCategory.name}</span>
                  {selectedCategory && selectedCategory.id ? (
                    <MdRadioButtonChecked className="text-teal-600" />
                  ) : (
                    <MdRadioButtonUnchecked className="text-teal-600" />
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 3: Child Categories */}
          {step === 3 && selectedSubcategory && (
            <>
              <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                <FaArrowLeft
                  className="cursor-pointer text-gray-600"
                  onClick={() => setStep(2)}
                />
                <span className="text-center flex-1 font-medium">
                  {selectedSubcategory.name}
                </span>
                <span className="w-5" />
              </div>

              {selectedSubcategory.childCategories && selectedSubcategory.childCategories.length > 0 ? (
                selectedSubcategory.childCategories.map(child => (
                  <div key={child.id}>
                    <div
                      className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedChildCategory(child);
                        setSelectedItem(null);

                        if (!child.items || child.items.length === 0) {
                          onChange(child.id);
                          setOpen(false);
                          return;
                        }

                        setStep(4);
                      }}
                    >
                      <span>{child.name}</span>
                      {(child.items && child.items.length > 0) ? (
                        <FaArrowRight className="text-gray-400" />
                      ) : (
                        selectedChildCategory?.id === child.id ? (
                          <MdRadioButtonChecked className="text-teal-600" />
                        ) : (
                          <MdRadioButtonUnchecked className="text-teal-600" />
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onChange(selectedSubcategory.id);
                    setOpen(false);
                  }}
                >
                  <span>{selectedSubcategory.name}</span>
                  {selectedSubcategory && selectedSubcategory.id ? (
                    <MdRadioButtonChecked className="text-teal-600" />
                  ) : (
                    <MdRadioButtonUnchecked className="text-teal-600" />
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 4: Items */}
          {step === 4 && selectedChildCategory && (
            <>
              <div className="flex items-center justify-between p-3 border-b bg-gray-100">
                <FaArrowLeft
                  className="cursor-pointer text-gray-600"
                  onClick={() => setStep(3)}
                />
                <span className="text-center flex-1 font-medium">
                  {selectedChildCategory.name}
                </span>
                <span className="w-5" />
              </div>

              {selectedChildCategory.items && selectedChildCategory.items.length > 0 ? (
                selectedChildCategory.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      onChange(item.id);
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
                ))
              ) : (
                <div
                  className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onChange(selectedChildCategory.id);
                    setOpen(false);
                  }}
                >
                  <span>{selectedChildCategory.name}</span>
                  {selectedChildCategory && selectedChildCategory.id ? (
                    <MdRadioButtonChecked className="text-teal-600" />
                  ) : (
                    <MdRadioButtonUnchecked className="text-teal-600" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;