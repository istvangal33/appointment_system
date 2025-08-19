from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Appointment, Business, Service
from datetime import time
import json
from datetime import time, datetime

# Homepage view
def index(request):
    """Homepage - Hero section with service overview"""
    business = Business.objects.filter(slug='harmonia-masszazs').first()
    services = Service.objects.filter(business=business)[:4] if business else []
    return render(request, 'foglalas/index.html', {
        'business': business,
        'services': services
    })

# About page view  
def about(request):
    """About page - Salon details, philosophy, services with prices"""
    business = Business.objects.filter(slug='harmonia-masszazs').first()
    services = Service.objects.filter(business=business) if business else []
    return render(request, 'foglalas/about.html', {
        'business': business,
        'services': services
    })

# Contact page view
def contact(request):
    """Contact page - Contact info, hours, map, contact form"""
    business = Business.objects.filter(slug='harmonia-masszazs').first()
    return render(request, 'foglalas/contact.html', {
        'business': business
    })

# Updated booking form view
def foglalas_form(request):
    """Booking form for massage salon"""
    business = Business.objects.filter(slug='harmonia-masszazs').first()
    return render(request, 'foglalas/book.html', {
        'business': business
    })



# 📅 Időpont foglalása
@csrf_exempt
def book_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            slug = data.get('business')

            # 🔍 Lekérjük a Business példányt slug alapján
            business = Business.objects.get(slug=slug)

            # 📝 Létrehozzuk a foglalást
            Appointment.objects.create(
                business=business,
                name=data['name'],
                phone=data['phone'],
                email=data['email'],
                date=data['date'],
                time=data['time']
            )
            return JsonResponse({'status': 'success'})
        except Business.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Nincs ilyen vállalkozás'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Csak POST kérés engedélyezett'}, status=400)

def get_available_times(request):
    """API endpoint to get available appointment times - Simple 8-16 hourly slots"""
    slug = request.GET.get('business')
    date_str = request.GET.get('date')

    if not slug or not date_str:
        return JsonResponse({'times': [], 'error': 'missing-params'}, status=400)

    try:
        business = Business.objects.get(slug=slug)
    except Business.DoesNotExist:
        return JsonResponse({'times': [], 'error': 'unknown-business'}, status=404)

    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'times': [], 'error': 'bad-date'}, status=400)

    # Generate time slots based on business time_interval setting
    all_times = []
    interval_minutes = business.time_interval  # 30 or 60 minutes
    start_hour = 8  # 8:00 AM
    end_hour = 17   # 5:00 PM (17:00)
    
    current_hour = start_hour
    current_minute = 0
    
    while current_hour < end_hour or (current_hour == end_hour and current_minute == 0):
        all_times.append(time(hour=current_hour, minute=current_minute))
        
        # Add interval
        current_minute += interval_minutes
        if current_minute >= 60:
            current_hour += 1
            current_minute = 0

    # Get booked times for this business and date
    booked_times = set(
        Appointment.objects
        .filter(business=business, date=target_date)
        .values_list('time', flat=True)
    )

    # Filter out booked times
    available = [t.strftime('%H:%M') for t in all_times if t not in booked_times]
    
    return JsonResponse({'times': available})