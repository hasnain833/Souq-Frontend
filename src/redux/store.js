import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './slices/CategorySlice';
import filtersReducer from './slices/FilterSlice'; // import your filters slice
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from 'redux';
import profileReducer from './slices/ProfileSlice'; // import your filters slice
import categoryDataReducer from './slices/CategoryDataSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['category', 'filters', "profile", "categoryData"], // persist both slices
};

const rootReducer = combineReducers({
  category: categoryReducer,
  filters: filtersReducer,
  profile: profileReducer,
  categoryData: categoryDataReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);
