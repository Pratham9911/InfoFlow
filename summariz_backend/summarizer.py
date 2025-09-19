import os
import nltk
from nltk.tokenize import sent_tokenize
import pdfplumber
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

nltk.download("punkt")

# ------------------ PDF Extraction ------------------ #
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
    return "\n".join(all_text)

# ------------------ Extractive Summary ------------------ #
def summarize_text_extractive(text, sentence_count=10):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = TextRankSummarizer()
    summary_sentences = summarizer(parser.document, sentence_count)
    return [str(sentence).strip() for sentence in summary_sentences]

# ------------------ Abstractive Summary ------------------ #
_MODEL_NAME = "facebook/bart-large-cnn"
_tokenizer = None
_model = None

def _init_model():
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(_MODEL_NAME)
        _model = AutoModelForSeq2SeqLM.from_pretrained(_MODEL_NAME)
    return _tokenizer, _model

def abstractive_summary_bullets(extractive_text, num_bullets=5):
    tokenizer, model = _init_model()

    # Remove header/title-like lines
    clean_sentences = []
    for s in sent_tokenize(extractive_text):
        s = s.strip()
        if s and not any(x in s for x in ["Report", "Prepared By", "Date", "Title", "Subject"]):
            clean_sentences.append(s)
    short_text = " ".join(clean_sentences[:600])  # limit input length

    inputs = tokenizer(short_text, return_tensors="pt", truncation=True, max_length=1024)
    outputs = model.generate(
        **inputs,
        max_length=180,
        num_beams=6,
        early_stopping=True,
        no_repeat_ngram_size=3
    )
    summary_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Post-process bullets
    bullets = []
    for s in sent_tokenize(summary_text):
        s = s.strip()
        if s and len(s.split()) > 3:  # ignore too short sentences
            bullets.append("- " + s)

    # Fallback if not enough bullets
    if len(bullets) < num_bullets:
        bullets += ["- " + s for s in clean_sentences if s not in bullets]
    return bullets[:num_bullets]

# ------------------ Title Extraction ------------------ #
def extract_title(text):
    """Fetch the first non-empty line as the title."""
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if line:  # first non-empty line
            return line[:120]  # limit length for readability
    # fallback if all lines are empty
    return text.strip()[:120]

# ------------------ Full PDF Summarization ------------------ #
def summarize_pdf_title_and_bullets(pdf_path: str, min_bullets=3, max_bullets=5):
    text = extract_text_from_pdf(pdf_path)
    if not text or text.startswith("Error"):
        return "Error reading PDF", [f"Error reading PDF: {text}"]

    # Extract title
    title = extract_title(text)

    # Extractive summary
    page_count_estimate = max(1, text.count("\f"))
    sentence_count = min(20, max(8, page_count_estimate * 4))
    extractive_sentences = summarize_text_extractive(text, sentence_count=sentence_count)
    extractive_text = " ".join(extractive_sentences)

    # Abstractive bullets
    num_bullets = min(max_bullets, max(min_bullets, len(extractive_sentences)//2))
    bullets = abstractive_summary_bullets(extractive_text, num_bullets=num_bullets)

    return title, bullets

# ------------------ Example Usage ------------------ #
if __name__ == "__main__":
    pdf_file = os.path.join(os.path.dirname(__file__), "test1.pdf")  # replace with your PDF
    title, bullets = summarize_pdf_title_and_bullets(pdf_file, min_bullets=3, max_bullets=5)

    print("----- AI-style Title & Bullet Summary -----")
    print(f"Title: {title}")
    print("Bullets:")
    for i, b in enumerate(bullets, 1):
        print(f"{i}. {b}")
