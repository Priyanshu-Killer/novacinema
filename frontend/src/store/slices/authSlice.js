import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const loadUser = () => {
  try {
    const token = localStorage.getItem('novacinema_token')
    const user  = localStorage.getItem('novacinema_user')
    return { token, user: user ? JSON.parse(user) : null }
  } catch { return { token: null, user: null } }
}

const { token, user } = loadUser()

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/auth/register', data); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed') }
})

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/auth/login', data); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed') }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/auth/me'); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try { const res = await api.put('/auth/profile', data); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            user,
    token:           token,
    isAuthenticated: !!token,
    loading:         false,
    error:           null
  },
  reducers: {
    logout: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem('novacinema_token')
      localStorage.removeItem('novacinema_user')
    },
    clearError:     (state) => { state.error = null },
    setCredentials: (state, action) => {
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
      state.loading         = false
      state.error           = null
    }
  },
  extraReducers: (builder) => {
    const authSuccess = (state, action) => {
      state.loading         = false
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
      state.error           = null
      localStorage.setItem('novacinema_token', action.payload.token)
      localStorage.setItem('novacinema_user', JSON.stringify(action.payload.user))
    }
    const authFail = (state, action) => {
      state.loading = false
      state.error   = action.payload
    }
    builder
      .addCase(registerUser.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, authSuccess)
      .addCase(registerUser.rejected,  authFail)
      .addCase(loginUser.pending,      (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled,    authSuccess)
      .addCase(loginUser.rejected,     authFail)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false
        state.user    = action.payload.user
        state.isAuthenticated = true
        localStorage.setItem('novacinema_user', JSON.stringify(action.payload.user))
      })
      // ✅ KEY FIX — if token is invalid, clear auth state so loop stops
      .addCase(fetchMe.rejected, (state) => {
        state.loading         = false
        state.user            = null
        state.token           = null
        state.isAuthenticated = false
        localStorage.removeItem('novacinema_token')
        localStorage.removeItem('novacinema_user')
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user
        localStorage.setItem('novacinema_user', JSON.stringify(action.payload.user))
      })
  }
})

export const { logout, clearError, setCredentials } = authSlice.actions
export default authSlice.reducer