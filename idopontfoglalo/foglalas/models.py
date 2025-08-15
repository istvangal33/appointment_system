from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom User model with role-based permissions"""
    ROLE_CHOICES = [
        ('superadmin', 'SuperAdmin'),
        ('admin', 'Business Admin'),  
        ('user', 'Regular User'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    business = models.ForeignKey('Business', on_delete=models.CASCADE, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    
    def is_superadmin(self):
        return self.role == 'superadmin'
    
    def is_business_admin(self):
        return self.role == 'admin'
    
    def is_regular_user(self):
        return self.role == 'user'

class Business(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)

    def __str__(self):
        return self.name

class BusinessHours(models.Model):
    """Business working hours configuration"""
    WEEKDAY_CHOICES = [
        (0, 'Hétfő'),
        (1, 'Kedd'),
        (2, 'Szerda'),
        (3, 'Csütörtök'),
        (4, 'Péntek'),
        (5, 'Szombat'),
        (6, 'Vasárnap'),
    ]
    
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_hours')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_closed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['business', 'weekday']
        ordering = ['weekday']
    
    def __str__(self):
        if self.is_closed:
            return f"{self.business.name} - {self.get_weekday_display()}: Zárva"
        return f"{self.business.name} - {self.get_weekday_display()}: {self.open_time} - {self.close_time}"

class BusinessSettings(models.Model):
    """Business customization settings"""
    business = models.OneToOneField(Business, on_delete=models.CASCADE, related_name='settings')
    
    # Styling
    primary_color = models.CharField(max_length=7, default='#007bff')
    secondary_color = models.CharField(max_length=7, default='#6c757d')
    custom_css = models.TextField(blank=True)
    
    # Contact info
    website_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    
    # Booking settings
    booking_advance_days = models.IntegerField(default=30, help_text="Hány nappal előre lehet foglalni")
    min_booking_notice_hours = models.IntegerField(default=24, help_text="Minimum órák a foglalás előtt")
    
    # Notifications
    enable_email_notifications = models.BooleanField(default=True)
    enable_sms_notifications = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Settings for {self.business.name}"

class Service(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    duration = models.IntegerField(help_text="Percben")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Ár (Ft)")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.business.name}) - {self.price} Ft"

class Appointment(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, blank=True, null=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    date = models.DateField()
    time = models.TimeField()
    notes = models.TextField(blank=True)
    status_choices = [
        ('pending', 'Függőben'),
        ('confirmed', 'Megerősítve'),
        ('completed', 'Befejezve'),
        ('cancelled', 'Lemondva'),
    ]
    status = models.CharField(max_length=20, choices=status_choices, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['business', 'date', 'time']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.business.name} - {self.date} {self.time}"
