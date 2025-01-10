from django.urls import path
from .views import save_drawing, share_drawing,index,trace_view

urlpatterns = [
    path('api/save/', save_drawing, name='save_drawing'),
    path('api/share/', share_drawing, name='share_drawing'),
    path('', index, name='index'),
    path('trace/', trace_view, name='trace'),
]
