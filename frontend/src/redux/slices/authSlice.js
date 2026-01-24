import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apiIntercepter.js';
import { toast } from 'react-toastify';

// Async thunks
export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('api/v1/me');
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (navigate, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/logout');
            // toast.success(data.message);
            navigate('/login');
            return data;
        } catch (error) {
            // toast.error('Something went wrong');
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuth: false,
        loading: true,
        error: null,
    },
    reducers: {
        setAuth: (state, action) => {
            state.isAuth = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch User
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuth = true;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuth = false;
                state.error = action.payload;
            })
            // Logout User
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuth = false;
            });
    },
});

export const { setAuth, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;