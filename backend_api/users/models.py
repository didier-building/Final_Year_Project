from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile for farmers and buyers"""

    USER_TYPES = [
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('both', 'Both Farmer and Buyer'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='both')

    # Wallet information
    wallet_address = models.CharField(max_length=42, blank=True, null=True, help_text="Primary wallet address")

    # Profile information
    phone_number = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    # Verification status
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['wallet_address']),
            models.Index(fields=['user_type']),
        ]

    def __str__(self):
        return f"{self.user.username} ({self.user_type})"

    @property
    def is_farmer(self):
        return self.user_type in ['farmer', 'both']

    @property
    def is_buyer(self):
        return self.user_type in ['buyer', 'both']


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create a UserProfile when a User is created"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the UserProfile when the User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


class FarmDetails(models.Model):
    """Additional details for farmers"""
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='farm_details')

    farm_name = models.CharField(max_length=200)
    farm_size = models.DecimalField(max_digits=10, decimal_places=2, help_text="Farm size in acres")
    farming_type = models.CharField(max_length=100, help_text="Type of farming (organic, conventional, etc.)")
    crops_grown = models.TextField(help_text="List of crops typically grown")

    # Certifications
    organic_certified = models.BooleanField(default=False)
    certification_details = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.farm_name} - {self.user_profile.user.username}"
