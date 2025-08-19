from django.urls import path
from . import views

app_name = 'barber'

urlpatterns = [
    path('', views.index, name='index'),
    path('services/', views.services, name='services'),
    path('gallery/', views.gallery, name='gallery'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
]