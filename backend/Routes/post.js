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

/////////////////////////////////////////////////// GET MY POST ////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////// GET ALL POSTS ///////////////////////////////////////////////////////////

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

////////////////////////////////////////////////// GET POST BY ID //////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////// UPDATE POST BY ID//////////////////////////////////////////////////////

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

router.delete("/:id", checkAuth, async (req, res, next) => {
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
// Like a post
// router.put("/:postId/like", checkAuth, async (req, res) => {
//   const postId = req.params.postId;
//   const userId = req.userData.userId; // Assuming you have user authentication middleware

//   try {
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     if (post.likes.includes(userId)) {
//       return res.status(400).json({ message: "Post already liked" });
//     }
//        // Remove user from dislikes array if already present
//     if (post.dislikes.includes(userId)) {
//       post.dislikes.pull(userId);
//     }

//     post.likes.push(userId);
//     await post.save();

//     res.status(200).json({ message: "Post liked successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Dislike a post
// router.put("/:postId/dislike", checkAuth, async (req, res) => {
//   const postId = req.params.postId;
//   const userId = req.userData.userId; // Assuming you have user authentication middleware

//   try {
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     if (post.dislikes.includes(userId)) {
//       return res.status(400).json({ message: "Post already disliked" });
//     }

//        // Remove user from likes array if already present
//     if (post.likes.includes(userId)) {
//       post.likes.pull(userId);
//     }
//     post.dislikes.push(userId);
//     await post.save();

//     res.status(200).json({ message: "Post disliked successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Comment on a post
// router.post("/:postId/comment", checkAuth, async (req, res) => {
//   const postId = req.params.postId;
//   const { content } = req.body;
//   const userId = req.userData.userId; // Assuming you have user authentication middleware

//   try {
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     const comment = {
//       content,
//       user: userId,
//     };
//     const newComment = await post.comments.create(comment);
//     post.comments.push(newComment);
//     await post.save();

//     res
//       .status(200)
//       .json({ message: "Comment added successfully", comment: newComment });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// router.delete("/:postId/comment/:commentId", async (req, res, next) => {
//   try {
//     const postId = req.params.postId;
//     const commentId = req.params.commentId;

//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     const commentIndex = post.comments.findIndex(
//       (comment) => comment._id.toString() === commentId
//     );

//     if (commentIndex === -1) {
//       return res.status(404).json({ message: "Comment not found" });
//     }

//     post.comments.splice(commentIndex, 1);
//     await post.save();

//     res.status(200).json({ message: "Comment deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Deleting comment failed" });
//   }
// });

router.post("/:postId/toggle-like", checkAuth, async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    const userLiked = post.likes.includes(userId);
    const userDisliked = post.dislikes.includes(userId);

    if (userLiked) {
      // User already liked, remove the like
      post.likes.pull(userId);
    } else if (userDisliked) {
      // User already disliked, remove the dislike and add like
      post.dislikes.pull(userId);
      post.likes.push(userId);
    } else {
      // User didn't like or dislike, add like
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to toggle like/dislike on the post." });
  }
});

// Comment on a post
router.post("/:postId/comment", checkAuth, async (req, res) => {
  const { postId } = req.params;
  const { content, userId } = req.body;

  try {
    const post = await Post.findById(postId);
    post.comments.unshift({ content, user: userId });
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment to the post." });
  }
});
module.exports = router;
