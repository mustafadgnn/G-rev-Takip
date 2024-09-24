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
//express, HTTP sunucusu oluşturmak için kullanılıyor.
//tip güvenliğini sağlamak için kullanılan TypeScript türleridir.
const db_1 = __importDefault(require("./db")); // Veritabanı bağlantısı
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json()); //Gelen isteklerdeki JSON verisin çeviriyor
// Statik dosyalar için public klasörünü ayarlıyoruz
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
//bir değişkendir
//şu anda çalıştırılan server.ts dosyasının bulunduğu dizini temsil eder.
//public klasöründe bulunan statik dosyaları (HTML, CSS, JS) servis ediyor.
// Ana sayfa için GET isteği
//public klasöründeki index.html dosyasını gönderir ve ana sayfa olarak bu dosya görüntülenir.
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html')); //kullanıcıya) gönderir.
});
// Yeni görev ekleme
app.post('/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, assigned_to } = req.body;
    try {
        const assignedToValue = assigned_to ? assigned_to : null; //Bu, görevin birine atanmış olup olmadığını kontrol eder.
        const [result] = yield db_1.default.query('INSERT INTO tasks (title, description, assigned_to) VALUES (?, ?, ?)', [title, description, assignedToValue]);
        res.json({ id: result.insertId, title, description, assigned_to: assignedToValue, completed: false }); //json forma
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Görev eklenirken hata:", err.message);
            res.status(500).json({ error: 'Görev eklenirken hata oluştu' });
        }
        else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
}));
// Görevleri listeleme
app.get('/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [tasks] = yield db_1.default.query(`
            SELECT tasks.*, users.name AS assigned_user_name
            FROM tasks
            LEFT JOIN users ON tasks.assigned_to = users.id
        `); //eşleştir
        res.json(tasks);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Görevler listelenirken hata:", err.message);
            res.status(500).json({ error: 'Görevler listelenirken hata oluştu' });
        }
        else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
}));
app.get('/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.id; // Task ID'yi parametreden alıyoruz.
    try {
        const [tasks] = yield db_1.default.query(`
            SELECT tasks.*
            FROM tasks
            WHERE tasks.id = ?
        `, [taskId]);
        res.json(tasks);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Görevler listelenirken hata:", err.message);
            res.status(500).json({ error: 'Görevler listelenirken hata oluştu' });
        }
        else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
}));
// Görev silme 
app.delete('/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [result] = yield db_1.default.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) { ///Bu kontrol, silme işleminin başarılı olup olmadığını kontrol eder.
            return res.status(404).json({ error: 'Silinecek görev bulunamadı' });
        }
        res.json({ message: 'Görev başarıyla silindi' });
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Görev silinirken hata:", err.message);
            res.status(500).json({ error: 'Görev silinirken hata oluştu' });
        }
        else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
}));
// Görev güncelleme (Tamamlandı olarak işaretleme)
app.put('/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { completed, title } = req.body; //İstemcinin body kısmında gönderdiği veriden completed parametresi alınır.  
    try {
        const [result] = yield db_1.default.query('UPDATE tasks SET completed = ? , title=? WHERE id = ?', [completed, title, id]);
        if (result.affectedRows === 0) { //Bu kontrol, güncelleme işleminin başarılı olup olmadığını kontrol eder.
            return res.status(404).json({ error: 'Güncellenecek görev bulunamadı' });
        }
        res.json({ message: 'Görev başarıyla güncellendi' });
    }
    catch (err) {
        if (err instanceof Error) { //nesnenin belirli bir sınıftan (veya türden) gelip gelmediğini kontrol eden bir operatördür. 
            console.error("Görev güncellenirken hata:", err.message);
            res.status(500).json({ error: 'Görev güncellenirken hata oluştu' });
        }
        else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
}));
// Kullanıcıları listeleme
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [users] = yield db_1.default.query('SELECT * FROM users');
        res.json(users);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Kullanıcılar listelenirken hata:", err.message);
            res.status(500).json({ error: 'Kullanıcılar listelenirken hata oluştu' });
        }
        else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
}));
// Yeni kullanıcı ekleme
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        // Kullanıcı adı boşsa hata fırlat
        if (!name || name.trim() === "") { //kullanıcı sadece boşluklardan oluşan bir değer girdiğinde bu değer boş olarak kabul edilir ve kodda bir hata mesajı döndürülür.
            throw new Error("Kullanıcı adı boş olamaz.");
        }
        // Kullanıcı adını veritabanına ekle
        const [result] = yield db_1.default.query('INSERT INTO users (name) VALUES (?)', [name]);
        res.json({ id: result.insertId, name }); //veritabanına eklenen kaydın otomatik olarak oluşturulan ID'sidir
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Kullanıcı eklenirken hata:", err.message);
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
}));
// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});
//Yeni bir kullanıcı eklerken, şifreyi bcrypt ile hash'leyip saklaman gerekiyor:
// import bcrypt from 'bcryptjs';
// Kayıt İşlemi
//app.post('/register', async (req: Request, res: Response) => {
//const { name, password } = req.body;
//try {
//const hashedPassword = await bcrypt.hash(password, 10); // Şifreyi hash'le
// const [result]: any = await pool.query('INSERT INTO users (name, password) VALUES (?, ?)', [name, hashedPassword]);
//res.json({ id: result.insertId, name });
//} catch (err) {
//res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
//}
//});
//**//Kullanıcı giriş yaparken, şifreyi doğrulayıp bir JWT token oluşturursun: */
//import jwt from 'jsonwebtoken';
//import bcrypt from 'bcryptjs';
//app.post('/login', async (req: Request, res: Response) => {
//const { name, password } = req.body;
//try {
//const [users]: any = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
//if (users.length === 0) {
//return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
//}
//const user = users[0];
// Şifreyi kontrol et
//const isPasswordValid = await bcrypt.compare(password, user.password);
//if (!isPasswordValid) {
//return res.status(400).json({ error: 'Geçersiz şifre' });
//}
// JWT oluştur
//const token = jwt.sign({ id: user.id, name: user.name }, 'your_jwt_secret', { expiresIn: '1h' });
//res.json({ token });
//} catch (err) {
//res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
//}
//});
//***JWT token'ı doğrulayan bir middleware ekleyerek, yetkilendirilmiş kullanıcıları kontrol edebilirsin: */
//const authenticateToken = (req: Request, res: Response, next: Function) => {
//const authHeader = req.headers['authorization'];
//const token = authHeader && authHeader.split(' ')[1];
//if (token == null) return res.sendStatus(401); // Token yoksa yetkisiz
//jwt.verify(token, 'your_jwt_secret', (err: any, user: any) => {
//if (err) return res.sendStatus(403); // Token geçersizse yasaklı
//req.user = user;
//next(); // Yetkili kullanıcıysa devam et
//});
//};
