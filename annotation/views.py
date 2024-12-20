from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Annotation, Project, Image
import json

# Create your views here.
def home(request):
    return render(request, 'label.html')

def get_images(request, project_id):
    images = Image.objects.filter(project_id=project_id).values('id', 'image_file')
    return JsonResponse(list(images), safe=False)

def get_projects(request):
    projects = Project.objects.all().values('id', 'name', 'description')
    return JsonResponse(list(projects), safe=False)

@csrf_exempt
def save_annotation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            if 'image_id' not in data or 'annotation_data' not in data:
                return JsonResponse({'error': 'Invalid data payload'}, status=400)

            image = get_object_or_404(Image, id=data['image_id'])
            annotation = Annotation.objects.create(image=image, data=data['annotation_data'])
            return JsonResponse({'message': "Annotation Saved Successfully!"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
