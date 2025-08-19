from django.db import models

class Business(models.Model):
    INTERVAL_CHOICES = [
        (30, '30 minutes'),
        (60, '60 minutes'),
    ]
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    time_interval = models.IntegerField(choices=INTERVAL_CHOICES, default=60, help_text="Time slot interval in minutes")

    def __str__(self):
        return self.name

class Service(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    duration = models.IntegerField(help_text="Percben")

    def __str__(self):
        return f"{self.name} ({self.business.name})"

class Appointment(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.business.name} - {self.date} {self.time}"
