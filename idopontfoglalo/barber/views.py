from django.shortcuts import render

def index(request):
    """Barber shop homepage"""
    return render(request, 'barber/index.html')

def services(request):
    """Services and pricing page"""
    return render(request, 'barber/services.html')

def gallery(request):
    """Gallery of work examples"""
    return render(request, 'barber/gallery.html')

def contact(request):
    """Contact and location information"""
    return render(request, 'barber/contact.html')

def about(request):
    """About the barber shop"""
    return render(request, 'barber/about.html')
