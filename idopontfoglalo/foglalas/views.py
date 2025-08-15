from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Appointment, Business
from datetime import time
import json
from datetime import time, datetime

def foglalas_form(request):
    return render(request, 'foglalas/book.html')



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

        # 🕙 Munkanap: 10:00–17:00
        all_times = [time(hour=h) for h in range(10, 18)]

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