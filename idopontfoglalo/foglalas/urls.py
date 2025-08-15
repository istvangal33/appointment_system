from django.urls import path
from . import views

urlpatterns = [
    # API endpoints (existing)
    path('api/book-appointment/', views.book_appointment, name='book_appointment'),
    path('api/available-times/', views.get_available_times, name='available_times'),
    
    # Legacy URL (keep for compatibility)
    path('foglalas/', views.foglalas_form, name='foglalas_form'),
    
    # Multi-tenant business URLs
    path('business/<slug:slug>/', views.business_home, name='business_home'),
    path('business/<slug:slug>/contact/', views.business_contact, name='business_contact'),
    path('business/<slug:slug>/booking/', views.business_booking, name='business_booking'),
    path('business/<slug:slug>/admin/', views.business_admin, name='business_admin'),
    
    # Authentication URLs
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('register/', views.user_register, name='register'),
    
    # SuperAdmin dashboard
    path('dashboard/', views.superadmin_dashboard, name='superadmin_dashboard'),
]
