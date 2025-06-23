"""
URL configuration for the produce app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProduceViewSet, ProduceCategoryViewSet

router = DefaultRouter()
router.register(r'produces', ProduceViewSet)
router.register(r'categories', ProduceCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
