import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE}  from 'redux-persist';
import cartReducer from './cartSlice'

const customStorage = {
  getItem: (key) => {
    return Promise.resolve(window.localStorage.getItem(key));
  },

  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve()
  },

  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
 }
}

const persistConfig = {
  key: "root",
  storage : customStorage,
  whitelist: ['cart']
}

const rootReducer = combineReducers({
   cart : cartReducer,
});

const presistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: presistedReducer,
  middleware: (getDefaultMiddelware) => 
    getDefaultMiddelware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      }
    })
});

export const persistor = persistStore(store);