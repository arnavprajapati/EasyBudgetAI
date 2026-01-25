import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setCSRFToken } from '../../apiIntercepter.js';
import { toast } from 'react-toastify';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

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
            
            try {
                await signOut(auth);
            } catch (firebaseError) {
                console.warn('Firebase signOut warning:', firebaseError);
            }
            
            navigate('/login');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async (idToken, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/google-auth', { idToken });
            
            if (data.sessionInfo?.csrfToken) {
                setCSRFToken(data.sessionInfo.csrfToken);
            }
            
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Google Sign-In failed');
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
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuth = false;
            })
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuth = true;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setAuth, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;