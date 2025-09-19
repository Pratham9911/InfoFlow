import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from .summarizer import summarize_pdf_title_and_bullets
import tempfile

app = FastAPI()

# ----------------- CORS Setup ----------------- #
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Upload PDF Endpoint ----------------- #
@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Save uploaded file to a temporary path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Generate summary
        title, bullets = summarize_pdf_title_and_bullets(tmp_path, min_bullets=3, max_bullets=5)

        # Ensure bullets is a list of strings, each starting with "-"
        if isinstance(bullets, str):
            bullets_list = [
                f"- {line.strip()}" if not line.strip().startswith("-") else line.strip()
                for line in bullets.split("\n")
                if line.strip()
            ]
        elif isinstance(bullets, list):
            bullets_list = [
                f"- {line.strip()}" if not line.strip().startswith("-") else line.strip()
                for line in bullets
                if line.strip()
            ]
        else:
            bullets_list = []

        # Clean up temporary file
        os.remove(tmp_path)

        return {
            "filename": file.filename,
            "title": title.strip(),
            "bullets": bullets_list
        }

    except Exception as e:
        return {"error": str(e)}
