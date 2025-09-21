import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const HeaderCategories = ({ categoryData }) => {
  const {
    setIsMegaMenuOpen,
    activeCategory,
    setActiveCategory,
    isMegaMenuOpen
  } = useAppContext();

  useEffect(() => {
    if (!isMegaMenuOpen) {
      setActiveCategory(null)
    }
  }, [isMegaMenuOpen])

  const handleCategoryHover = (categoryId) => {
    if (activeCategory !== categoryId) {
      setActiveCategory(categoryId);
    }
    setIsMegaMenuOpen(true);
  };

  return (
    <nav className="flex items-center h-full" aria-label="Product categories">
      <ul className="flex space-x-6 rtl:space-x-reverse" role="menubar">
        {categoryData.map((category) => (
          <li
            key={category.id}
            className="relative group h-full flex items-center"
            onMouseEnter={() => handleCategoryHover(category.id)}
            role="none"
          >
            <button
              type="button"
              className={`text-sm font-medium transition-colors duration-200 py-1 ${activeCategory === category.id
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-700 hover:text-teal-600'
                }`}
              role="menuitem"
              aria-current={activeCategory === category.id ? 'page' : undefined}
              onFocus={() => handleCategoryHover(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HeaderCategories;
