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

# ⏰ Elérhető időpontok lekérdezése
def get_available_times(request):
    slug = request.GET.get('business')
    date_str = request.GET.get('date')

    # Validate required parameters
    if not slug or not date_str:
        return JsonResponse({'times': [], 'error': 'missing-params'}, status=400)

    try:
        # Validate business by slug
        business = Business.objects.get(slug=slug)
    except Business.DoesNotExist:
        return JsonResponse({'times': [], 'error': 'unknown-business'}, status=404)

    try:
        # Parse and validate date
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'times': [], 'error': 'bad-date'}, status=400)

    try:
        # Generate all available time slots from 10:00 to 17:30 in 30-minute increments
        all_times = []
        for hour in range(10, 18):  # 10:00 to 17:30
            all_times.append(time(hour=hour, minute=0))   # e.g., 10:00, 11:00, etc.
            all_times.append(time(hour=hour, minute=30))  # e.g., 10:30, 11:30, etc.
        
        # Query booked appointments and collect their time values
        booked_appointments = Appointment.objects.filter(business=business, date=target_date)
        booked_times = set(appointment.time for appointment in booked_appointments)

        # Compute available times by excluding booked times
        available_times = [t for t in all_times if t not in booked_times]
        
        # Format as HH:MM strings for JSON response
        available_formatted = [t.strftime('%H:%M') for t in available_times]
        
        return JsonResponse({'times': available_formatted})

    except Exception as e:
        return JsonResponse({'times': [], 'error': 'server-error'}, status=500)