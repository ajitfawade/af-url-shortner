require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();
const port = process.env.PORT || 1337;

app.use(helmet());

app.use(morgan("tiny"));
app.use(cors());

app.use(express.json());

app.use(express.static("./public"));
/* 
app.get("/url/:id", (req, res) => {
  // TODO: Get a short URL by id
});

app.post("/:id", (req, res) => {
  // TODO: Redirect to URL
});

app.post("/url", (req, res) => {
  // TODO: Create a short URL
});
 */
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
