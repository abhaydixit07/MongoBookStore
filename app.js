import express from 'express';
import { ObjectId } from 'mongodb';
import bodyParser from "body-parser";
import { connectToDb, getDb } from './db.js';
const port = 3000;
const app = express()
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
let db
//db connection
connectToDb((err)=>{
    if(!err){
        app.listen(port, ()=>{
            console.log(`app listening on ${port}`)
        })
        db=getDb()
    }
})


app.get('/books', async(req, res)=>{
    const page = req.query.page || 0 // pagination
    console.log(page)
    const booksPerPage = 3
    let books = []
    try{
        await db.collection('books').find().sort({author:1}).skip(page*booksPerPage).limit(booksPerPage).forEach(element => {
            books.push(element)
        });
        res.status(200).json(books)
    }
    catch(err){
        res.status(500).json({error:"Could not fetch documents"})
    }
    
})
app.get('/books/:id', async(req, res)=>{
    const bookId = req.params.id
    if(ObjectId.isValid(bookId)){
        try{
            let book = await db.collection('books').findOne({_id:new ObjectId(bookId)})
            console.log(book)
            res.status(200).json(book)
        }
        catch(err){
            res.status(500).json({error:"Could not fetch documents"})
        }
    }
    else{
        res.status(500).json({error:"Not a valid Document ID."})
    }
    
    
})

// to post
app.post('/books', async(req, res)=>{
    const book = req.body
    try{
        const result = await db.collection('books').insertOne(book)
        res.status(201).json(result)
    }
    catch(err){
        res.status(500).json({error:"Could not add document"})
    }
})

// to delete
app.delete('/books/:id', async(req, res)=>{
    const bookId = req.params.id;
    if(ObjectId.isValid(bookId)){
        try{
            let result = await db.collection('books').deleteOne({_id:new ObjectId(bookId)})
            console.log(result)
            res.status(200).json(result)
        }
        catch(err){
            res.status(500).json({error:"Could not delete document"})
        }
    }
    else{
        res.status(500).json({error:"Not a valid Document ID."})
    }
})

app.patch('/books/:id', async(req,res)=>{
    const bookId = req.params.id
    const update = req.body
    if(ObjectId.isValid(bookId)){
        try{
            const result = await db.collection('books').updateOne({_id:new ObjectId(bookId)}, {$set:update})
            res.status(201).json(result)
        }
        catch(err){
            res.status(500).json({error:"Could not update document"})
        }
    }
    else{
        res.status(500).json({error:"Not a valid Document ID."})
    }
})