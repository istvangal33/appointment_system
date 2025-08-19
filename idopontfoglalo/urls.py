from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('foglalas/', include('foglalas.urls')),  # Added foglalas URL pattern
]