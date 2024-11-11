import express from "express"
import mongoose from "mongoose"
import { nanoid } from "nanoid"
import validator from "validator"
import Url from "./models/urlModel.js"

const app = express()
const port = 3000

app.use(express.json())

mongoose
  .connect("mongodb://localhost:27017/bas_test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

app.post("/shorten", async (req, res) => {
  const { url } = req.body

  if (!validator.isURL(url)) {
    return res.status(400).json({ error: "Invalid URL" })
  }

  const shortCode = nanoid(8)

  try {
    const newUrl = new Url({ originalUrl: url, shortCode })
    await newUrl.save()

    res.status(200).json({
      shortcode: shortCode,
      redirect: `${req.protocol}://${req.get("host")}/${shortCode}`,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
})

app.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params

  try {
    const urlData = await Url.findOne({ shortCode: shortcode })

    if (urlData) {
      res.redirect(302, urlData.originalUrl)
    } else {
      res.status(404).json({ error: "Shortcode not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
