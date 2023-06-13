const express = require('express')
const Post = require('../models/post')
const router = new express.Router()
const multer = require("multer");
const checkAuth = require("../middlewares/check-auth");

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif"
};



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];

        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, "images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-");
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + "-" + Date.now() + "." + ext);
    }
});






// router.post("",
// checkAuth,
//     multer({ storage: storage }).single("image"),
//     (req, res, next) => {
//         const url = req.protocol + "://" + req.get("host")
//         const post = new Post({
//             title: req.body.title,
//             content: req.body.content,
//             imagePath: url + "/images/" + req.file.filename,
//             creator: req.userData.userId,
//             postDate: req.body.postDate,
//         })
//         post.save().
//             then(post => {
//                 if(post){
//                     res.status(201).json({
//                         message: "Post added successfully",
//                         post: {
//                             ...post,
//                             id: post._id
//                         }
//                     })
//                 }
//                 else{
//                     res.status(500).json({ message: "Error Adding Post" });
//                 }
                
//             })
//             .catch(e => {
//             })
//     })


   
// router.put(
//     "/:id",
//     checkAuth,
//     multer({ storage: storage }).single("image"),
//     (req, res, next) => {
//         let imagePath = req.body.imagePath;
//         if (req.file) {
//             const url = req.protocol + "://" + req.get("host");
//             imagePath = url + "/images/" + req.file.filename
//         }

//         const post = new Post({
//             _id: req.body.id,
//             title: req.body.title,
//             content: req.body.content,
//             imagePath: imagePath,
//             creator: req.userData.userId
//         });
//         Post.updateOne(
//             { _id: req.params.id, creator: req.userData.userId },
//             post
//           ).then(result => {
//             if(result){
//                 res.status(200).json({ message: "Update successful!" });
//             }
            
//             else {
//                 res.status(500).json({ message: "Error Upating Post" });
//             }
//         });
//     }
// );


// router.get("/mypost", 
// checkAuth,
// (req, res, next) => {
//     Post.find({creator: req.userData.userId}).then(post => {
//       if (post) {
//         res.status(200).json({
//             message: "Posts fetched successfully!",
//             posts: post
//         });
//       } else {
//         res.status(404).json({ message: "Post not found!" });
//       }
//     })
//     .catch(e=>{
//     });
//   });
  

// router.get("", (req, res, next) => {
//     Post.find().then(documents => {
//         if(documents){
//             res.status(200).json({
//                 message: "Posts fetched successfully!",
//                 posts: documents
//             });
//         }
//         else{
//             res.status(404).json({ message: "Post not found!" });
//         }
       
//     });
// });
// router.get("/:id", (req, res, next) => {
//     Post.findById(req.params.id).then(post => {
//       if (post) {
//         res.status(200).json(post);
//       } else {
//         res.status(404).json({ message: "Post not found!" });
//       }
//     });
//   });
  
//   router.delete("/:id", checkAuth, (req, res, next) => {
//     Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(
//       result => {
//         if (result.n > 0) {
//           res.status(200).json({ message: "Deletion successful!" });
//         } else {
//             return res.status(401).json({ message: "Not authorized!!" });
//         }
//       }
//     );
//   });

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    try {
      const url = req.protocol + "://" + req.get("host");
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId,
        postDate: req.body.postDate,
      });

      const savedPost = await post.save();

      if (savedPost) {
        res.status(201).json({
          message: "Post added successfully",   
          post: {
            ...savedPost._doc,
            id: savedPost._id,
          },
        });
      } else {
        res.status(500).json({ message: "Error adding post" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error adding post" });
    }
  }
);


router.get("/mypost", checkAuth, async (req, res, next) => {
  try {
    const posts = await Post.find({ creator: req.userData.userId });

    if (posts) {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: posts,
      });
    } else {
      res.status(404).json({ message: "Posts not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

router.get("", async (req, res, next) => {
  try {
    const documents = await Post.find();

    if (documents) {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: documents,
      });
    } else {
      res.status(404).json({ message: "Posts not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});


router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    try {
      let imagePath = req.body.imagePath;
      if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
      }

      const postId = req.params.id;
      const post = {
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
      };

      const updatedPost = await Post.findByIdAndUpdate(
        { _id: postId, creator: req.userData.userId },
        post,
        { new: true }
      );

      if (updatedPost) {
        res.status(200).json({ message: "Update successful!", post: updatedPost });
      } else {
        res.status(404).json({ message: "Post not found or you are not authorized to update it" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating post" });
    }
  }
);


  
router.delete("/:id", checkAuth, (req, res, next) => {
    Post.findByIdAndDelete({ _id: req.params.id, creator: req.userData.userId })
      .then(deletedPost => {
        if (deletedPost) {
          res.status(200).json({ message: "Post deleted successfully" });
        } else {
          res.status(404).json({ message: "Post not found or you are not authorized to delete it" });
        }
      })
      .catch(error => {
        res.status(500).json({ message: "An error occurred while deleting the post" });
      });
  });
  



module.exports = router