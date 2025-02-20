import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Player} from "../interfaces/Player.ts";

interface PlayerDataState {
    player?: Player;
}

const initialState: PlayerDataState = {
    player: undefined,
};

const playerDataSlice = createSlice({
    name: 'playerData',
    initialState,
    reducers: {
        setPlayerData(state, action: PayloadAction<Player>) {
            state.player = action.payload;
        },
        updatePlayerIsReady(state, action: PayloadAction<{ value: boolean }>) {
            if (state.player) state.player.is_ready = action.payload.value;
        },
        updatePlayerScore(state, action: PayloadAction<{ value: number }>) {
            if (state.player) state.player.score = action.payload.value;
        },
    },
});

export const {setPlayerData, updatePlayerIsReady, updatePlayerScore} = playerDataSlice.actions;
export default playerDataSlice.reducer;