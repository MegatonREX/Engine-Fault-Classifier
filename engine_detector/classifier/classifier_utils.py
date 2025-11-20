import os
import io
import librosa
import numpy as np
import warnings
import tensorflow as tf
from pydub import AudioSegment
from tensorflow.keras.models import load_model
from pathlib import Path

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
tf.get_logger().setLevel('ERROR')
warnings.filterwarnings("ignore", category=UserWarning)

# Get the path to the model file
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_PATH = os.path.join(BASE_DIR, 'engine_fault_detection', 'engine_fault_classifier.h5')

# Load model
model = load_model(MODEL_PATH)

# Label mapping
LABEL_MAP = {0: "Faulty", 1: "Not Faulty"}

def features_extractor(file):
    """Extract MFCC features from audio file"""
    audio, sample_rate = librosa.load(file, sr=None)
    mfccs_features = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
    mfcc_scaled_features = np.mean(mfccs_features.T, axis=0)
    return mfcc_scaled_features

def classify_audio(file_path):
    """
    Classify audio file and return prediction results
    
    Args:
        file_path: Path to the audio file
        
    Returns:
        dict: Dictionary containing prediction results
    """
    try:
        ext = os.path.splitext(file_path)[1].lower()
        
        # Debug: check if file exists
        if not os.path.exists(file_path):
            return {
                'success': False,
                'error': f'File not found: {file_path}'
            }
        # Handle different audio formats
        if ext == ".wav":
            features = features_extractor(file_path)
        else:
            # Convert to WAV format for processing
            audio = AudioSegment.from_file(file_path)
            buffer = io.BytesIO()
            audio.export(buffer, format="wav")
            buffer.seek(0)
            features = features_extractor(buffer)
        
        # Make prediction
        features = np.expand_dims(features, axis=0)
        prediction = model.predict(features, verbose=0)
        
        # Get results
        probability = float(prediction[0][0])
        predicted_class = int(prediction[0] > 0.5)
        predicted_label = LABEL_MAP[predicted_class]
        confidence = probability if predicted_class == 1 else (1 - probability)
        
        return {
            'success': True,
            'predicted_class': predicted_class,
            'predicted_label': predicted_label,
            'confidence': round(confidence * 100, 2),
            'probability': round(probability, 4)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'{str(e)} | file_path: {file_path}'
        }
