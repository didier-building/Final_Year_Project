from django.core.management.base import BaseCommand

from ...models import Produce


class Command(BaseCommand):
    help = 'Normalize all farmer_address values in Produce to lowercase.'

    def handle(self, *args, **kwargs):
        count = 0
        for produce in Produce.objects.all():
            if produce.farmer_address != produce.farmer_address.lower():
                produce.farmer_address = produce.farmer_address.lower()
                produce.save(update_fields=['farmer_address'])
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Normalized {count} produce records to lowercase farmer_address.'))
