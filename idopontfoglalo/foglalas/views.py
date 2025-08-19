from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .models import Appointment, Business, Service
from datetime import time
import json
import logging
from datetime import time, datetime

# Set up logging
logger = logging.getLogger(__name__)

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
            logger.info(f"book_appointment called")
            data = json.loads(request.body)
            slug = data.get('business')
            service_type = data.get('service_type', 'massage')  # Default to massage for backward compatibility

            # Validate required fields
            required_fields = ['business', 'name', 'phone', 'email', 'date', 'time']
            for field in required_fields:
                if not data.get(field):
                    logger.warning(f"Missing required field: {field}")
                    return JsonResponse({
                        'status': 'error', 
                        'message': f'A {field} mező kitöltése kötelező'
                    }, status=400)

            # Validate date format
            try:
                appointment_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                if appointment_date < datetime.now().date():
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Múltbeli dátumra nem lehet időpontot foglalni'
                    }, status=400)
            except ValueError:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Érvénytelen dátum formátum'
                }, status=400)

            # Validate time format
            try:
                appointment_time = datetime.strptime(data['time'], '%H:%M').time()
            except ValueError:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Érvénytelen idő formátum'
                }, status=400)

            # 🔍 Lekérjük a Business példányt slug alapján
            try:
                business = Business.objects.get(slug=slug)
                logger.info(f"Found business: {business.name}")
            except Business.DoesNotExist:
                logger.warning(f"Business not found with slug: {slug}")
                return JsonResponse({
                    'status': 'error', 
                    'message': 'Nincs ilyen vállalkozás'
                }, status=400)

            # Check if time slot is already booked
            try:
                existing_appointment = Appointment.objects.filter(
                    business=business,
                    date=appointment_date,
                    time=appointment_time
                ).first()
                
                if existing_appointment:
                    logger.warning(f"Time slot already booked: {appointment_date} {appointment_time}")
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Ez az időpont már foglalt'
                    }, status=400)
            except Exception as e:
                logger.error(f"Error checking existing appointments: {e}")

            # 📝 Létrehozzuk a foglalást
            try:
                appointment = Appointment.objects.create(
                    business=business,
                    service_type=service_type,
                    name=data['name'].strip(),
                    phone=data['phone'].strip(),
                    email=data['email'].strip(),
                    date=appointment_date,
                    time=appointment_time
                )
                logger.info(f"Appointment created: {appointment}")
                return JsonResponse({'status': 'success', 'message': 'Foglalás sikeresen létrehozva'})
            except Exception as e:
                logger.error(f"Error creating appointment: {e}")
                return JsonResponse({
                    'status': 'error',
                    'message': 'Hiba a foglalás létrehozásakor'
                }, status=500)
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in request: {e}")
            return JsonResponse({
                'status': 'error', 
                'message': 'Érvénytelen JSON formátum'
            }, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in book_appointment: {e}")
            return JsonResponse({
                'status': 'error', 
                'message': 'Váratlan hiba történt'
            }, status=500)

    return JsonResponse({
        'status': 'error', 
        'message': 'Csak POST kérés engedélyezett'
    }, status=405)

def get_available_times(request):
    """API endpoint to get available appointment times - Simple 8-16 hourly slots"""
    logger.info(f"get_available_times called with params: {dict(request.GET)}")
    
    slug = request.GET.get('business')
    date_str = request.GET.get('date')

    if not slug or not date_str:
        logger.warning(f"Missing parameters - business: {slug}, date: {date_str}")
        return JsonResponse({'times': [], 'error': 'missing-params', 'message': 'Hiányozó paraméterek'}, status=400)

    try:
        business = Business.objects.get(slug=slug)
        logger.info(f"Found business: {business.name}")
    except Business.DoesNotExist:
        logger.warning(f"Business not found with slug: {slug}")
        return JsonResponse({'times': [], 'error': 'unknown-business', 'message': 'Ismeretlen vállalkozás'}, status=404)

    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        # Check if date is in the past
        if target_date < datetime.now().date():
            logger.warning(f"Past date requested: {date_str}")
            return JsonResponse({'times': [], 'error': 'past-date', 'message': 'Múltbeli dátumra nem lehet időpontot foglalni'}, status=400)
    except ValueError as e:
        logger.warning(f"Invalid date format: {date_str}, error: {e}")
        return JsonResponse({'times': [], 'error': 'bad-date', 'message': 'Érvénytelen dátum formátum'}, status=400)

    try:
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
        
        logger.info(f"Found {len(booked_times)} booked appointments for {target_date}")

        # Filter out booked times
        available = [t.strftime('%H:%M') for t in all_times if t not in booked_times]
        
        logger.info(f"Returning {len(available)} available times")
        
        return JsonResponse({
            'times': available,
            'message': f'{len(available)} szabad időpont található'
        })
        
    except Exception as e:
        logger.error(f"Error generating available times: {e}")
        return JsonResponse({
            'times': [], 
            'error': 'server-error', 
            'message': 'Szerver hiba történt'
        }, status=500)

@api_view(["GET"])
def get_slots(request):
    """API endpoint to get available time slots for appointment booking"""
    try:
        logger.info(f"get_slots called with params: {dict(request.GET)}")
        
        # Get query parameters
        date_str = request.GET.get('date')
        service_id = request.GET.get('service')
        location_id = request.GET.get('location')
        
        # Validate required parameters
        if not date_str:
            logger.warning("Missing date parameter in get_slots request")
            return JsonResponse({
                'error': 'missing-date',
                'message': 'A dátum megadása kötelező',
                'slots': []
            }, status=400)
        
        # Parse and validate date
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            # Check if date is in the past
            if target_date < datetime.now().date():
                logger.warning(f"Past date requested: {date_str}")
                return JsonResponse({
                    'error': 'past-date',
                    'message': 'Múltbeli dátumra nem lehet időpontot foglalni',
                    'slots': []
                }, status=400)
        except ValueError as e:
            logger.warning(f"Invalid date format: {date_str}, error: {e}")
            return JsonResponse({
                'error': 'invalid-date',
                'message': 'Érvénytelen dátum formátum',
                'slots': []
            }, status=400)
        
        # Try to get business from database
        try:
            business = Business.objects.first()  # Use first available business
            if not business:
                logger.warning("No business found in database")
                # Return mock data with warning if no business exists
                mock_slots = [
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
                ]
                return JsonResponse({
                    'slots': mock_slots,
                    'warning': 'mock-data',
                    'message': 'Teszt adatok használata'
                })
            
            interval_minutes = business.time_interval
            logger.info(f"Using business: {business.name} with {interval_minutes}min intervals")
            
        except Exception as e:
            logger.error(f"Database error getting business: {e}")
            # Fallback to default interval
            interval_minutes = 30
            business = None
            
        # Generate time slots
        try:
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
            
            logger.info(f"Generated {len(all_times)} time slots")
            
        except Exception as e:
            logger.error(f"Error generating time slots: {e}")
            return JsonResponse({
                'error': 'slot-generation-failed',
                'message': 'Hiba az időpontok generálásakor',
                'slots': []
            }, status=500)
        
        # Get booked times if business exists
        available_slots = all_times
        if business:
            try:
                booked_times = set(
                    Appointment.objects
                    .filter(business=business, date=target_date)
                    .values_list('time', flat=True)
                )
                
                logger.info(f"Found {len(booked_times)} booked appointments for {target_date}")
                
                # Filter out booked times
                available_slots = []
                for slot in all_times:
                    start_time = datetime.strptime(slot["start"], '%H:%M').time()
                    if start_time not in booked_times:
                        available_slots.append(slot)
                        
                logger.info(f"Returning {len(available_slots)} available slots")
                        
            except Exception as e:
                logger.error(f"Error filtering booked times: {e}")
                # Return all generated slots if there's an error checking bookings
                logger.warning("Returning all slots due to booking check error")
        
        return JsonResponse({
            'slots': available_slots,
            'message': f'{len(available_slots)} szabad időpont található'
        })
        
    except Exception as e:
        logger.error(f"Unexpected error in get_slots: {e}")
        return JsonResponse({
            'error': 'server-error',
            'message': 'Szerver hiba történt',
            'slots': []
        }, status=500)