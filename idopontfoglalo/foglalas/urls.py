from django.urls import path
from . import views

urlpatterns = [
    # Main website pages
    path('', views.index, name='index'),
    path('bemutatkozas/', views.about, name='about'),
    path('kapcsolat/', views.contact, name='contact'),
    path('idopont-foglalas/', views.foglalas_form, name='foglalas_form'),
    
    # API endpoints  
    path('api/book-appointment/', views.book_appointment, name='book_appointment'),
    path('api/available-times/', views.get_available_times, name='available_times'),
    path('api/slots/', views.get_slots, name='get_slots'),
]
