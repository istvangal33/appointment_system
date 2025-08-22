"""
URL configuration for idopontfoglalo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import Http404


def empty_root(request):
    """Empty root view - no content should be served at root URL"""
    raise Http404("No content available at root URL")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', empty_root, name='root'),  # Root URL - no content should be served at root
    path('foglalas/', include('foglalas.urls')),  # Main appointment system - foglalas prefix access
    path('massage/', include('massage.urls')),  # Dedicated massage service
    path('personal/', include('personal.urls')),  # Personal introduction website
    path('barber/', include('barber.urls')),  # Barber residence website
]


