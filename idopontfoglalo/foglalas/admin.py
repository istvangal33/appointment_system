from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Business, Service, Appointment, User, BusinessHours, BusinessSettings

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'business', 'is_active')
    list_filter = ('role', 'is_active', 'business')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Fields', {'fields': ('role', 'business', 'phone')}),
    )

@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'phone', 'email')
    search_fields = ('name', 'slug', 'email')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'duration', 'price', 'is_active')
    list_filter = ('business', 'is_active')
    search_fields = ('name', 'business__name')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'service', 'date', 'time', 'status')
    list_filter = ('business', 'status', 'date')
    search_fields = ('name', 'email', 'phone')
    date_hierarchy = 'date'

@admin.register(BusinessHours)
class BusinessHoursAdmin(admin.ModelAdmin):
    list_display = ('business', 'weekday', 'open_time', 'close_time', 'is_closed')
    list_filter = ('business', 'weekday', 'is_closed')

@admin.register(BusinessSettings)
class BusinessSettingsAdmin(admin.ModelAdmin):
    list_display = ('business', 'primary_color', 'enable_email_notifications')
    list_filter = ('enable_email_notifications', 'enable_sms_notifications')
