// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import serviceWeekReducer from "./slice/serviceweekSlice"

export const store = configureStore({
  reducer: {
    serviceWeek: serviceWeekReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;