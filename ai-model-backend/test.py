import pdfplumber
import subprocess
import os

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text from a multi-page PDF."""
    all_text = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    all_text.append(text)
    except Exception as e:
        return f"Error reading PDF: {e}"
    print(all_text)
    return "\n".join(all_text)

def summarize_with_ollama(text: str) -> str:
    """Sends text to Ollama Mistral model for summarization."""
    # Limit text to avoid overwhelming the model
    text = text[:500]

    prompt = f"Summarize the following pdf content in few points start with title and Purpose:\n\n{text}"

    result = subprocess.run(
    ["ollama", "run", "mistral", prompt],
    capture_output=True,
    text=True,
    encoding="utf-8"   # <-- add this line
)


    return result.stdout.strip()

if __name__ == "__main__":
    pdf_path = os.path.join(os.path.dirname(__file__), "Metro_Safety_Guidelines.pdf")
    text = extract_text_from_pdf(pdf_path)

    if text.startswith("Error"):
        print(text)
    else:
        print("✅ Extracted text from PDF\n")

        summary = summarize_with_ollama(text)
        print("--- Ollama Response ---\n")
        print(summary)
