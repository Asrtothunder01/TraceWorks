from django.db import models
class  Project(models.Model):
    name =  models.CharField(max_length = 255)

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add = True)

class Image(models.Model):
    
    project = models.ForeignKey(Project,on_delete= models.CASCADE,related_name= 'images')

    image_file = models.ImageField(upload_to= 'images/')

    created_at = models.DateTimeField(auto_now_add = True)

class Annotation(models.Model):
    project = models.ForeignKey(Project,on_delete=models.CASCADE)

    Annotation_data = models.JSONField()

    created_at =models.DateTimeField(auto_now_add= True)
