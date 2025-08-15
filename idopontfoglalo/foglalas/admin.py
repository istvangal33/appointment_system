from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Business, Service, Appointment, CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'business', 'is_staff']
    list_filter = ['role', 'business', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Business Info', {'fields': ('role', 'business')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Business Info', {'fields': ('role', 'business')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Business)
admin.site.register(Service)
admin.site.register(Appointment)
