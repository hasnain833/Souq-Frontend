import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCategory: null,
  selectedSubcategory: null,
  selectedChildCategory: null, // ✅ NEW
  selectedItem: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.selectedSubcategory = null;
      state.selectedChildCategory = null;
      state.selectedItem = null;
    },
    setSubcategory: (state, action) => {
      state.selectedSubcategory = action.payload;
      state.selectedChildCategory = null;
      state.selectedItem = null;
    },
    setChildCategory: (state, action) => {
      state.selectedChildCategory = action.payload;
      state.selectedItem = null;
    },
    setItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    resetCategory: (state) => {
      state.selectedCategory = null;
      state.selectedSubcategory = null;
      state.selectedChildCategory = null;
      state.selectedItem = null;
    },
  },
});

export const {
  setCategory,
  setSubcategory,
  setChildCategory, // ✅ NEW
  setItem,
  resetCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
