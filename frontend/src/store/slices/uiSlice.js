import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'dark',
    sidebarOpen: false
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark')
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen }
  }
})

export const { toggleTheme, toggleSidebar } = uiSlice.actions
export default uiSlice.reducer
