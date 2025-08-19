from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from foglalas.models import Appointment, Business, Service
from datetime import time
import json
from datetime import time, datetime

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

def book(request):
    """Booking form for barber shop"""
    business = Business.objects.filter(slug='elite-barber').first()
    return render(request, 'barber/book.html', {
        'business': business
    })

# 📅 Időpont foglalása - Barber specific
@csrf_exempt
def book_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            slug = data.get('business')

            # 🔍 Lekérjük a Business példányt slug alapján
            business = Business.objects.get(slug=slug)

            # 📝 Létrehozzuk a foglalást barber service típussal
            Appointment.objects.create(
                business=business,
                service_type='barber',  # Force barber type
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
    """API endpoint to get available appointment times - Simple 9-18 half-hour slots for barber"""
    slug = request.GET.get('business')
    date_str = request.GET.get('date')

    if not slug or not date_str:
        return JsonResponse({'error': 'Missing parameters'}, status=400)

    try:
        business = Business.objects.get(slug=slug)
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (Business.DoesNotExist, ValueError):
        return JsonResponse({'error': 'Invalid parameters'}, status=400)

    # Generate time slots from 9-18 (9:00 to 18:00) with business time interval (30 min for barber)
    start_hour = 9
    end_hour = 18
    interval_minutes = business.time_interval
    
    all_times = []
    current_hour = start_hour
    current_minute = 0
    
    while current_hour < end_hour or (current_hour == end_hour and current_minute == 0):
        all_times.append(time(hour=current_hour, minute=current_minute))
        
        # Add interval
        current_minute += interval_minutes
        if current_minute >= 60:
            current_hour += 1
            current_minute = 0

    # Get booked times for this business and date - only barber appointments
    booked_times = set(
        Appointment.objects
        .filter(business=business, date=target_date, service_type='barber')
        .values_list('time', flat=True)
    )

    # Filter out booked times
    available = [t.strftime('%H:%M') for t in all_times if t not in booked_times]
    
    return JsonResponse({'times': available})
