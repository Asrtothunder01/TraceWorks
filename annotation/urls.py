from django.urls import path
from .views import home, save_annotation, get_projects, get_images

urlpatterns = [
    path('', home, name='annotation_tool'),
    path('annotation/', save_annotation, name='save_annotation'),  # Fixed URL for saving annotations
    path('project/', get_projects, name='projects'),
    path('image/<int:project_id>/', get_images, name='images'),
]
