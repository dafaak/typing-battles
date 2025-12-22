import { Player } from "./Player.ts";

export interface GameStatus {
  players: Player[],
  name: string,
  state: "loby" | "running" | "ending" | "preparing",
  targetString?: string,
  finished?: boolean,
}