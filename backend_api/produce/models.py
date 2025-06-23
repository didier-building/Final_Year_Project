from django.db import models
from django.contrib.auth.models import User


class Produce(models.Model):
    """Model representing agricultural produce listings"""

    # Blockchain data
    blockchain_id = models.PositiveIntegerField(unique=True, help_text="ID from smart contract")
    contract_address = models.CharField(max_length=42, help_text="Smart contract address")

    # Produce details
    name = models.CharField(max_length=100, help_text="Name of the produce")
    quantity = models.PositiveIntegerField(help_text="Quantity in kg or units")
    price_per_unit = models.DecimalField(max_digits=20, decimal_places=0, help_text="Price per unit in wei")
    total_price = models.DecimalField(max_digits=20, decimal_places=0, help_text="Total price in wei")

    # Addresses
    farmer_address = models.CharField(max_length=42, help_text="Farmer's wallet address")
    buyer_address = models.CharField(max_length=42, blank=True, null=True, help_text="Buyer's wallet address")

    # Status
    is_sold = models.BooleanField(default=False)

    # Timestamps
    listed_timestamp = models.DateTimeField(help_text="When produce was listed on blockchain")
    sold_timestamp = models.DateTimeField(null=True, blank=True, help_text="When produce was sold")

    # Local timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Optional local user association
    farmer_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='listed_produce')
    buyer_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchased_produce')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['blockchain_id']),
            models.Index(fields=['farmer_address']),
            models.Index(fields=['is_sold']),
        ]

    def __str__(self):
        return f"{self.name} - {self.quantity}kg by {self.farmer_address[:8]}..."

    @property
    def price_per_unit_eth(self):
        """Convert price per unit from wei to ETH"""
        return float(self.price_per_unit) / 10**18

    @property
    def total_price_eth(self):
        """Convert total price from wei to ETH"""
        return float(self.total_price) / 10**18


class ProduceCategory(models.Model):
    """Categories for different types of produce"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Produce Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class ProduceImage(models.Model):
    """Images for produce listings"""
    produce = models.ForeignKey(Produce, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='produce_images/')
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.produce.name}"
