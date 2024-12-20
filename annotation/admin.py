from django.contrib import admin
from .models import Image,Annotation,Project
# Register your models here.

admin.site.register(Project)
admin.site.register(Annotation)
admin.site.register(Image)