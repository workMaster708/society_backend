import express from "express";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

// Inlined environment variables
const MONGODB_URI =
  "mongodb+srv://shahriyahossin708708:topayfoundation@cluster0.rsxbx.mongodb.net/topaysociety?retryWrites=true&w=majority&appName=Cluster0";
const EMAIL_USER = "societycontact@topayfoundation.com";
const EMAIL_PASS = "Shahriya7";
const PORT = 5000;

if (!MONGODB_URI || !EMAIL_USER || !EMAIL_PASS) {
  throw new Error("One or more environment variables are missing.");
}

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// MongoDB connection setup
const client = new MongoClient(MONGODB_URI);
let db;

// Connect to MongoDB
(async function connectToDB() {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    db = client.db("topaysociety"); // Replace with your database name
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
})();

// Root route for testing
app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Society Backend</h1><p>Use the API endpoints to interact with the application.</p>");
});

// Projects route
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await db.collection("projects").find({}).toArray();
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch projects" });
  }
});

app.post("/api/projects", async (req, res) => {
  const { title, description, image } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, error: "Title and description are required" });
  }

  try {
    const result = await db.collection("projects").insertOne({ title, description, image, createdAt: new Date() });
    res.status(201).json({ success: true, message: "Project added", projectId: result.insertedId });
  } catch (error) {
    console.error("Error adding project:", error.message);
    res.status(500).json({ success: false, error: "Failed to add project" });
  }
});

// Contact route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: "your-email@example.com", // Replace with your actual email
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
