from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from .models import Appointment, Business, Service, User, BusinessHours
from datetime import time, datetime, timedelta
import json

def foglalas_form(request):
    return render(request, 'foglalas/book.html')

# Multi-tenant business views
def business_home(request, slug):
    """Business homepage with company information"""
    business = get_object_or_404(Business, slug=slug)
    services = Service.objects.filter(business=business, is_active=True)
    
    context = {
        'business': business,
        'services': services,
    }
    return render(request, 'foglalas/business/home.html', context)

def business_contact(request, slug):
    """Business contact page with details and map"""
    business = get_object_or_404(Business, slug=slug)
    business_hours = BusinessHours.objects.filter(business=business).order_by('weekday')
    
    context = {
        'business': business,
        'business_hours': business_hours,
    }
    return render(request, 'foglalas/business/contact.html', context)

def business_booking(request, slug):
    """Business booking page"""
    business = get_object_or_404(Business, slug=slug)
    services = Service.objects.filter(business=business, is_active=True)
    
    context = {
        'business': business,
        'services': services,
    }
    return render(request, 'foglalas/business/booking.html', context)

@login_required
def business_admin(request, slug):
    """Business admin dashboard for business owners"""
    business = get_object_or_404(Business, slug=slug)
    
    # Check if user has permission to access this business admin
    if not request.user.is_superadmin() and request.user.business != business:
        messages.error(request, 'Nincs jogosultságod ehhez a vállalkozáshoz.')
        return redirect('login')
    
    # Get recent appointments
    recent_appointments = Appointment.objects.filter(
        business=business,
        date__gte=datetime.now().date()
    ).order_by('date', 'time')[:10]
    
    # Get statistics
    total_appointments = Appointment.objects.filter(business=business).count()
    pending_appointments = Appointment.objects.filter(business=business, status='pending').count()
    
    context = {
        'business': business,
        'recent_appointments': recent_appointments,
        'total_appointments': total_appointments,
        'pending_appointments': pending_appointments,
    }
    return render(request, 'foglalas/business/admin.html', context)

# Authentication views
def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', '/')
            if user.is_superadmin():
                return redirect('superadmin_dashboard')
            elif user.is_business_admin() and user.business:
                return redirect('business_admin', slug=user.business.slug)
            else:
                return redirect(next_url)
        else:
            messages.error(request, 'Helytelen felhasználónév vagy jelszó.')
    
    return render(request, 'foglalas/auth/login.html')

@login_required
def user_logout(request):
    logout(request)
    return redirect('login')

def user_register(request):
    if request.method == 'POST':
        # Basic registration logic - can be enhanced later
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'A felhasználónév már foglalt.')
        elif User.objects.filter(email=email).exists():
            messages.error(request, 'Az email cím már használatban van.')
        else:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='user'
            )
            messages.success(request, 'Sikeres regisztráció! Jelentkezz be.')
            return redirect('login')
    
    return render(request, 'foglalas/auth/register.html')

@login_required
def superadmin_dashboard(request):
    """SuperAdmin dashboard with all businesses overview"""
    if not request.user.is_superadmin():
        messages.error(request, 'Nincs jogosultságod ehhez az oldalhoz.')
        return redirect('login')
    
    businesses = Business.objects.all()
    total_appointments = Appointment.objects.count()
    total_users = User.objects.count()
    
    context = {
        'businesses': businesses,
        'total_appointments': total_appointments,
        'total_users': total_users,
    }
    return render(request, 'foglalas/superadmin/dashboard.html', context)



# 📅 Időpont foglalása
@csrf_exempt
def book_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            slug = data.get('business')

            # 🔍 Lekérjük a Business példányt slug alapján
            business = Business.objects.get(slug=slug)

            # Get service if provided
            service = None
            service_id = data.get('service')
            if service_id:
                try:
                    service = Service.objects.get(id=service_id, business=business)
                except Service.DoesNotExist:
                    pass

            # 📝 Létrehozzuk a foglalást
            appointment = Appointment.objects.create(
                business=business,
                service=service,
                name=data['name'],
                phone=data['phone'],
                email=data['email'],
                date=data['date'],
                time=data['time'],
                notes=data.get('notes', ''),
                status='pending'
            )
            
            return JsonResponse({
                'status': 'success',
                'appointment_id': appointment.id,
                'message': 'Foglalás sikeresen létrehozva!'
            })
        except Business.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Nincs ilyen vállalkozás'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Csak POST kérés engedélyezett'}, status=400)

# ⏰ Elérhető időpontok lekérdezése
def get_available_times(request):
    slug = request.GET.get('business')
    date = request.GET.get('date')

    try:
        business = Business.objects.get(slug=slug)
        booking_date = datetime.strptime(date, '%Y-%m-%d').date()
        weekday = booking_date.weekday()

        # Get business hours for the weekday
        try:
            business_hours = BusinessHours.objects.get(business=business, weekday=weekday)
            if business_hours.is_closed:
                return JsonResponse({'times': []})
            
            # Generate time slots based on business hours
            start_time = business_hours.open_time
            end_time = business_hours.close_time
        except BusinessHours.DoesNotExist:
            # Fallback to default hours if not configured
            start_time = time(10, 0)  # 10:00
            end_time = time(17, 0)    # 17:00

        # Generate hourly time slots
        all_times = []
        current_hour = start_time.hour
        end_hour = end_time.hour
        
        while current_hour < end_hour:
            all_times.append(time(hour=current_hour))
            current_hour += 1

        # Get already booked appointments
        booked = Appointment.objects.filter(
            business=business, 
            date=date
        ).values_list('time', flat=True)

        # Convert booked times to time objects for comparison
        booked_times = []
        for t in booked:
            if isinstance(t, str):
                booked_times.append(datetime.strptime(t, '%H:%M:%S').time())
            else:
                booked_times.append(t)

        # Filter available times
        available = [
            t.strftime('%H:%M') 
            for t in all_times 
            if t not in booked_times
        ]
        
        return JsonResponse({'times': available})

    except Business.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Nincs ilyen vállalkozás'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)