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
    date = request.GET.get('date')

    try:
        business = Business.objects.get(slug=slug)

        # 🕙 Munkanap: 10:00–17:00 (30 perces intervallumok)
        all_times = []
        for hour in range(10, 18):  # 10:00-17:30
            all_times.append(time(hour=hour, minute=0))   # :00
            if hour < 17:  # Don't add :30 for the last hour (17:30 would be the last slot)
                all_times.append(time(hour=hour, minute=30))  # :30

        # 🔒 Lekérjük a már lefoglalt időpontokat
        booked = Appointment.objects.filter(business=business, date=date).values_list('time', flat=True)

        # 🛠️ Átalakítjuk a foglalt időpontokat time objektummá
        booked_times = [datetime.strptime(str(t), '%H:%M').time() for t in booked]

        # ✅ Csak a szabad időpontokat küldjük vissza
        available = [t.strftime('%H:%M') for t in all_times if t not in booked_times]
        return JsonResponse({'times': available})

    except Business.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Nincs ilyen vállalkozás'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)