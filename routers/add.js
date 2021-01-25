const express = require('express')
const DbProduct = require('../PROJECTNET-MASTER/model/Product')
const DbUser = require('../PROJECTNET-MASTER/model/User')
const multer = require('../md/multer').single('photo')
const router = express.Router()
 
//// isAuthenticated middleware
const md = (req,  res, next) => {
    if(req.isAuthenticated()){
        next()
    }else{
        req.flash('danger' , 'Iltimos tizimga ulaning')
        res.redirect('/login/log')
    }
}

//// Router add products mehtod of GET

router.get('/product/pro/add' ,  md , (req  ,res) => {
        res.render('add' , {
        title: 'Mahsulot qoshish sahifasi',

    })
})

//// Router add products mehtod of post

router.post('/product/pro/add' , multer ,   (req  ,res) => {
    req.checkBody('title' , 'Mahsulotning nomi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('price' , 'Mahsulotning narxi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('category' , 'Mahsulotning categorysi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('comments' , 'Mahsulotning comments bosh qolishi mumkin emas').notEmpty()
     
    const errors =  req.validationErrors()
    if(errors){
        res.render('add' , {
            title: 'Error',
            errors : errors
        })
    } else{
        const db  = new DbProduct({
            title : req.body.title.toLowerCase(),
            price : req.body.price,
            category : req.body.category,
            comments : req.body.comments,
            dirUser: req.user.id,
            sale : req.body.sale,
            photo : req.file.path
        })
        db.save((err) => {
            if(err)
                throw err
            else{
                req.flash('success' , 'Maxsulot qoshildi')
                res.redirect('/')
            }
        })
    }

})


/////// Product - Card  sahifani Routeri ///////

router.get('/product/pro/:id',      async(req, res) => {
     let db =  await DbProduct.find({} )
    console.log(req.params.id)
    DbProduct.findById(req.params.id,  ((err, data) => {
        // let db =  await DbProduct.find({ dirUser : data.dirUser} )
        DbUser.findById(data.dirUser ,    (err ,user ) => {  
            res.render('cards', {
                title: 'Mahsulot haqida',
                datas: data,
                db, 
                prof : user 
            })
           
            
    })
      
    }))
 


})

/////// Product - Cardni Edit qilish  sahifani Routeri ///////

router.get('/product/edit/:userId' ,  md ,(req  ,res) => {

    DbProduct.findById(req.params.userId , ((err, data) => {
        if(data.dirUser != req.user._id){
            req.flash('danger' , 'Bunaqa sahifa yoq')
            res.redirect('back')
        }
        res.render('add' , {
            title: 'Maxsulotni ozgartirish', 
            datas: data
        })
    }))
})


/////// Product - Cardni Edit qilish  sahifani Routeri ///////

router.post('/product/edit/:userId' , multer ,  (req  ,res) => {
    req.checkBody('title' , 'Mahsulotning nomi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('price' , 'Mahsulotning narxi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('category' , 'Mahsulotning categorysi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('comments' , 'Mahsulotning comments bosh qolishi mumkin emas').notEmpty()    
    const errors =  req.validationErrors()
    if(errors){
        res.render('add' , {
            title: 'Error',
            errors : errors
        })
    } else{
        const db  =  {
            title : req.body.title.toLowerCase(),
            price : req.body.price,
            category : req.body.category,
            comments : req.body.comments,
            photo : req.file.path  
        }
        const ids = {_id : req.params.userId }
        DbProduct.updateOne(ids , db , (err) => {
            if(err){
                console.log(err)
            }else{
            req.flash('success' , 'Maxsulot qoshildi')
            res.redirect('/')
        }
        })
       
    }

})

router.get('/product/delete/:id' , (req  ,res) => {
    if(!req.user._id){
        res.status(500).send()
    }
    let id = { _id : req.params.id}
    DbProduct.findById(req.params.id , ((err, data) => {
        if(data.dirUser != req.user._id){
            req.flash('danger' , 'Bunaqa sahifa yoq')
            res.redirect('/')
        }
    else{
        DbProduct.findOneAndDelete(id , (err) => {
            if(err) console.log(err)
            req.flash('success' , 'Reklamangiz ochirildi')
            res.redirect('/')
        })
    }
        
    }))



})

 
 
module.exports  = router