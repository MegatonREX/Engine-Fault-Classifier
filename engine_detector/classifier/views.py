from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
import base64
import tempfile
from .classifier_utils import classify_audio


def index(request):
    """Render the main page"""
    return render(request, 'index.html')


@csrf_exempt
def classify_audio_view(request):
    """
    Handle audio file upload and classification
    """
    if request.method == 'POST':
        temp_file_path = None
        try:
            # Handle file upload
            if 'audio_file' in request.FILES:
                audio_file = request.FILES['audio_file']
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                file_ext = os.path.splitext(audio_file.name)[1]
                temp_file_path = os.path.join(temp_dir, f'upload_{os.getpid()}{file_ext}')
                with open(temp_file_path, 'wb+') as destination:
                    for chunk in audio_file.chunks():
                        destination.write(chunk)
                # Always convert to wav for classifier
                from pydub import AudioSegment
                wav_path = os.path.join(temp_dir, f'upload_{os.getpid()}.wav')
                try:
                    audio = AudioSegment.from_file(temp_file_path)
                    audio.export(wav_path, format='wav')
                except Exception as e:
                    return JsonResponse({'success': False, 'error': f'Conversion to wav failed: {e}'})
                result = classify_audio(wav_path)
                # Clean up
                for p in [temp_file_path, wav_path]:
                    if p and os.path.exists(p):
                        try:
                            os.remove(p)
                        except:
                            pass
                return JsonResponse(result)
            # Handle recorded audio (base64 encoded)
            elif 'audio_data' in request.POST:
                audio_data = request.POST.get('audio_data')
                if ',' in audio_data:
                    audio_data = audio_data.split(',')[1]
                audio_bytes = base64.b64decode(audio_data)
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                # Save as webm first
                webm_path = os.path.join(temp_dir, f'recording_{os.getpid()}.webm')
                with open(webm_path, 'wb') as f:
                    f.write(audio_bytes)
                # Convert to wav
                from pydub import AudioSegment
                wav_path = os.path.join(temp_dir, f'recording_{os.getpid()}.wav')
                try:
                    audio = AudioSegment.from_file(webm_path)
                    audio.export(wav_path, format='wav')
                except Exception as e:
                    return JsonResponse({'success': False, 'error': f'Conversion to wav failed: {e}'})
                result = classify_audio(wav_path)
                # Clean up
                for p in [webm_path, wav_path]:
                    if p and os.path.exists(p):
                        try:
                            os.remove(p)
                        except:
                            pass
                return JsonResponse(result)
            
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'No audio file or data provided'
                })
                
        except Exception as e:
            # Clean up on error
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except:
                    pass
            
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    })
