import express, { Request, Response } from 'express';  
//express, HTTP sunucusu oluşturmak için kullanılıyor.
//tip güvenliğini sağlamak için kullanılan TypeScript türleridir.
import pool from './db';  // Veritabanı bağlantısı
import path from 'path';


const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());  //Gelen isteklerdeki JSON verisin çeviriyor

// Statik dosyalar için public klasörünü ayarlıyoruz
app.use(express.static(path.join(__dirname, './public')));
//bir değişkendir
//şu anda çalıştırılan server.ts dosyasının bulunduğu dizini temsil eder.
 //public klasöründe bulunan statik dosyaları (HTML, CSS, JS) servis ediyor.
 app.use('/src', express.static(path.join(__dirname, './src')));
 app.use('/public', express.static(path.join(__dirname, './public')));
// Ana sayfa için GET isteği
//public klasöründeki index.html dosyasını gönderir ve ana sayfa olarak bu dosya görüntülenir.
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, './public/index.html')); //kullanıcıya) gönderir.
});

//login işlemi
app.post('/login', async (req: Request, res: Response) => {
    const { name, password } = req.body;
    try {

        const [users]: any = await pool.query('SELECT * FROM users WHERE name = ?', [name]);

        if (users.length === 0) {
            return res.status(400).json({ name: name,password:password});
            //return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
        }else if(users[0].password!=password){
            
            return res.status(404).json({ name: name,password:password});
        }

        
        res.status(200).json({ login:true });
    } catch (err) {
        res.status(500).json({ error: 'Giriş sırasında hata oluştu'+err });
    }
});

// Yeni kullanıcı ekleme
app.post('/users', async (req: Request, res: Response) => {
    const { name,password } = req.body;
    try {
        // Kullanıcı adı boşsa hata fırlat
        if (!name || name.trim() === "") { //kullanıcı sadece boşluklardan oluşan bir değer girdiğinde bu değer boş olarak kabul edilir ve kodda bir hata mesajı döndürülür.
            throw new Error("Kullanıcı adı boş olamaz.");
        }
  
        if (!password || password.trim() === "") { //kullanıcı sadece boşluklardan oluşan bir değer girdiğinde bu değer boş olarak kabul edilir ve kodda bir hata mesajı döndürülür.
          throw new Error("password boş olamaz.");
      }
  
        // Kullanıcı adını veritabanına ekle
        const [result]: any = await pool.query('INSERT INTO users (name,password) VALUES (?,?)', [name,password]);
        res.json({ id: result.insertId, name }); //veritabanına eklenen kaydın otomatik olarak oluşturulan ID'sidir
    } catch (err) {
        if (err instanceof Error) {
            console.error("Kullanıcı eklenirken hata:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
  }); 

  // Kullanıcıları listeleme
  app.get('/users', async (req: Request, res: Response) => {
    try {
        const [users]: any = await pool.query('SELECT * FROM users');
        console.log(users); // Veritabanı verisini kontrol etmek için
        res.json(users);
    } catch (err) {
        if (err instanceof Error) {
            console.error("Kullanıcılar listelenirken hata:", err.message);
            res.status(500).json({ error: 'Kullanıcılar listelenirken hata oluştu' });
        } else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
});
// Yeni görev ekleme
app.post('/tasks', async (req: Request, res: Response) => {
    const { title, description, assigned_to } = req.body;
    try {
       
        const assignedToValue = assigned_to ? assigned_to : null; //Bu, görevin birine atanmış olup olmadığını kontrol eder.

        const [result]: any = await pool.query(
            'INSERT INTO tasks (title, description, assigned_to) VALUES (?, ?, ?)', 
            [title, description, assignedToValue]
        );
        res.json({ id: result.insertId, title, description, assigned_to: assignedToValue, completed: false }); //json forma
    } catch (err) {
        if (err instanceof Error) {
            console.error("Görev eklenirken hata:", err.message);
            res.status(500).json({ error: 'Görev eklenirken hata oluştu' });
        } else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
});

// Görevleri listeleme
app.get('/tasks', async (req: Request, res: Response) => {
    try {
        const [tasks]: any = await pool.query(`
            SELECT tasks.*, users.name AS assigned_user_name
            FROM tasks
            LEFT JOIN users ON tasks.assigned_to = users.id
        `); //eşleştir
        res.json(tasks);
    } catch (err) {
        if (err instanceof Error) {
            console.error("Görevler listelenirken hata:", err.message);
            res.status(500).json({ error: 'Görevler listelenirken hata oluştu' });
        } else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
});


//     app.get('/tasks/:id', async (req: Request, res: Response) => {
//     const taskId = req.params.id; // Task ID'yi parametreden alıyoruz.
    
//     try {
//         const [tasks]: any = await pool.query(`
//             SELECT tasks.*
//             FROM tasks
//             WHERE tasks.id = ?
//         `, [taskId]);
//         res.json(tasks);
//     } catch (err) {
//         if (err instanceof Error) {
//             console.error("Görevler listelenirken hata:", err.message);
//             res.status(500).json({ error: 'Görevler listelenirken hata oluştu' });
//         } else {
//             res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
//         }
//     }
// });


// Görev silme 
app.delete('/tasks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result]: any = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) { ///Bu kontrol, silme işleminin başarılı olup olmadığını kontrol eder.
            return res.status(404).json({ error: 'Silinecek görev bulunamadı' });
        }
        res.json({ message: 'Görev başarıyla silindi' });
    } catch (err) {
        if (err instanceof Error) {
            console.error("Görev silinirken hata:", err.message);
            res.status(500).json({ error: 'Görev silinirken hata oluştu' });
        } else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
});

// Görev güncelleme (Tamamlandı olarak işaretleme)
app.put('/tasks/:id', async (req: Request, res: Response) => {
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
        if (err instanceof Error) {
            console.error("Görev güncellenirken hata:", err.message);
            res.status(500).json({ error: 'Görev güncellenirken hata oluştu' });
        } else {
            res.status(500).json({ error: 'Bilinmeyen bir hata oluştu' });
        }
    }
});

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
