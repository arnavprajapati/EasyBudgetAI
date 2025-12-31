import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import telegramReducer from './slices/telegramSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        telegram: telegramReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;