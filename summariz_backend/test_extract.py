import os
import nltk
from nltk.tokenize import sent_tokenize
from summarizer import extract_text_from_pdf, summarize_text_extractive, abstractive_summary_bullets

nltk.download("punkt")

def summarize_pdf_to_bullets(pdf_path: str, min_bullets=3, max_bullets=5):
    """
    Full pipeline:
    1. Extract text from PDF
    2. Extractive summary (key sentences)
    3. Abstractive summary into 3–5 bullet points
    Bullet count adapts to PDF length.
    """
    # Step 1: Extract text
    text = extract_text_from_pdf(pdf_path)
    if not text or text.startswith("Error"):
        return [f"Error reading PDF: {text}"]

    # Step 2: Extractive summary
    # Determine number of sentences: larger PDFs get more extractive sentences
    page_count_estimate = max(1, text.count("\f"))  # estimate pages using form feed if exists
    sentence_count = min(20, max(8, page_count_estimate * 4))  # 8–20 sentences
    extractive_sentences = summarize_text_extractive(text, sentence_count=sentence_count)
    
    if isinstance(extractive_sentences, list):
        extractive_text = " ".join(extractive_sentences)
    else:
        extractive_text = extractive_sentences

    # Step 3: Determine bullet count dynamically (3–5)
    num_bullets = min(max_bullets, max(min_bullets, len(extractive_sentences)//2))

    # Step 4: Abstractive summary into human-readable bullets
    bullets = abstractive_summary_bullets(extractive_text, num_bullets=num_bullets)

    # Fallback: ensure at least min_bullets
    if len(bullets) < min_bullets:
        sentences = sent_tokenize(extractive_text)
        bullets = ["- " + s.strip() for s in sentences if s.strip()]
        bullets = bullets[:min_bullets]

    return bullets

# ------------------ Example Usage ------------------ #
if __name__ == "__main__":
    pdf_file = os.path.join(os.path.dirname(__file__), "test.pdf")  # replace with your PDF
    
    # Step 1: Summarize PDF into bullets
    bullets = summarize_pdf_to_bullets(pdf_file, min_bullets=3, max_bullets=5)
    print("----- Final AI-style Bullet Summary -----")
    for i, b in enumerate(bullets, 1):
        print(f"{i}. {b}")
    
    


