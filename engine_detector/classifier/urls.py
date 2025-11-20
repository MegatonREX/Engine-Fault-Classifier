from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('classify/', views.classify_audio_view, name='classify'),
]
