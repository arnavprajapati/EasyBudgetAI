import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apiIntercepter.js';
import { toast } from 'react-toastify';

export const fetchTelegramStatus = createAsyncThunk(
    'telegram/fetchStatus',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/v1/telegram/status');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch status');
        }
    }
);

export const generateTelegramOTP = createAsyncThunk(
    'telegram/generateOTP',
    async (telegramUsername, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/telegram/generate-otp', {
                telegramUsername: telegramUsername
            });
            toast.success('OTP generated! Check your Telegram bot.');
            return data;
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Failed to generate OTP');
            return rejectWithValue(error.response?.data?.message || 'Failed to generate OTP');
        }
    }
);

export const verifyTelegramOTP = createAsyncThunk(
    'telegram/verifyOTP',
    async (otp, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/telegram/verify-otp', {
                otp: otp
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
        }
    }
);

export const unlinkTelegram = createAsyncThunk(
    'telegram/unlink',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/telegram/unlink');
            // toast.success(data.message);
            return data;
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Failed to unlink');
            return rejectWithValue(error.response?.data?.message || 'Failed to unlink');
        }
    }
);

const telegramSlice = createSlice({
    name: 'telegram',
    initialState: {
        linked: false,
        telegramUsername: null,
        telegramLinkedAt: null,
        botUsername: null,
        loading: true,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTelegramStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTelegramStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.linked = action.payload.linked;
                state.telegramUsername = action.payload.telegramUsername;
                state.telegramLinkedAt = action.payload.telegramLinkedAt;
                state.botUsername = action.payload.botUsername;
            })
            .addCase(fetchTelegramStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(generateTelegramOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateTelegramOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.botUsername = action.payload.botUsername;
            })
            .addCase(generateTelegramOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(verifyTelegramOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyTelegramOTP.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(verifyTelegramOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(unlinkTelegram.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unlinkTelegram.fulfilled, (state) => {
                state.loading = false;
                state.linked = false;
                state.telegramUsername = null;
                state.telegramLinkedAt = null;
            })
            .addCase(unlinkTelegram.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = telegramSlice.actions;
export default telegramSlice.reducer;