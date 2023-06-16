const path = require("path");
const express = require("express")
// const mongoose = require("mongoose")
const db = require("./db/db")
const header_middleware = require("./middlewares/header")

const postRouter = require("./Routes/post");
const userRoutes = require("./Routes/user");
const profileRoutes = require("./Routes/profile");
// const likeDislikeRoutes = require('./Routes/likeDislike');
// const commentRoutes = require('./Routes/comment')

var cors = require('cors');


const app = express()
app.use(cors({origin: '*'}));
const PORT = process.env.PORT || 3000


app.use(express.json())
app.use(header_middleware)
const directory = path.join(__dirname, './images');
app.use("/images", express.static(directory));
// app.use("/", express.static(path.join(__dirname, 'frontend/dist/myblog')));


app.use("/api/posts", postRouter)
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
// app.use('/api/likeDislike',likeDislikeRoutes);
// app.use("/api/comment",commentRoutes)


app.get('/test', (req, res) => {
    res.send('Hello World!')
  })

// app.get('*',(req,res)=>{
//     res.sendFile(path.join(__dirname,"frontend","dist","myblog","index.html"))
// });
app.listen(PORT, (req,res) => {
    
    console.log(`Server is listening to PORT ${PORT}....`)
})
