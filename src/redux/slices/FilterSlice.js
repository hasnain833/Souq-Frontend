// store/filtersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  brand: null,
  condition: null,
  color: null,
  price: {
    from: '',
    to: ''
  },
  material: null,
  sortBy: null,
  size: null, // added size here
  searchText: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setBrand(state, action) {
      state.brand = action.payload;
    },
    setSearchText(state, action) {
      state.searchText = action.payload;
    },
    setCondition(state, action) {
      state.condition = action.payload;
    },
    setColor(state, action) {
      state.color = action.payload;
    },
    setPrice(state, action) {
      // action.payload = { from: string, to: string }
      state.price = action.payload;
    },
    setMaterial(state, action) {
      state.material = action.payload;
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setSize(state, action) {    // new reducer for size
      state.size = action.payload;
    },
    resetFilters(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setBrand,
  setCondition,
  setSearchText,
  setColor,
  setPrice,
  setMaterial,
  setSortBy,
  setSize,       // export setSize
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
