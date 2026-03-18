import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchShowsByMovie = createAsyncThunk('booking/fetchShows', async ({ movieId, date, city }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shows/movie/${movieId}`, { params: { date, city } })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchShowById = createAsyncThunk('booking/fetchShow', async (showId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shows/${showId}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const lockSeats = createAsyncThunk('booking/lockSeats', async ({ showId, seats }, { rejectWithValue }) => {
  try {
    const res = await api.post('/bookings/lock-seats', { showId, seats })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const createBooking = createAsyncThunk('booking/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/bookings', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchUserBookings = createAsyncThunk('booking/fetchUserBookings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/my-bookings')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    shows: [],
    selectedShow: null,
    selectedSeats: [],
    currentBooking: null,
    userBookings: [],
    loading: false,
    error: null,
    step: 1 // 1:shows, 2:seats, 3:payment, 4:confirmation
  },
  reducers: {
    selectShow: (state, action) => { state.selectedShow = action.payload },
    toggleSeat: (state, action) => {
      const { row, seatNumber, seatType, price } = action.payload
      const idx = state.selectedSeats.findIndex(s => s.row === row && s.seatNumber === seatNumber)
      if (idx >= 0) {
        state.selectedSeats.splice(idx, 1)
      } else {
        if (state.selectedSeats.length < 10) { // max 8 seats
          state.selectedSeats.push({ row, seatNumber, seatType, price })
        }
      }
    },
    clearSelectedSeats: (state) => { state.selectedSeats = [] },
    setStep: (state, action) => { state.step = action.payload },
    resetBooking: (state) => {
      state.selectedShow = null
      state.selectedSeats = []
      state.currentBooking = null
      state.step = 1
    },
    updateShowSeat: (state, action) => {
      // Real-time seat update from socket
      if (state.selectedShow) {
        const { updatedSeats } = action.payload
        updatedSeats.forEach(({ row, seatNumber, status }) => {
          const seat = state.selectedShow.seats.find(s => s.row === row && s.seatNumber === seatNumber)
          if (seat) seat.status = status
        })
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShowsByMovie.pending, (state) => { state.loading = true })
      .addCase(fetchShowsByMovie.fulfilled, (state, action) => { state.loading = false; state.shows = action.payload.shows })
      .addCase(fetchShowsByMovie.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchShowById.pending, (state) => { state.loading = true })
      .addCase(fetchShowById.fulfilled, (state, action) => { state.loading = false; state.selectedShow = action.payload.show })
      .addCase(fetchShowById.rejected, (state) => { state.loading = false })
      .addCase(lockSeats.pending, (state) => { state.loading = true })
      .addCase(lockSeats.fulfilled, (state) => { state.loading = false; state.step = 3 })
      .addCase(lockSeats.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createBooking.pending, (state) => { state.loading = true })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false
        state.currentBooking = action.payload.booking
        state.step = 4
      })
      .addCase(createBooking.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchUserBookings.fulfilled, (state, action) => { state.userBookings = action.payload.bookings })
  }
})

export const { selectShow, toggleSeat, clearSelectedSeats, setStep, resetBooking, updateShowSeat } = bookingSlice.actions
export default bookingSlice.reducer
