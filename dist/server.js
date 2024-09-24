"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db")); // Veritabanı bağlantısı
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json()); // Gelen isteklerde JSON verilerini işler
// Login işlemi
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Veritabanından kullanıcıyı bul
    const [users] = yield db_1.default.query('SELECT * FROM users WHERE name = ?', [username]);
    if (users.length === 0 || users[0].password !== password) {
        return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    // Giriş başarılı, kullanıcıyı yönlendir
    res.json({ success: true });
}));
// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});
