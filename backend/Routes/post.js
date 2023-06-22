const express = require("express");
const Post = require("../models/post");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middlewares/check-auth");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
};

//////////////////////////////////////////////////// MULTER ///////////////////////////////////////////////////////////////

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
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

//////////////////////////////////////////////// CREATE POST ////////////////////////////////////////////////////////////////

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res) => {
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

/////////////////////////////////////////////////// GET MY POST ////////////////////////////////////////////////////////////

router.get("/mypost", checkAuth, async (req, res) => {
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

////////////////////////////////////////////////// GET ALL POSTS ///////////////////////////////////////////////////////////

router.get("", async (req, res) => {
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

////////////////////////////////////////////////// GET POST BY ID //////////////////////////////////////////////////////////

router.get("/:id", async (req, res) => {
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

///////////////////////////////////////////////////// UPDATE POST BY ID//////////////////////////////////////////////////////

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res) => {
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
        creator: req.userData.userId,
      };

      const updatedPost = await Post.findByIdAndUpdate(
        { _id: postId, creator: req.userData.userId },
        post,
        { new: true }
      );

      if (updatedPost) {
        res
          .status(200)
          .json({ message: "Update successful!", post: updatedPost });
      } else {
        res.status(404).json({
          message: "Post not found or you are not authorized to update it",
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating post" });
    }
  }
);

///////////////////////////////////////////////////// DELETE POST BY ID ////////////////////////////////////////////////

router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete({
      _id: req.params.id,
      creator: req.userData.userId,
    });
    if (deletedPost) {
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.status(404).json({
        message: "Post not found or you are not authorized to delete it",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting the post" });
  }
});

// //////////////////////////////////////////////// LIKE /////////////////////////////////////////////////////////

// router.post("/like/:postid", checkAuth, async (req, res, next) => {
//   const postId = req.params.postid;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     await Dislike.findOneAndDelete({
//       user_id: req.userData.userId,
//       post_id: postId,
//     });

//     const existingLike = await Like.findOne({
//       user_id: req.userData.userId,
//       post_id: postId,
//     });

//     if (existingLike) {
//       return res.status(400).json({ error: "You have already liked the post" });
//     }

//     const newLike = new Like({
//       user_id: req.userData.userId,
//       post_id: postId,
//     });

//     const savedLike = await newLike.save();
//     if (savedLike) {
//       return res.json({ message: "Post liked successfully" });
//     } else {
//       return res.status(500).json({ error: "Failed to like the post" });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });

// /////////////////////////////////////////////////////// DISLIKE //////////////////////////////////////////////////////////

// router.post("/dislike/:postid", checkAuth, async (req, res, next) => {
//   const postId = req.params.postid;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     await Like.findOneAndDelete({
//       user_id: req.userData.userId,
//       post_id: postId,
//     });

//     const existingDislike = await Dislike.findOne({
//       user_id: req.userData.userId,
//       post_id: postId,
//     });

//     if (existingDislike) {
//       return res.status(400).json({ error: "You have already disliked the post" });
//     }

//     const newDislike = new Dislike({
//       user_id: req.userData.userId,
//       post_id: postId,
//     });

//     const savedDislike = await newDislike.save();
//     if (savedDislike) {
//       return res.json({ message: "Post disliked successfully" });
//     } else {
//       return res.status(500).json({ error: "Failed to dislike the post" });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });

// ///////////////////////////////////////////////GET ALL LIKES////////////////////////////////////////////////////////////

// router.get("/likes/:postid", async (req, res, next) => {
//   const postId = req.params.postid;

//   try {
//     const likes = await Like.find({ post_id: postId });
//     const totalLikes= likes.length;
//     res.json({totalLikes, likes });
//   } catch (error) {
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });

// /////////////////////////////////////////////////// GET ALL DISLIKES //////////////////////////////////////////////////

// router.get("/dislikes/:postid", async (req, res, next) => {
//   const postId = req.params.postid;

//   try {
//     const dislikes = await Dislike.find({ post_id: postId });
//     const totalDislikes = dislikes.length;
//     res.json({ totalDislikes,dislikes });
//   } catch (error) {
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });

// /////////////////////////////////////////////////////CREATE COMMENT/////////////////////////////////////////////////////////
// router.post("/comment/:postid", checkAuth, async (req, res, next) => {
//   const postId = req.params.postid;
//   const post = await Post.findById(postId);

//   if (!post) {
//     return "Post does not exists";
//   }

//   const addComment = new Comment({
//     user_id: req.userData.userId,
//     post_id: post.id,
//     comment: req.body.comment,
//   });
//   const created = await addComment.save();

//   if (created) {
//     res.json({
//       msg: "Comment Added Successfully",
//     });
//   } else {
//     return "Something went wrong", 500;
//   }
// });

// ///////////////////////////////////////////////////////GET ALL COMMENTS ////////////////////////////////////////////////////

// router.get("/comment/getAllComments", async (req, res, next) => {
//   const comments = await Comment.find();
//   res.status(200).json({
//     numberOfComments: comments.length,
//     comments,
//   });
// });

// Like or Unlike Post

router.get("/:postId/likes", checkAuth, async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return "Post Not Found", 404;
  }

  if (post.likes.includes(req.userData.userId)) {
    const index = post.likes.indexOf(req.userData.userId);

    post.likes.splice(index, 1);
    post.likeCount -= 1;
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Unliked",
      likeCount: post.likes.length,
    });
  } else {
    post.likes.push(req.userData.userId);
    post.likeCount += 1; // Increment like count

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Liked",
      likeCount: post.likes.length
    });
  }
});

// Add Comment
router.post("/:postId/comment", checkAuth, async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return "Post Not Found", 404;
  }

  if (post.comments.includes(req.userData.userId)) {
    return "Already Commented", 500;
  }

  const newComment = {
    user: req.userData.userId,
    comment: req.body.comment,
  };
  post.comments.unshift(newComment);

  await post.save();

  return res.status(200).json({
    success: true,
    message: "Comment Added",
    comment: newComment,
  });
});

module.exports = router;
