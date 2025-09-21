import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import CategoryMegaMenu from '../../components/Navigation/Category';
import SizeCategorySelector from '../../components/Navigation/Size';
import BrandCategory from '../../components/Navigation/Brand';
import ConditionSelector from '../../components/Navigation/Condition';
import ColorSelector from '../../components/Navigation/Colors';
import PriceSelector from '../../components/Navigation/Price';
import MaterialSelector from '../../components/Navigation/Material';
import SortBySelector from '../../components/Navigation/SortBy';
import {
    setBrand,
    setCondition,
    setColor,
    setPrice,
    setMaterial,
    setSortBy,
    setSize,
    resetFilters,
    setSearchText, // assuming you added setSize action
} from '../../redux/slices/FilterSlice';
import { FaTimes } from 'react-icons/fa';
import { resetCategory } from '../../redux/slices/CategorySlice';
import { useTranslation } from 'react-i18next';

const Filter = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation()
    const filters = useSelector((state) => state.filters);
    const categorySelect = useSelector((state) => state.category)
    const { selectedCategory, selectedSubcategory, selectedChildCategory, selectedItem } = categorySelect || {};

    const clearFilter = (filterName) => {
        switch (filterName) {
            case 'searchText':
                dispatch(setSearchText(null));
                break;
            case 'size':
                dispatch(setSize(null));
                break;
            case 'brand':
                dispatch(setBrand(null));
                break;
            case 'condition':
                dispatch(setCondition(null));
                break;
            case 'color':
                dispatch(setColor(null));
                break;
            case 'price':
                dispatch(setPrice({ from: '', to: '' }));
                //  dispatch(setPrice(null));
                break;
            case 'material':
                dispatch(setMaterial(null));
                break;
            case 'sortBy':
                dispatch(setSortBy(null));
                break;
            case 'category':
                dispatch(resetCategory()); // <-- Add this line
                break;
            default:
                break;
        }
    };

    const activeFilters = [];

    if (filters.brand) activeFilters.push({ name: 'Brand', value: filters.brand, key: 'brand' });
    if (filters.condition) activeFilters.push({ name: 'Condition', value: filters.condition.label, key: 'condition' });
    if (filters.color) activeFilters.push({ name: 'Color', value: filters.color, key: 'color' });
    if (filters.size) activeFilters.push({ name: 'Size', value: filters.size, key: 'size' });
    if (filters.material) activeFilters.push({ name: 'Material', value: filters.material, key: 'material' });
    if (filters.sortBy) activeFilters.push({ name: 'Sort By', value: filters.sortBy, key: 'sortBy' });
    if (filters.searchText) activeFilters.push({ name: 'Search', value: filters.searchText, key: 'searchText' });

    // if (filters.price) activeFilters.push({ name: 'Price', value: filters.price, key: 'price' });
    if (filters.price.from || filters.price.to) {
        const priceValue = `${filters.price.from || 'Min'} - ${filters.price.to || 'Max'}`;
        activeFilters.push({ name: 'Price', value: priceValue, key: 'price' });
    }

    const selectedCategoryLabel =
        selectedItem?.id !== "all" && selectedItem?.name
            ? selectedItem.name
            : selectedChildCategory?.id !== "all" && selectedChildCategory?.name
                ? selectedChildCategory.name
                : selectedSubcategory?.id !== "all" && selectedSubcategory?.name
                    ? selectedSubcategory.name
                    : selectedCategory?.id !== "all" && selectedCategory?.name
                        ? selectedCategory.name
                        : null;

    if (selectedCategoryLabel) {
        activeFilters.push({
            name: "Category",
            value: selectedCategoryLabel,
            key: "category",
        });
    }

    return (
        <div className="container mx-auto px-4">
            <div className="hidden md:flex flex-wrap gap-4 items-center">
                <CategoryMegaMenu />
                <SizeCategorySelector />
                <BrandCategory />
                <ConditionSelector />
                <ColorSelector />
                <PriceSelector />
                <MaterialSelector />
                <SortBySelector />
            </div>
            <div className="mt-3">
                {activeFilters.length > 0 && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                        {/* Filters List */}
                        <div className="flex flex-wrap md:flex-nowrap gap-2 overflow-x-auto max-w-full">
                            {activeFilters.map(({ name, value, key }) => (
                                <div
                                    key={key}
                                    className="flex-shrink-0 border px-4 py-2 rounded-full bg-gray-100 shadow flex items-center max-w-full"
                                >
                                    <span className="mr-2 font-semibold rtl:ml-2">{name} {" "}:</span>
                                    <span className="truncate">{value}</span>
                                    <FaTimes
                                        className="ml-2 cursor-pointer text-gray-600 rtl:mr-2"
                                        onClick={() => clearFilter(key)}
                                        size={16}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Clear All Button */}
                        <div className="flex justify-end md:justify-start">
                            <button
                                onClick={() => {
                                    dispatch(resetFilters());
                                    dispatch(resetCategory());
                                }}
                                className="px-4 py-2 rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                            >
                                {t("clear-all")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Filter