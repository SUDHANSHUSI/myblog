const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// const url = "mongodb://testuser:9eVH8YT0rVZ0X1uj@cluster0-shard-00-00.ecaql.mongodb.net:27017,cluster0-shard-00-01.ecaql.mongodb.net:27017,cluster0-shard-00-02.ecaql.mongodb.net:27017/BLOGAPP?ssl=true&replicaSet=atlas-ceza4t-shard-0&authSource=admin&retryWrites=true&w=majority";
const url =
  "mongodb+srv://sudhanshu_2350:lanet_team@cluster0.owzq9ud.mongodb.net/BLOGAPP?retryWrites=true&w=majority";
// Connect MongoDB at default port 27017.
mongoose
  .connect(url, {
    useNewUrlParser: true,
    //   useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database is connected succesfully...");
  })
  .catch((err) => {
    console.log("Error in DB connection: " + err);
  });
