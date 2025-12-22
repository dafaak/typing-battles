import { configureStore } from '@reduxjs/toolkit';
import playersReducer from './playersSlice';
import playerDataReducer from './playerDataSlice';
import partieReducer from './partieSlice';

const store = configureStore({
  reducer: {
    players: playersReducer,
    playerData: playerDataReducer,
    partieState: partieReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;