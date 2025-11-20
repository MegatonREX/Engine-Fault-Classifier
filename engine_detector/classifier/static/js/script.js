// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// File Upload Functionality
const audioFile = document.getElementById('audioFile');
const fileInfo = document.getElementById('fileInfo');
const uploadBtn = document.getElementById('uploadBtn');

audioFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileInfo.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
        fileInfo.classList.add('active');
        uploadBtn.disabled = false;
    } else {
        fileInfo.classList.remove('active');
        uploadBtn.disabled = true;
    }
});

uploadBtn.addEventListener('click', () => {
    const file = audioFile.files[0];
    if (file) {
        uploadAndClassify(file);
    }
});

// Audio Recording Functionality
let mediaRecorder;
let audioChunks = [];
let recordedBlob;

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const recordingStatus = document.getElementById('recordingStatus');
const audioPreview = document.getElementById('audioPreview');
const analyzeRecordingBtn = document.getElementById('analyzeRecordingBtn');

recordBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
analyzeRecordingBtn.addEventListener('click', analyzeRecording);

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(recordedBlob);
            
            audioPreview.innerHTML = `
                <p><i class="fas fa-check-circle"></i> Recording completed successfully!</p>
                <audio controls src="${audioUrl}"></audio>
            `;
            audioPreview.classList.add('active');
            analyzeRecordingBtn.disabled = false;
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        recordingStatus.textContent = '● Recording...';
        recordingStatus.classList.add('active');
        audioPreview.classList.remove('active');
        analyzeRecordingBtn.disabled = true;
    } catch (error) {
        showError('Failed to access microphone. Please grant permission and try again.');
        console.error('Recording error:', error);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        recordingStatus.textContent = 'Recording stopped';
        recordingStatus.classList.remove('active');
    }
}

async function analyzeRecording() {
    if (!recordedBlob) {
        showError('No recording available to analyze.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64Audio = reader.result;
        classifyRecordedAudio(base64Audio);
    };
    reader.readAsDataURL(recordedBlob);
}

// Upload and Classify Audio File
async function uploadAndClassify(file) {
    const formData = new FormData();
    formData.append('audio_file', file);

    showLoading(true);

    try {
        const response = await fetch('/classify/', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        showLoading(false);
        displayResults(result);
    } catch (error) {
        showLoading(false);
        showError('Failed to classify audio. Please try again.');
        console.error('Classification error:', error);
    }
}

// Classify Recorded Audio
async function classifyRecordedAudio(base64Audio) {
    showLoading(true);

    try {
        const formData = new FormData();
        formData.append('audio_data', base64Audio);

        const response = await fetch('/classify/', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        showLoading(false);
        displayResults(result);
    } catch (error) {
        showLoading(false);
        showError('Failed to classify recording. Please try again.');
        console.error('Classification error:', error);
    }
}

// Display Results
function displayResults(result) {
    const resultsSection = document.getElementById('resultsSection');
    const resultIcon = document.getElementById('resultIcon');
    const resultLabel = document.getElementById('resultLabel');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceValue = document.getElementById('confidenceValue');

    if (result.success) {
        const isFaulty = result.predicted_label === 'Faulty';
        
        // Set icon
        resultIcon.innerHTML = isFaulty 
            ? '<i class="fas fa-exclamation-triangle"></i>' 
            : '<i class="fas fa-check-circle"></i>';
        resultIcon.className = `result-icon ${isFaulty ? 'faulty' : 'not-faulty'}`;
        
        // Set label
        resultLabel.textContent = result.predicted_label;
        resultLabel.className = `label-value ${isFaulty ? 'faulty' : 'not-faulty'}`;
        
        // Set confidence
        confidenceBar.style.width = '0%';
        setTimeout(() => {
            confidenceBar.style.width = `${result.confidence}%`;
        }, 100);
        confidenceValue.textContent = `${result.confidence}%`;
        
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        showError(result.error || 'Failed to classify audio.');
    }
}

// Show Loading Overlay
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Show Error Message
function showError(message) {
    alert(message);
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Prevent form submission on Enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});
