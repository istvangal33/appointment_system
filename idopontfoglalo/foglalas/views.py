from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
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
            service_type = data.get('service_type', 'massage')  # Default to massage for backward compatibility

            # 🔍 Lekérjük a Business példányt slug alapján
            business = Business.objects.get(slug=slug)

            # 📝 Létrehozzuk a foglalást
            Appointment.objects.create(
                business=business,
                service_type=service_type,
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

@api_view(["GET"])
def get_slots(request):
    """API endpoint to get available time slots for appointment booking"""
    try:
        # Get query parameters
        date_str = request.GET.get('date')
        service_id = request.GET.get('service')
        location_id = request.GET.get('location')
        
        # Return empty array if parameters are missing (graceful handling)
        if not date_str:
            return JsonResponse([], safe=False)
        
        # Parse and validate date
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            # Return empty array for invalid date format
            return JsonResponse([], safe=False)
        
        # For now, use default business or mock data
        # In a real implementation, you'd map service/location to business
        try:
            business = Business.objects.first()  # Use first available business
            if not business:
                # Return mock data if no business exists
                return JsonResponse([
                    {"start": "09:00", "end": "09:30"},
                    {"start": "09:30", "end": "10:00"},
                    {"start": "10:00", "end": "10:30"},
                    {"start": "10:30", "end": "11:00"},
                    {"start": "11:00", "end": "11:30"},
                    {"start": "14:00", "end": "14:30"},
                    {"start": "14:30", "end": "15:00"},
                    {"start": "15:00", "end": "15:30"},
                    {"start": "15:30", "end": "16:00"},
                    {"start": "16:00", "end": "16:30"}
                ], safe=False)
            
            interval_minutes = business.time_interval
        except Exception:
            # Fallback to default interval
            interval_minutes = 30
            
        # Generate time slots
        all_times = []
        start_hour = 9  # 9:00 AM
        end_hour = 17   # 5:00 PM (17:00)
        
        current_hour = start_hour
        current_minute = 0
        
        while current_hour < end_hour:
            start_time = time(hour=current_hour, minute=current_minute)
            
            # Calculate end time
            end_minute = current_minute + interval_minutes
            end_hour_calc = current_hour
            if end_minute >= 60:
                end_hour_calc += 1
                end_minute = end_minute % 60
            
            # Don't add slots that would end after business hours
            if end_hour_calc < end_hour or (end_hour_calc == end_hour and end_minute == 0):
                all_times.append({
                    "start": start_time.strftime('%H:%M'),
                    "end": time(hour=end_hour_calc, minute=end_minute).strftime('%H:%M')
                })
            
            # Move to next slot
            current_minute += interval_minutes
            if current_minute >= 60:
                current_hour += 1
                current_minute = 0
        
        # Get booked times if business exists
        if business:
            try:
                booked_times = set(
                    Appointment.objects
                    .filter(business=business, date=target_date)
                    .values_list('time', flat=True)
                )
                
                # Filter out booked times
                available_slots = []
                for slot in all_times:
                    start_time = datetime.strptime(slot["start"], '%H:%M').time()
                    if start_time not in booked_times:
                        available_slots.append(slot)
                        
                return JsonResponse(available_slots, safe=False)
            except Exception:
                # Return all generated slots if there's an error checking bookings
                pass
        
        return JsonResponse(all_times, safe=False)
        
    except Exception as e:
        # Return empty array on any error to prevent frontend crashes
        return JsonResponse([], safe=False)