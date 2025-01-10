from django.db import models


class Drawing(models.Model):
    user = models.CharField(max_length=100)
    tool = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#000000")  # Hex color code
    stroke = models.PositiveIntegerField(default=2)
    coordinates = models.JSONField()  # JSON for drawing coordinates

    def __str__(self):
        return f"Drawing by {self.user}"
