import { MongoClient, ObjectId } from "mongodb";

import config from "../config.json";
import { currentTime, setlog } from "../helper";
import {
  SchemaBotUser,
  SchemaGame,
  SchemaHistory,
  SchemaSetGameNumber,
  SchemaUser,
} from "./schema";

const client = new MongoClient("mongodb://127.0.0.1:27017");
const db = client.db(config.database);
export const DEFAULT_GAMEID = 1;

export const DUsers = db.collection<SchemaUser>("users");
export const DGame = db.collection<SchemaGame>("game");
export const DHistories = db.collection<SchemaHistory>("histories");
export const DSetGameNumber =
  db.collection<SchemaSetGameNumber>("set_game_number");

export const DBotUsers =
  db.collection<SchemaBotUser>("bot_users");




const lastIds = {
  lastHistoryId: 0,
  lastUserId: 0,
  lastGameNumberId: 0,
};

export const connect = async () => {
  try {
    await client.connect();
    await DUsers.createIndex({ name: 1 }, { unique: true, name: "users-name" });
    await DHistories.createIndex(
      { name: 1 },
      { unique: false, name: "logs-name" }
    );
    await DHistories.createIndex(
      { date: 1 },
      { unique: false, name: "logs-date" }
    );

    const d = await DHistories.aggregate([
      { $group: { _id: null, max: { $max: "$_id" } } },
    ]).toArray();
    lastIds.lastHistoryId = d?.[0]?.max || 0;
    const d1 = await DUsers.aggregate([
      { $group: { _id: null, max: { $max: "$_id" } } },
    ]).toArray();
    lastIds.lastUserId = d1?.[0]?.max || 0;
    return true;
  } catch (error) {
    setlog("mongodb-initialization", error);
    return error;
  }
};

export const getBettingAmounts = async () => {
  try {
    const d = await DGame.findOne({ _id: DEFAULT_GAMEID });
    const minBetAmount = d?.minBetAmount || config.betting.min;
    const maxBetAmount = d?.maxBetAmount || config.betting.max;
    return { minBetAmount, maxBetAmount };
  } catch (error) {
    setlog("addHistory", error);
    return {
      minBetAmount: config.betting.min,
      maxBetAmount: config.betting.max,
    };
  }
};
export const addHistory = async (
  name: string,
  betAmount: number,
  cashoutAt: number,
  cashouted: boolean
) => {
  try {
    await DHistories.insertOne({
      _id: ++lastIds.lastHistoryId,
      name,
      betAmount,
      cashoutAt,
      cashouted,
      date: currentTime(),
    });
    return true;
  } catch (error) {
    setlog("addHistory", error);
    return false;
  }
};

export const addUser = async (name: string, balance: number, img: string) => {
  try {
    const now = currentTime();
    await DUsers.insertOne({
      _id: ++lastIds.lastUserId,
      name,
      balance,
      img,
      updated: now,
      created: now,
    });
    return true;
  } catch (error) {
    setlog("addUser", error);
    return false;
  }
};

export const updateUserBalance = async (name: string, balance: number) => {
  try {
    await DUsers.updateOne({ name }, { $set: { balance } });
    return true;
  } catch (error) {
    setlog("updateUserBalance", error);
    return false;
  }
};
export const setGameNumber = async (amount: number) => {
  try {
    // await DSetGameNumber.deleteMany();
    await DSetGameNumber.insertOne({
      _id: new ObjectId(),
      amount,
    });
    return true;
  } catch (error) {
    setlog("addUser", error);
    return false;
  }
};
export const getGameNumber = async () => {
  try {
    let data = await DSetGameNumber.find().sort({ _id: 1 }).toArray();
    return data;
  } catch (error) {
    setlog("addUser", error);
    return [];
  }
};
export const updateGameNumber = async (_id: ObjectId, amount: number) => {
  try {
    await DSetGameNumber.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { amount: amount } }
    );
    return true;
  } catch (error) {
    setlog("updateGameNumber", error);
    return false;
  }
};
export const deleteGameNumber = async (_id: ObjectId) => {
  try {
    await DSetGameNumber.deleteOne({ _id: new ObjectId(_id) });
    return true;
  } catch (error) {
    setlog("deleteGameNumber", error);
    return false;
  }
};



export const addBotUser = async (name: string) => {
  try {
    // await DSetUser.deleteMany();
    await DBotUsers.insertOne({
      _id: new ObjectId(),
      name,
    });
    return true;
  } catch (error) {
    setlog("addBotUser", error);
    return false;
  }
};
export const getBotUsers = async () => {
  try {
    let data = await DBotUsers.find().sort({ _id: 1 }).toArray();
    return data;
  } catch (error) {
    setlog("addUser", error);
    return [];
  }
};
export const updateBotUser = async (_id: ObjectId, name: string) => {
  try {
    await DBotUsers.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { name } }
    );
    return true;
  } catch (error) {
    setlog("updateUser", error);
    return false;
  }
};
export const deleteBotUser = async (_id: ObjectId) => {
  try {
    await DBotUsers.deleteOne({ _id: new ObjectId(_id) });
    return true;
  } catch (error) {
    setlog("deleteUser", error);
    return false;
  }
};
