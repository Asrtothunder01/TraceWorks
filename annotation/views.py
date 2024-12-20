from django.shortcuts import render,get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Annotation,Project,Image
import json
# Create your views here.
def home(request):
    return render(request,'label.html')

def get_images(request,project_id):
    images = Image.objects.filter(project_id=project_id).values('id','image_file')

    return JsonResponse(list(images),safe=False)

def get_projects(request):
    project = Project.objects.all().values('id','name','description')
    return JsonResponse(list(project),safe = False)

@csrf_exempt
def save_annotation(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        image = get_object_or_404(image,id=data['image_id'])
        annotation = Annotation.objects.create(image = image,data=data['annotation_data'])
        return JsonResponse({'message':"Annotaton Saved Successfully!"},status = 201)
    return JsonResponse({"error": "Invalid request"},status = 400)