import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar: React.FC = () => {
  const [expanded, setExpanded] = useState({
    price: true,
    size: true,
    brand: true,
    condition: false,
    color: false,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">Filters</h2>
        <button className="text-sm text-teal-600 hover:text-teal-700">
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          className="flex items-center justify-between w-full py-2"
          onClick={() => toggleSection('price')}
        >
          <span className="font-medium">Price range</span>
          {expanded.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expanded.price && (
          <div className="mt-3 space-y-3">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Min"
                  className="w-full py-2 px-3 border border-gray-200 rounded-md"
                />
                <span className="absolute left-3 top-2 text-gray-400">$</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Max"
                  className="w-full py-2 px-3 border border-gray-200 rounded-md"
                />
                <span className="absolute left-3 top-2 text-gray-400">$</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Size */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          className="flex items-center justify-between w-full py-2"
          onClick={() => toggleSection('size')}
        >
          <span className="font-medium">Size</span>
          {expanded.size ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expanded.size && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button
                key={size}
                className="py-1 px-2 border border-gray-200 rounded-md text-sm hover:border-teal-500 hover:bg-teal-50"
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          className="flex items-center justify-between w-full py-2"
          onClick={() => toggleSection('brand')}
        >
          <span className="font-medium">Brand</span>
          {expanded.brand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expanded.brand && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search brands"
                className="w-full py-2 pl-8 pr-3 border border-gray-200 rounded-md"
              />
              <X className="absolute right-2 top-2.5 text-gray-400 cursor-pointer" size={16} />
            </div>
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {['Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Levi\'s'].map((brand) => (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Condition */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          className="flex items-center justify-between w-full py-2"
          onClick={() => toggleSection('condition')}
        >
          <span className="font-medium">Condition</span>
          {expanded.condition ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expanded.condition && (
          <div className="mt-3 space-y-2">
            {['New with tags', 'Like new', 'Good', 'Fair'].map((condition) => (
              <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">{condition}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="pb-2">
        <button
          className="flex items-center justify-between w-full py-2"
          onClick={() => toggleSection('color')}
        >
          <span className="font-medium">Color</span>
          {expanded.color ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {expanded.color && (
          <div className="mt-3 grid grid-cols-6 gap-2">
            {[
              { name: 'Black', color: 'bg-black' },
              { name: 'White', color: 'bg-white border border-gray-200' },
              { name: 'Red', color: 'bg-red-500' },
              { name: 'Blue', color: 'bg-blue-500' },
              { name: 'Green', color: 'bg-green-500' },
              { name: 'Yellow', color: 'bg-yellow-400' },
              { name: 'Purple', color: 'bg-purple-500' },
              { name: 'Pink', color: 'bg-pink-400' },
              { name: 'Gray', color: 'bg-gray-400' },
              { name: 'Brown', color: 'bg-amber-700' },
              { name: 'Orange', color: 'bg-orange-500' },
              { name: 'Beige', color: 'bg-amber-100' },
            ].map((color) => (
              <button
                key={color.name}
                title={color.name}
                className={`w-full aspect-square rounded-full ${color.color} hover:ring-2 hover:ring-teal-500 hover:ring-offset-1`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;