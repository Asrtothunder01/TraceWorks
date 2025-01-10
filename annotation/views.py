from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
import base64
import os
import uuid

from django.shortcuts import render
# Save drawing API
@csrf_exempt
def save_drawing(request):
    if request.method == 'POST':
        try:
            data = request.POST.get('drawing')  # Drawing data in base64
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            filename = f"{uuid.uuid4()}.{ext}"
            filepath = os.path.join('media/drawings', filename)

            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(imgstr))
            
            return JsonResponse({'message': 'Drawing saved successfully!', 'file_path': filepath})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

# Share drawing API
@csrf_exempt
def share_drawing(request):
    if request.method == 'POST':
        try:
            import random

            # Simulate generating a shareable URL
            data = request.POST.get('drawing')
            share_url = f"https://myapp.com/share/{random.randint(1000, 9999)}"
            return JsonResponse({'message': 'Shared successfully!', 'share_url': share_url})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)



def index(request):
    return render(request, 'welcome.html')

def trace_view(request):
    return render(request, 'trace.html')  