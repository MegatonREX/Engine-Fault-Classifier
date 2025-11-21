# Engine Fault Detection Django App

A modern, responsive web application for detecting engine faults from audio files using deep learning.

## Features

- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 🌓 **Day/Night Mode**: Toggle between light and dark themes
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🎤 **Audio Recording**: Record engine sounds directly from your browser
- 📁 **File Upload**: Support for multiple audio formats (MP3, WAV, OGG, M4A, FLAC, AAC, WebM)
- 🤖 **AI-Powered**: Uses TensorFlow model for accurate fault detection
- 📊 **Visual Results**: Clear visualization of prediction results with confidence scores

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup Steps

1. Navigate to the Django app directory:
```bash
cd engine_detector
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

3. Run database migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

5. Open your browser and navigate to:
```
http://127.0.0.1:8000/
```

## Usage

### Upload Audio File
1. Click on "Choose Audio File" button
2. Select an audio file from your device
3. Click "Analyze Audio" button
4. View the results with confidence score

### Record Audio
1. Click "Start Recording" button (grant microphone permission if prompted)
2. Record the engine sound
3. Click "Stop Recording" button
4. Preview the recording
5. Click "Analyze Recording" button
6. View the results with confidence score

## Supported Audio Formats

- WAV
- MP3
- OGG
- M4A
- FLAC
- AAC
- WebM

## Project Structure

```
engine_detector/
├── manage.py
├── requirements.txt
├── engine_detector/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── classifier/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── classifier_utils.py
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── css/
│       │   └── style.css
│       └── js/
│           └── script.js
└── media/
    └── temp/
```

## Technologies Used

- **Backend**: Django 5.2.8
- **Machine Learning**: TensorFlow, Keras
- **Audio Processing**: Librosa, PyDub
- **Frontend**: HTML5, CSS3, JavaScript
- **Icons**: Font Awesome 6.4.0

## Model Information

The application uses a pre-trained Keras model (`engine_fault_classifier.h5`) that:
- Extracts MFCC features from audio files
- Classifies engine sounds as "Faulty" or "Not Faulty"
- Provides confidence scores for predictions

## API Endpoints

### POST /classify/
Classifies uploaded audio files or recorded audio data.

**Parameters:**
- `audio_file`: Audio file (multipart/form-data)
- OR `audio_data`: Base64 encoded audio data

**Response:**
```json
{
    "success": true,
    "predicted_label": "Not Faulty",
    "predicted_class": 1,
    "confidence": 95.67,
    "probability": 0.9567
}
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Notes

- For production deployment, change `SECRET_KEY` in `settings.py`
- Set `DEBUG = False` in production
- Configure proper `ALLOWED_HOSTS`
- Use HTTPS in production
- Implement proper CSRF protection

## Troubleshooting

### Microphone Access Issues
- Ensure your browser has permission to access the microphone
- HTTPS is required for microphone access in production

### Model Loading Issues
- Verify that `engine_fault_classifier.h5` is in the root directory
- Check TensorFlow installation

### Audio Format Issues
- Install FFmpeg for better audio format support
- PyDub requires FFmpeg for non-WAV formats

## License

This project is open source and available for educational purposes.

## Credits

Developed with ❤️ using Django and TensorFlow
