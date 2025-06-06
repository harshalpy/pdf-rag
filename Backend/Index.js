import express from "express";
import multer from "multer";
import cors from "cors";
import { v4 as uuid } from "uuid";
import fs from "fs";
import pdfParse from "pdf-parse";
import { OpenAI } from "openai/client.js";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index("quickstart");

function chunkText(text, maxLength = 500) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let chunk = "";
    for (const sentence of sentences) {
        if ((chunk + sentence).length > maxLength) {
            chunks.push(chunk.trim());
            chunk = sentence;
        } else {
            chunk += sentence;
        }
    }
    if (chunk) chunks.push(chunk.trim());
    return chunks;
}

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads/");
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        },
    }),
});

app.use("/pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file){
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        const chunks = chunkText(data.text);

        const vectors = await Promise.all(
            chunks.map(async (text, i) => {
                const embedding = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: text,
                });
                return {
                    id: `chunk-${Date.now()}-${i}`,
                    values: embedding.data.data[0].embedding,
                    metadata: { text },
                };
            })
        );

        await index.upsert({ upsertRequest: { vectors } });
        res.status(200).json({ message: "PDF uploaded and indexed", chunks: vectors.length });
    } 
    catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

app.post("/chat", async (req, res) => {
    const { message } = req.body
    if (!message){
        return res.status(400).json({ error: "Question required" })
    }

    return res.json({ 
        id: uuid(),
        answer: "Hello",
        role: "assistant",
        timestamp: new Date().toDateString()
    })
    try {
        
        const Embedding = (await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: message
        })).data.data[0].embedding
        
        const queryRes = await index.query({
            queryRequest: {
                vector: Embedding,
                topK: 5,
                includeMetadata: true
            }
        })

        const context = queryRes.matches.map(m => m.metadata.text).join("\n\n")
        const chatRes = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "Answer based on the provided context." },
                { role: "user", content: `Context:\n${context}\n\nQuestion:\n${question}` }
            ]
        })

        res.json({ answer: chatRes.data.choices[0].message.content })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to process question" })
    }
})

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
