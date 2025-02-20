import {configureStore} from '@reduxjs/toolkit';
import playersReducer from './playersSlice';
import playerDataReducer from './playerDataSlice';

const store = configureStore({
    reducer: {
        players: playersReducer,
        playerData: playerDataReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;