from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from .models import Appointment, Business, CustomUser, Service
from datetime import time
import json
from datetime import time, datetime

# Helper functions for role checking
def is_superadmin(user):
    return user.is_authenticated and user.role == 'superadmin'

def is_admin(user):
    return user.is_authenticated and user.role == 'admin'

def is_customer(user):
    return user.is_authenticated and user.role == 'customer'

# Authentication Views
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # Redirect based on user role
            if user.role == 'superadmin':
                return redirect('superadmin_dashboard')
            elif user.role == 'admin':
                return redirect('admin_dashboard')
            else:
                return redirect('public_index')
        else:
            messages.error(request, 'Invalid username or password')
    
    return render(request, 'foglalas/login.html')

def logout_view(request):
    logout(request)
    return redirect('public_index')

# Public Views
def public_index(request):
    businesses = Business.objects.all()
    return render(request, 'foglalas/public/index.html', {'businesses': businesses})

def foglalas_form(request):
    businesses = Business.objects.all()
    return render(request, 'foglalas/book.html', {'businesses': businesses})

# Superadmin Views
@user_passes_test(is_superadmin)
def superadmin_dashboard(request):
    businesses = Business.objects.all()
    total_businesses = businesses.count()
    total_admins = CustomUser.objects.filter(role='admin').count()
    total_appointments = Appointment.objects.count()
    
    context = {
        'businesses': businesses,
        'total_businesses': total_businesses,
        'total_admins': total_admins,
        'total_appointments': total_appointments,
    }
    return render(request, 'foglalas/superadmin/dashboard.html', context)

@user_passes_test(is_superadmin)
def create_business(request):
    if request.method == 'POST':
        # Handle business creation
        name = request.POST['name']
        slug = request.POST['slug']
        description = request.POST.get('description', '')
        address = request.POST['address']
        phone = request.POST['phone']
        email = request.POST['email']
        
        business = Business.objects.create(
            name=name,
            slug=slug,
            description=description,
            address=address,
            phone=phone,
            email=email
        )
        messages.success(request, f'Business {name} created successfully!')
        return redirect('superadmin_dashboard')
    
    return render(request, 'foglalas/superadmin/create_business.html')

# Admin Views
@user_passes_test(is_admin)
def admin_dashboard(request):
    business = request.user.business
    if not business:
        messages.error(request, 'You are not assigned to any business')
        return redirect('login')
    
    services = Service.objects.filter(business=business)
    appointments = Appointment.objects.filter(business=business).order_by('-created_at')[:10]
    pending_appointments = Appointment.objects.filter(business=business, status='pending').count()
    
    context = {
        'business': business,
        'services': services,
        'appointments': appointments,
        'pending_appointments': pending_appointments,
    }
    return render(request, 'foglalas/admin/dashboard.html', context)

@user_passes_test(is_admin)
def manage_appointments(request):
    business = request.user.business
    appointments = Appointment.objects.filter(business=business).order_by('-created_at')
    return render(request, 'foglalas/admin/appointments.html', {'appointments': appointments})

@user_passes_test(is_admin)
def manage_services(request):
    business = request.user.business
    services = Service.objects.filter(business=business)
    return render(request, 'foglalas/admin/services.html', {'services': services})

# API Views
@csrf_exempt
def book_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            slug = data.get('business')

            # 🔍 Lekérjük a Business példányt slug alapján
            business = Business.objects.get(slug=slug)

            # 📝 Létrehozzuk a foglalást
            appointment = Appointment.objects.create(
                business=business,
                customer=request.user if request.user.is_authenticated else None,
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
    date = request.GET.get('date')

    try:
        business = Business.objects.get(slug=slug)

        # Use business opening/closing hours
        opening_hour = business.opening_hours.hour
        closing_hour = business.closing_hours.hour
        
        # Generate time slots between opening and closing hours
        all_times = [time(hour=h) for h in range(opening_hour, closing_hour)]

        # 🔒 Lekérjük a már lefoglalt időpontokat
        booked = Appointment.objects.filter(
            business=business, 
            date=date, 
            status__in=['pending', 'confirmed']
        ).values_list('time', flat=True)

        # 🛠️ Átalakítjuk a foglalt időpontokat time objektummá
        booked_times = [datetime.strptime(str(t), '%H:%M:%S').time() for t in booked]

        # ✅ Csak a szabad időpontokat küldjük vissza
        available = [t.strftime('%H:%M') for t in all_times if t not in booked_times]
        return JsonResponse({'times': available})

    except Business.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Nincs ilyen vállalkozás'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)