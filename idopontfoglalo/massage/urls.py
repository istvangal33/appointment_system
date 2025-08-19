from django.urls import path
from . import views

app_name = 'massage'

urlpatterns = [
    # Main website pages
    path('', views.index, name='index'),
    path('bemutatkozas/', views.about, name='about'),
    path('kapcsolat/', views.contact, name='contact'),
    path('idopont-foglalas/', views.book, name='book'),
    
    # API endpoints  
    path('api/book-appointment/', views.book_appointment, name='book_appointment'),
    path('api/available-times/', views.get_available_times, name='available_times'),
]