from django.urls import path
from . import views

urlpatterns = [
    # API endpoints
    path('api/book-appointment/', views.book_appointment, name='book_appointment'),
    path('api/available-times/', views.get_available_times, name='available_times'),
    
    # Authentication
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Public views
    path('', views.public_index, name='public_index'),
    path('foglalas/', views.foglalas_form, name='foglalas_form'),
    
    # Superadmin views
    path('superadmin/', views.superadmin_dashboard, name='superadmin_dashboard'),
    path('superadmin/create-business/', views.create_business, name='create_business'),
    
    # Admin views
    path('admin-panel/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-panel/appointments/', views.manage_appointments, name='manage_appointments'),
    path('admin-panel/services/', views.manage_services, name='manage_services'),
]
