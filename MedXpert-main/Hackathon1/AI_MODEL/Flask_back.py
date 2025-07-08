import logging
from flask import Flask, render_template, request, jsonify
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import re
import PyPDF2
from flask_cors import CORS
# Initialize Flask app
app = Flask(__name__)

CORS(app, origins="http://localhost:3000")


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Log: Server startup
logging.info("Flask server is starting...")

# Load and preprocess dataset
csv_path = "medical_records_v2.csv"  # Path to your dataset
try:
    df = pd.read_csv(csv_path)
    logging.info(f"Dataset loaded successfully from {csv_path}")
except Exception as e:
    logging.error(f"Error loading dataset: {e}")
    raise

df['input_text'] = "Symptoms: " + df['Symptoms'] + ". Disease: " + df['Predicted Disease']
df['output_text'] = (
    "Lab Report: Based on the symptoms, tests like CBC, X-Ray, or MRI may be recommended. "
    "Consult a " + df['Doctor Specialization'] + " for further details."
)

# Initialize models
logging.info("Initializing models...")
retriever = SentenceTransformer('all-MiniLM-L6-v2')
tokenizer = T5Tokenizer.from_pretrained("t5-small", legacy=False)
generator = T5ForConditionalGeneration.from_pretrained("t5-small")

# Check for CUDA device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logging.info(f"Using device: {device}")
generator.to(device)

# Precompute embeddings for retrieval
logging.info("Precomputing embeddings for retrieval...")
train_corpus = df['input_text'].tolist()
corpus_embeddings = retriever.encode(train_corpus, convert_to_tensor=True)

def extract_text_from_pdf(pdf_file):
    """Extract text from uploaded PDF."""
    logging.info("Extracting text from PDF...")
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        logging.info("Text extraction from PDF successful.")
        return text
    except Exception as e:
        logging.error(f"Error extracting text from PDF: {e}")
        return ""

def extract_symptoms(text):
    """Extract symptoms from text using simple pattern matching."""
    logging.info("Extracting symptoms from text...")
    symptoms_pattern = re.compile(r"(fever|cough|fatigue|headache|nausea|pain|dizziness|sore throat|vomiting|diarrhea)", re.IGNORECASE)
    symptoms = symptoms_pattern.findall(text)
    logging.info(f"Symptoms found: {symptoms}")
    return ", ".join(set(symptoms)) if symptoms else "No symptoms identified."

def generate_lab_report(symptoms):
    """Generate a lab report and recommend a doctor."""
    logging.info(f"Generating lab report for symptoms: {symptoms}")
    input_text = "Symptoms: " + symptoms

    try:
        # Retrieve relevant text from corpus
        input_embedding = retriever.encode(input_text, convert_to_tensor=True)
        hits = util.semantic_search(input_embedding, corpus_embeddings, top_k=1)
        relevant_index = hits[0][0]['corpus_id']
        relevant_text = train_corpus[relevant_index]
        recommended_doctor = df.iloc[relevant_index]['Doctor Specialization']

        # Generate lab report using T5
        inputs = tokenizer(relevant_text, return_tensors="pt", truncation=True, padding="max_length", max_length=512).to(device)
        outputs = generator.generate(inputs['input_ids'], max_length=150, num_beams=2, early_stopping=True)
        lab_report = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Fix duplicate diseases and unnecessary repetition
        lab_report = re.sub(r'(, ){2,}', ', ', lab_report)  # Fix duplicate commas
        lab_report = re.sub(r'(cold, )+', 'cold, ', lab_report)  # Clean up cold duplication
        lab_report = re.sub(r'(Migraine, )+', 'Migraine, ', lab_report)  # Ensure no repeated 'Migraine'

        logging.info("Lab report generation successful.")
        return lab_report, recommended_doctor
    except Exception as e:
        logging.error(f"Error generating lab report: {e}")
        return "Error generating lab report.", "Unknown"


@app.route('/generate_report', methods=['POST'])
def process_pdf():
    logging.info("Processing POST request to /generate_report route...")

    pdf_file = request.files.get('file')
    if not pdf_file or not pdf_file.filename.endswith('.pdf'):
        logging.warning("No valid PDF file provided.")
        return jsonify({'error': 'Invalid file format. Only PDFs are supported.'}), 400

    pdf_text = extract_text_from_pdf(pdf_file)
    symptoms = extract_symptoms(pdf_text)

    if symptoms == "No symptoms identified.":
        return jsonify({'error': 'No symptoms found in the document.'}), 400

    lab_report, recommended_doctor = generate_lab_report(symptoms)

    # Log the results to console
    print("==== Lab Report ====")
    print(lab_report)
    print("==== Recommended Doctor ====")
    print(recommended_doctor)

    return jsonify({'lab_report': lab_report, 'recommended_doctor': recommended_doctor})


# Default route for the front-end (optional)
@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    logging.info("Starting Flask application...")
    app.run(debug=False)
