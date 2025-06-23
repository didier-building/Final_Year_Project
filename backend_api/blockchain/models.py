from django.db import models


class BlockchainTransaction(models.Model):
    """Track blockchain transactions"""

    TRANSACTION_TYPES = [
        ('list_produce', 'List Produce'),
        ('buy_produce', 'Buy Produce'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    ]

    # Transaction details
    transaction_hash = models.CharField(max_length=66, unique=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    # Blockchain details
    block_number = models.PositiveIntegerField(null=True, blank=True)
    gas_used = models.PositiveIntegerField(null=True, blank=True)
    gas_price = models.DecimalField(max_digits=20, decimal_places=0, null=True, blank=True)

    # Related data
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42)
    value = models.DecimalField(max_digits=20, decimal_places=0, default=0, help_text="Value in wei")

    # Metadata
    produce_id = models.PositiveIntegerField(null=True, blank=True, help_text="Related produce ID")
    error_message = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_hash']),
            models.Index(fields=['status']),
            models.Index(fields=['produce_id']),
        ]

    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_hash[:10]}... ({self.status})"


class ContractEvent(models.Model):
    """Store events emitted by the smart contract"""

    EVENT_TYPES = [
        ('ProduceListed', 'Produce Listed'),
        ('ProduceSold', 'Produce Sold'),
    ]

    # Event details
    event_name = models.CharField(max_length=50, choices=EVENT_TYPES)
    transaction_hash = models.CharField(max_length=66)
    block_number = models.PositiveIntegerField()
    log_index = models.PositiveIntegerField()

    # Event data
    event_data = models.JSONField(help_text="Raw event data from blockchain")

    # Processed data
    produce_id = models.PositiveIntegerField(null=True, blank=True)
    farmer_address = models.CharField(max_length=42, blank=True)
    buyer_address = models.CharField(max_length=42, blank=True)

    # Timestamps
    block_timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-block_number', '-log_index']
        unique_together = ['transaction_hash', 'log_index']
        indexes = [
            models.Index(fields=['event_name']),
            models.Index(fields=['produce_id']),
            models.Index(fields=['block_number']),
        ]

    def __str__(self):
        return f"{self.event_name} - Block {self.block_number}"
