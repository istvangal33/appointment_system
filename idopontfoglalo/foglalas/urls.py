from django.urls import path
from . import views

urlpatterns = [
    path('api/book-appointment/', views.book_appointment, name='book_appointment'),
    path('api/available-times/', views.get_available_times, name='available_times'),
    path('foglalas/', views.foglalas_form, name='foglalas_form'),
]
