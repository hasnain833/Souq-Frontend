import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategory } from "../../api/ProductService"; // make sure this path is correct

// Async thunk to fetch and transform category data
export const fetchCategories = createAsyncThunk(
  "categoryData/fetchCategories",
  async (_, thunkAPI) => {
    try {
      const res = await getAllCategory();

      if (res?.data?.success) {
        // 🔁 Transform the API response
        const transformed = res.data.data.map((cat) => ({
          id: cat._id,
          name: cat.name,
          subCategories: cat.subCategories.map((sub) => ({
            id: sub._id,
            name: sub.name,
            slug: sub.slug,
            childCategories: sub.childCategories.map((child) => ({
              id: child._id,
              name: child.name,
              items: child.items.map((item) => ({
                id: item._id,
                name: item.name,
              })),
            })),
          })),
        }));

        return transformed;
      }

      return thunkAPI.rejectWithValue("Failed to fetch categories");
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Slice definition
const categoryDataSlice = createSlice({
  name: "categoryData",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCategories: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // already transformed
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearCategories } = categoryDataSlice.actions;
export default categoryDataSlice.reducer;
