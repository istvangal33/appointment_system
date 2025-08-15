from django import forms
from .models import Appointment

class AppointmentForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = ['business', 'name', 'phone', 'email', 'date', 'time']
