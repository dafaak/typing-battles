import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Player } from '../interfaces/Player';

interface PlayersState {
  players: Player[];
}

const initialState: PlayersState = {
  players: [],
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setPlayers(state, action: PayloadAction<Player[]>) {
      state.players = action.payload;
    },
    addPlayer(state, action: PayloadAction<Player>) {
      state.players.push(action.payload);
    },
    removePlayer(state, action: PayloadAction<string>) {
      state.players = state.players.filter(player => player.conn_id !== action.payload);
    },
  },
});

export const { setPlayers, addPlayer, removePlayer } = playersSlice.actions;
export default playersSlice.reducer;