from django.core.management.base import BaseCommand

from ...models import Produce


class Command(BaseCommand):
    help = 'Print all produce farmer addresses and their case'

    def handle(self, *args, **kwargs):
        produces = Produce.objects.all()
        if not produces:
            self.stdout.write(self.style.WARNING('No produce records found.'))
            return
        for p in produces:
            self.stdout.write(f"Produce: {p.name}, Farmer Address: {p.farmer_address}, Lower: {p.farmer_address.lower()}")
