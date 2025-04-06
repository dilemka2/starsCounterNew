const express = require('express');

const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.userId) {
        res.render('index', { account: 'is', login: req.session.login });
    }
    res.render('index');
})

router.get('/login', (req, res) => {
    if(req.session.userId) {
        res.redirect('/profile')
    }
    res.render('login');
})

router.get('/register', (req, res) => {
    if (req.session.userId) {
        res.redirect('/profile')
    }
    res.render('register');
})

router.get('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Something went wrong during lougouting');
        }
        res.redirect('/');
    });
})

router.get("/delete-ac", (req,res)=> {
    if (!req.session.userId) {
        res.redirect('/register');
    }
    let sql = 'SELECT * FROM space WHERE login = ?'
    db.query(sql, req.session.login,(err,result)=> {
        if(err){
            console.log(err)
        }
        let user = result[0];
        let id = user.id;
        fs.unlink(`users_info/${req.session.login}.JSON`, () => {})
        let sqlDelete = 'DELETE FROM space WHERE id = ?'
        db.query(sqlDelete, id,(err,result)=>{
            if(err){
                console.log(err)
            }
        })
        req.session.destroy((err) => {
            if(err) {
                console.log(err);
            }
        })
        res.redirect('/register');
    })
})
router.get('/astroPhoto', (req,res) => {
    if(req.session.userId) {
        res.render('astroPhoto', {
            account:'is',
            login:req.session.login
        })
    }
    res.render('astroPhoto');
})

router.get('/instruction', (req,res) => {
    if(req.session.userId) {
        res.render('instruction', {account: 'is', login:req.session.login})
    }
    res.render('instruction')
})

router.get('/reviews', (req,res) => {
    if (req.session.login && req.session.login == 'admin') {
        fs.readFile('reviews.JSON', 'utf-8', async(err,data) => {
            if (err) {
                console.log(err);
            }
            let resultInJson = JSON.parse(data);
            res.render('reviews', {reviews:resultInJson.review, account:'is', login:req.session.login});
        })
    }
    else {
        res.render('index');
    }
})

router.get('/profile', (req, res) => {
    if (!req.session.userId) {
        res.render('index');
    }
    if (!req.session.login) {
        res.render('login');
    }
    fs.readFile(`users_info/${req.session.login}.JSON`, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        }
        const profileData = JSON.parse(data);
        res.render('profile', {
            login: req.session.login,
            description: profileData.des,
            img: profileData.img,
            account: 'is',
            arrayOfStars: profileData.arrayOfStars,
            arrayOfIMG: profileData.arrayOfIMG
        });
    })
})


module.exports = router;