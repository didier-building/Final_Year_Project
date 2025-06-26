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
    farm_description = models.TextField(blank=True, help_text="Description of the farm")

    # Location details
    farm_address = models.TextField(blank=True, help_text="Physical address of the farm")
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)

    # Farm images
    farm_image = models.ImageField(upload_to='farm_images/', blank=True, null=True)

    # Certifications
    organic_certified = models.BooleanField(default=False)
    certification_details = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['organic_certified']),
        ]

    def __str__(self):
        return f"{self.farm_name} - {self.user_profile.user.username}"

    @property
    def has_location(self):
        return self.latitude is not None and self.longitude is not None


class Certification(models.Model):
    """Farm certifications and documents"""
    CERTIFICATION_TYPES = [
        ('organic', 'Organic Certification'),
        ('quality', 'Quality Assurance'),
        ('safety', 'Food Safety'),
        ('fair_trade', 'Fair Trade'),
        ('other', 'Other'),
    ]

    farm_details = models.ForeignKey(FarmDetails, on_delete=models.CASCADE, related_name='certifications')
    certification_type = models.CharField(max_length=20, choices=CERTIFICATION_TYPES)
    certification_name = models.CharField(max_length=200)
    issuing_authority = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    certificate_document = models.FileField(upload_to='certificates/', blank=True, null=True)
    verification_url = models.URLField(blank=True, help_text="URL to verify certificate online")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['certification_type']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.certification_name} - {self.farm_details.farm_name}"

    @property
    def is_expired(self):
        if not self.expiry_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.expiry_date


class TransactionHistory(models.Model):
    """Track blockchain transactions for users"""
    TRANSACTION_TYPES = [
        ('list_produce', 'List Produce'),
        ('buy_produce', 'Buy Produce'),
        ('other', 'Other'),
    ]

    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='transactions')
    transaction_hash = models.CharField(max_length=66, unique=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)

    # Transaction details
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42)
    value_wei = models.BigIntegerField(default=0)
    gas_used = models.BigIntegerField(null=True, blank=True)
    gas_price = models.BigIntegerField(null=True, blank=True)

    # Related produce (if applicable)
    produce_id = models.IntegerField(null=True, blank=True)
    produce_name = models.CharField(max_length=200, blank=True)

    # Network info
    network = models.CharField(max_length=20, default='sepolia')
    block_number = models.BigIntegerField(null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, default='pending')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['transaction_hash']),
            models.Index(fields=['user_profile', '-timestamp']),
            models.Index(fields=['transaction_type']),
        ]

    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_hash[:10]}..."

    @property
    def value_eth(self):
        return self.value_wei / 10**18

    @property
    def explorer_url(self):
        if self.network == 'sepolia':
            return f"https://sepolia.etherscan.io/tx/{self.transaction_hash}"
        return None
