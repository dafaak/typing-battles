import {Player} from "./Player.ts";

export interface GameStatus {
    players: Player[]
    state: "loby" | "running" | "ending" | "preparing"
    targetString?: string
    finished?: boolean
}