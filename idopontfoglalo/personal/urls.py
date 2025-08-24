from django.urls import path
from . import views

app_name = 'personal'

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('portfolio/', views.portfolio, name='portfolio'),
    path('idopont-foglalas/', views.book, name='book'),
    
    # API endpoints  
    path('api/book-appointment/', views.book_appointment, name='book_appointment'),
    path('api/available-times/', views.get_available_times, name='available_times'),
]