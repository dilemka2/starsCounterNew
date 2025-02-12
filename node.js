const express = require('express');
const hbs = require('hbs');
const path = require('path');
const multer = require('multer');
const { urlencoded } = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const fs = require('fs');

// sending email
const nodemailer = require('nodemailer');


const app = express();
dotenv.config({ path: '.env' });

// database
const mysql = require('mysql2');

app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: 13617, // Додаємо порт
    ssl: { rejectUnauthorized: false } // Вимкнути перевірку SSL, якщо потрібно
});

db.connect((err) => {
    if (err) {
        console.error("Помилка підключення:", err);
    } else {
        console.log("✅ Підключено до бази даних");

        const sql = `
            CREATE TABLE IF NOT EXISTS space (
                id INT AUTO_INCREMENT PRIMARY KEY,
                login VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.query(sql, (err, result) => {
            if (err) {
                console.error("❌ Помилка створення таблиці:", err);
            } else {
                console.log("✅ Таблиця 'space' створена або вже існує");
            }


           
        });


    //     sql2 = `
    //     SHOW COLUMNS FROM space;

    // `;

    //     db.query(sql2, (err, result) => {
    //         if (err) {
    //             console.error("❌ Помилка ", err);
    //         } else {
    //             console.log(result);
    //         }


           
        //});

        // let user = {
        //     email: 'email',
        //     login: 'login',
        //     password: 'password',
        //     created_at: '2025-02-12 14:30:45'
        // }

        // let sqlInsertInto = 'INSERT INTO space SET ?';
        // db.query(sqlInsertInto, user, (err, result) => {
        //     if (err) {
        //         console.log(err);
        //         //return res.status(500).send('Something went wrong')
        //     } else {
        //         console.log(result);
        //     }
        // })

        // let sqlgetInto = 'SELECT * FROM space ';
        // db.query(sqlgetInto, user, (err, result) => {
        //     if (err) {
        //         console.log(err);
                
        //     } else {
        //         console.log(result);
        //     }
        // })

    }
});

// working with photos
let { Image } = require('image-js');

app.set('view engine', 'hbs');
app.set('views');
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

hbs.registerHelper('ifEquals', function (value, compareValue, options) {
    if (value === compareValue) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.originalname);
    }
});

const upload = multer({ storage })
// routing
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.render('index', { account: 'is', login: login });
    }
    res.render('index');
})


app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        res.render('index');
    }
    fs.readFile(`users_info/${login}.JSON`, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        }
        const profileData = JSON.parse(data);
        res.render('profile', {
            login: login,
            description: profileData.des,
            img: profileData.img,
            account: 'is',
            stars: profileData.stars,
        });
    })
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Something went wrong during lougouting');
        }
        res.redirect('/');
    });
})

let login;
let password;
let email;

app.post('/register', async (req, res) => {
    try {
        login = req.body.login;
        password = req.body.password;
        email = req.body.email;

        let sqlCheckerEmail = 'SELECT * FROM space WHERE email = ?';
        db.query(sqlCheckerEmail, email, async (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Something went wrong during checking password the email');
            }
            if (result.length > 0) {
                return res.render('register', {
                    message: 'This email is already used'
                })
            }

            let user = {
                email: email,
                login: login,
                password: password
            }

            let sqlInsertInto = 'INSERT INTO space SET ?';
            let query = db.query(sqlInsertInto, user, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Something went wrong')
                }
            })
            const userInfo = {
                img: 'uploads\\profile-img.webp',
                des: 'Add Bio📝',
                stars: starsArray,
            }
            const userInfoJson = JSON.stringify(userInfo, null, 2);
            await fs.writeFile(`users_info/${login}.JSON`, userInfoJson, () => { })

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                }
            })

            const mailOption = {
                from: process.env.EMAIL_USER,
                to: req.body.email,
                subject: 'Welcome to Our Service!',
                text: `Hi ${login},\n\nThank you for registering! Your account has been successfully created.\n\nBest regards,\ngo to count those stars!`
            }

            transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('the email has just been sent')
                }
            })
            res.redirect('/login');
        })
    }
    catch (e) {
        console.log(e);
    }
})

app.post('/login', async (req, res) => {
    try {
        let sqlChecker = 'SELECT * FROM space WHERE login = ?';
        db.query(sqlChecker, [req.body.login], (err, result) => {
            if (err) {
                return res.status(500).send('something went wrong during cheking the email');
            }
            if (result.length === 0) {
                return res.render('login', {
                    message: 'There is no account with that login'
                })
            }
            let user = result[0];
            if (req.body.password != user.password) {
                return res.render('login', {
                    message: 'Wrong password'
                })
            }

            if (req.body.password == user.password) {
                req.session.userId = user.id;
                return res.render('index', { account: 'is', login: login })
            }
        })
    }
    catch (e) {
        console.log(e);
    }
})

let starsArray = [];
app.post('/send-photo', upload.single('photo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const photo = req.file.filename;
    let filePath = path.join(__dirname, 'uploads', photo);
    async function makingGrey(filePath) {
        try {
            let image = await Image.load(filePath);
            let imageGrey = image.grey();
            await imageGrey.save(filePath + '-grey.jpg');
            return imageGrey;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    async function countWhiteObjects(image) {
        try {
            let threshold = image.mask({ threshold: 0.5 });
            let roiManager = image.getRoiManager();
            roiManager.fromMask(threshold);
            let rois = roiManager.getRois();
            return rois.length;
        } catch (error) {
            console.log("an error during anilizing", error);
            return 0;
        }
    }

    let imageGrey = await makingGrey(filePath);
    if (imageGrey) {
        const whiteObjectsCounter = await countWhiteObjects(imageGrey);
        starsArray.push(whiteObjectsCounter-1);
        fs.readFile(`users_info/${login}.JSON`, 'utf-8', (err, data) => {
            if (err) {
                console.log(err)
            }
            const profileData = JSON.parse(data);
            const userInBack = {
                img: profileData.img,
                des: profileData.des,
                stars: starsArray,
            }
            const ReadyuserInBack = JSON.stringify(userInBack, null, 2)
            fs.writeFileSync(`users_info/${login}.JSON`, ReadyuserInBack, () => { })
        })
        res.json({
            greyImagePath: photo + '-grey.jpg',
            whiteObjectsCount: whiteObjectsCounter,
        });
    } else {
        return res.status(500).json({ error: 'an error during anilizing' });
    }

})


let profilePic;
let profileDesc;
app.post('/profile-update', upload.single('inputProfile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('The file wasn`t uploaded');
    }
    profilePic = req.file.filename;
    profileDesc = req.body.describsion;

    const userInfo = {
        img: path.join('uploads', profilePic),
        des: profileDesc,
        stars: starsArray,
    }
    const userInfoJson = JSON.stringify(userInfo, null, 2);
    fs.writeFile(`users_info/${login}.JSON`, userInfoJson, (err) => {
        if (err) {
            console.log(err);
            return;
        }
        fs.readFile(`users_info/${login}.JSON`, 'utf-8', (err, data) => {
            if (err) {
                console.error('Something went wrong during reading file', err);
            }
            const profileData = JSON.parse(data);
            res.render('profile', {
                login: login,
                description: profileData.des,
                img: profileData.img,
                account: 'is',
                message: 'Дані успішно оновленні',
                stars: profileData.stars,
            });
        })
    })

})


const port = 3030;

app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

// app.listen(port, () => {
//     console.log(`the server has just been started on port ${port}`);
// })