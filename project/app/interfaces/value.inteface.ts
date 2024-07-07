import type { IPlayer } from "./player.interface";

export interface IValue {
  party_state: string
  players?: IPlayer[]
  connId?: string
  player?: IPlayer
  target_string?: string
}