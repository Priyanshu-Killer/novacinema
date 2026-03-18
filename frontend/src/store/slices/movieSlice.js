import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchMovies = createAsyncThunk(
  'movies/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/movies', { params })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load movies')
    }
  }
)

export const fetchMovieById = createAsyncThunk(
  'movies/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/movies/${id}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Movie not found')
    }
  }
)

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies:        [],
    selectedMovie: null,
    total:         0,
    loading:       false,
    error:         null,
    lastFetched:   null,   // timestamp – used to decide if we should refetch
  },
  reducers: {
    clearSelectedMovie: (state) => { state.selectedMovie = null },
    clearMovies: (state) => { state.movies = []; state.lastFetched = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading     = false
        state.movies      = action.payload.movies  || []
        state.total       = action.payload.total   || 0
        state.lastFetched = Date.now()
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })
      .addCase(fetchMovieById.pending, (state) => {
        state.loading       = true
        state.selectedMovie = null
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.loading       = false
        state.selectedMovie = action.payload.movie
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })
  }
})

export const { clearSelectedMovie, clearMovies } = movieSlice.actions
export default movieSlice.reducer