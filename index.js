require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const yup = require("yup");
const monk = require("monk");
const { nanoid } = require("nanoid");

const app = express();
const port = process.env.PORT || 1337;

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");

urls.createIndex({ slug: 1 }, { unique: true });

app.use(helmet());

app.use(morgan("tiny"));
app.use(cors());

app.use(express.json());

app.use(express.static("./public"));

app.get("/:id", async (req, res) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
    }
    res.redirect(`/?error=${slug} not found`);
  } catch (e) {
    res.redirect(`/?error=Link not found`);
  }
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().url().required(),
});

app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });

    if (!slug) {
      slug = nanoid(5);
    } else {
      const existing = await urls.findOne({ slug });
      if (existing) {
        throw new Error(`${slug} already exists`);
      }
    }

    slug = slug.toLowerCase();

    const newUrl = {
      url,
      slug,
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (err) {
    console.error("Error", err);
    if (err.message.startsWith("E11000")) {
      error.message = "Slug in use";
    }
    next(err);
  }

  // TODO: Create a short URL
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "" : error.stack,
  });
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
