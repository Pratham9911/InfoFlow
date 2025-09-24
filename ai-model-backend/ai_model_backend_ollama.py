import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import subprocess

app = FastAPI()

# ----------------- CORS ----------------- #
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

# ----------------- Helper: PDF text extraction ----------------- #
import pdfplumber

def extract_text_from_pdf(pdf_path: str) -> str:
    all_text = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    all_text.append(text)
    except Exception as e:
        return f"Error reading PDF: {e}"
    return "\n".join(all_text)



def summarize_with_ollama(text: str, filename: str):
    text = text[:4000]  # limit to avoid overload
    filename_lower = filename.lower()

    # Default prompt (for general documents)
    prompt = (
            f"Read the following PDF content of an invoice and generate a short, professional summary.\n"
            f"Include only the fields that are present in the document. Do not assume missing values.\n"
            f"Always include if present:\n"
            f"1️⃣ Invoice Number\n"
            f"2️⃣ Invoice Date and Due Date\n"
            f"3️⃣ From (Issuer/Company/Engineer)\n"
            f"4️⃣ To (Client/Customer)\n"
            f"5️⃣ Project/Work Name or Main Service\n"
            f"6️⃣ Engineer or Contact Person\n"
            f"7️⃣ Total Amount Payable (including taxes)\n"
            f"8️⃣ Payment Terms (like Net 14 days)\n"
            f"9️⃣ Payment Instructions (bank name, account number, or method)\n\n"
            f"Keep the summary concise (2–5 lines).\n\n"
            f"INVOICE TEXT:\n{text}"
        )


    # If filename suggests invoice
    if "invoice" in filename_lower:
        prompt = (
            f"Read the following PDF content of an invoice and generate a short, professional summary.\n"
            f"Include only the fields that are present in the document. Do not assume missing values.\n"
            f"Always include if present:\n"
            f"1️⃣ Invoice Number\n"
            f"2️⃣ Invoice Date and Due Date\n"
            f"3️⃣ From (Issuer/Company/Engineer)\n"
            f"4️⃣ To (Client/Customer)\n"
            f"5️⃣ Project/Work Name or Main Service\n"
            f"6️⃣ Engineer or Contact Person\n"
            f"7️⃣ Total Amount Payable (including taxes)\n"
            f"8️⃣ Payment Terms (like Net 14 days)\n"
            f"9️⃣ Payment Instructions (bank name, account number, or method)\n\n"
            f"Keep the summary concise (2–5 lines).\n\n"
            f"INVOICE TEXT:\n{text}"
        )

    # If filename suggests tender
    elif "tender" in filename_lower:
        prompt = (
            f"You are an expert assistant analyzing a tender document.\n"
            f"Your task is to extract the most important information concisely so someone can quickly understand the tender.\n"
            f"Specifically, extract the following if present:\n"
            f"1️⃣ Tender Title / Project Name\n"
            f"2️⃣ Tender Number / Reference ID\n"
            f"3️⃣ Issuing Authority / Organization\n"
            f"4️⃣ Submission Deadline / Important Dates\n"
            f"5️⃣ Contact Person / Department\n"
            f"6️⃣ Estimated Budget / Amount / Financial Details\n"
            f"7️⃣ Scope of Work / Services Required\n"
            f"8️⃣ Eligibility Criteria / Requirements\n"
            f"9️⃣ Submission Instructions / Method\n\n"
            f"Format your response clearly and professionally like this:\n"
            f"- Tender Title: <text>\n"
            f"- Tender Number: <text>\n"
            f"- Issuing Authority: <text>\n"
            f"- Submission Deadline: <text>\n"
            f"- Contact: <text>\n"
            f"- Estimated Amount: <text>\n"
            f"- Scope of Work: <bullet points>\n"
            f"- Eligibility Criteria: <bullet points>\n"
            f"- Submission Instructions: <text>\n\n"
            f"Keep it concise, 2–5 lines per section, do not assume missing info.\n\n"
            f"TENDER DOCUMENT TEXT:\n{text}"
        )

    # Run Ollama
    process = subprocess.Popen(
        ["ollama", "run", "mistral", prompt],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    output, error = process.communicate()
    if error:
        return f"Error: {error.strip()}"
    return output.strip()

# ----------------- New API Endpoint ----------------- #
@app.post("/upload-pdf-ollama/")
async def upload_pdf_ollama(file: UploadFile = File(...)):
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Extract text
        pdf_text = extract_text_from_pdf(tmp_path)
        if pdf_text.startswith("Error"):
            os.remove(tmp_path)
            return {"error": pdf_text}

        # Generate summary using Ollama
        summary_text = summarize_with_ollama(pdf_text , filename=file.filename)

        # Split title and bullets (assumes title in first line)
        lines = [line.strip() for line in summary_text.split("\n") if line.strip()]
        title = lines[0] if lines else file.filename
        bullets = [f"- {line}" if not line.startswith("-") else line for line in lines[1:]]

        # Clean up
        os.remove(tmp_path)

        return {"filename": file.filename, "title": title, "bullets": bullets}

    except Exception as e:
        return {"error": str(e)}
