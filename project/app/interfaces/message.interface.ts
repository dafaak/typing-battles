import type { IValue } from "./value.inteface";

export interface IMessage {
  type: string
  values: IValue
}