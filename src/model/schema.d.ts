import { ObjectId } from "mongodb";

declare interface SchemaUser {
  _id: number;
  name: string;
  balance: number;
  img: string;
  updated: number;
  created: number;
}

declare interface SchemaGame {
  _id: number;
  minBetAmount: number;
  maxBetAmount: number;
}

declare interface SchemaHistory {
  _id: number;
  name: string;
  betAmount: number;
  cashoutAt: number;
  cashouted: boolean;
  date: number;
}
declare interface SchemaSetGameNumber {
  _id: ObjectId;
  amount: number;
}

declare interface SchemaSetFirstName {
  _id: ObjectId;
  name: number;
}

declare interface SchemaBotUser {
  _id: ObjectId;
  name: string;
}


