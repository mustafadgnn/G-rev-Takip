import express, { Request, Response, NextFunction } from 'express';
import pool from './db';  // Veritabanı bağlantısı
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // Gelen isteklerdeki JSON verisini çeviriyor

// Statik dosyalar için public klasörünü ayarlıyoruz
app.use(express.static(path.join(__dirname, './public')));
app.use('/src', express.static(path.join(__dirname, './src')));
app.use('/public', express.static(path.join(__dirname, './public')));

// Ana sayfa için GET isteği
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// JWT Middleware (Token doğrulama)
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ error: "Yetkisiz erişim. Token eksik." }); // Token yoksa yetkisiz

    jwt.verify(token, 'your_jwt_secret', (err: any, user: any) => {
        if (err) return res.status(403).json({ error: "Geçersiz token." }); // Token geçersizse yasaklı
        (req as any).user = user; // Kullanıcı bilgilerini request'e ekliyoruz
        next();
    });
};

// Kayıt ve Login İşlemleri...

// Kullanıcı Kaydı (Şifre Hash'leme ile)
app.post('/users', async (req: Request, res: Response) => {
    const { name, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Şifreyi hash'liyoruz
        const [result]: any = await pool.query('INSERT INTO users (name, password) VALUES (?, ?)', [name, hashedPassword]);
        res.json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
    }
});
// Kullanıcı Girişi ve JWT Token Oluşturma
app.post('/login', async (req: Request, res: Response) => {
    const { name, password } = req.body;

    try {
        // Veritabanından kullanıcıyı al
        const [users]: any = await pool.query('SELECT * FROM users WHERE name = ?', [name]);

        if (users.length === 0) {
            return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
        }

        const user = users[0];

        // Şifre karşılaştırma işlemi öncesi log ekleyelim
        console.log('Gelen şifre:', password);
        console.log('Veritabanındaki hash:', user.password);

        // Şifre hash'ini karşılaştır
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Geçersiz şifre' });
        }

        // JWT oluştur
        const token = jwt.sign({ id: user.id, name: user.name }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Giriş sırasında hata oluştu:', err);
        res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
    }
});





// Kullanıcıları listeleme (Token doğrulama ile)
app.get('/users', authenticateToken, async (req: Request, res: Response) => {
    try {
        const [users]: any = await pool.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Kullanıcılar listelenirken hata oluştu' });
    }
});

// Yeni görev ekleme (Token doğrulama ile)
app.post('/tasks', authenticateToken, async (req: Request, res: Response) => {
    const { title, description, assigned_to } = req.body;
    try {
        const assignedToValue = assigned_to ? assigned_to : null;
        const [result]: any = await pool.query(
            'INSERT INTO tasks (title, description, assigned_to) VALUES (?, ?, ?)',
            [title, description, assignedToValue]
        );
        res.json({ id: result.insertId, title, description, assigned_to: assignedToValue, completed: false });
    } catch (err) {
        res.status(500).json({ error: 'Görev eklenirken hata oluştu' });
    }
});

// Görevleri listeleme (Token doğrulama ile)
app.get('/tasks', authenticateToken, async (req: Request, res: Response) => {
    try {
        const [tasks]: any = await pool.query(`
            SELECT tasks.*, users.name AS assigned_user_name
            FROM tasks
            LEFT JOIN users ON tasks.assigned_to = users.id
        `);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Görevler listelenirken hata oluştu' });
    }
});

// Görev silme (Token doğrulama ile)
app.delete('/tasks/:id', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result]: any = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Silinecek görev bulunamadı' });
        }
        res.json({ message: 'Görev başarıyla silindi' });
    } catch (err) {
        res.status(500).json({ error: 'Görev silinirken hata oluştu' });
    }
});

// Görev güncelleme (Token doğrulama ile)
app.put('/tasks/:id', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, assigned_to, completed } = req.body;
    try {
        const [result]: any = await pool.query(
            'UPDATE tasks SET title = ?, description = ?, assigned_to = ?, completed = ? WHERE id = ?',
            [title, description, assigned_to, completed, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Güncellenecek görev bulunamadı' });
        }
        res.json({ message: 'Görev başarıyla güncellendi' });
    } catch (err) {
        res.status(500).json({ error: 'Görev güncellenirken hata oluştu' });
    }
});

// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});
