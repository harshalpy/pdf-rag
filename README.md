# 🧠 PDF-based RAG Chatbot System

A powerful document-based chatbot that enables **context-aware question answering** over uploaded PDF files using **Retrieval-Augmented Generation (RAG)** with OpenAI's GPT API and Pinecone vector search.

## 🚀 Features

- 📄 Upload PDF documents and ask questions directly.
- 🔍 Semantic search using vector embeddings and Pinecone.
- 💬 Accurate, real-time answers grounded in the document's content.
- 🌐 Full-stack solution with Next.js (frontend) and Express.js (backend).
- 🧠 Uses OpenAI for embedding generation and GPT for response generation.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, TailwindCSS (optional), Axios
- **Backend**: Express.js, Node.js
- **Vector DB**: Pinecone
- **LLM API**: OpenAI (for embeddings + GPT)
- **PDF Parsing**: `pdf-parse`.
- **Deployment**: Vercel (frontend), Render (backend)