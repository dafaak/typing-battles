import { createSlice } from "@reduxjs/toolkit";

interface PartieState {
  name?: string,
  state?: 'loby' | 'running' | 'ending' | 'preparing'
}

const initialState: PartieState = {
  name: undefined,
  state: undefined,
}

const partieSlice = createSlice(
    {
      name: 'partie',
      initialState,
      reducers: {
        setPartieState(state, action) {
          state.state = action.payload;
        },
        setPartieName(state, action) {
          state.name = action.payload;
        },
        setPartie(state, action) {
          state.name = action.payload.name;
          state.state = action.payload.state;
        }
      },
    }
)

export const {setPartieState, setPartieName, setPartie} = partieSlice.actions;
export default partieSlice.reducer;