from django.shortcuts import render

def index(request):
    """Personal introduction homepage"""
    return render(request, 'personal/index.html')

def about(request):
    """About page with detailed biography"""
    return render(request, 'personal/about.html')

def contact(request):
    """Contact information page"""
    return render(request, 'personal/contact.html')

def portfolio(request):
    """Portfolio/work examples page"""
    return render(request, 'personal/portfolio.html')
