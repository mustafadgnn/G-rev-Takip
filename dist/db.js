"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise")); //MySQL veritabanıyla asenkron olarak çalışmak için kullanılan bir Node.js kütüphanesidir.
const pool = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'asd123', // Şifreni buraya yaz
    database: 'Taskmaster'
});
exports.default = pool;
