"""
URL configuration for user profile APIs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet, FarmDetailsViewSet, 
    CertificationViewSet, TransactionHistoryViewSet
)

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='userprofile')
router.register(r'farms', FarmDetailsViewSet, basename='farmdetails')
router.register(r'certifications', CertificationViewSet, basename='certification')
router.register(r'transactions', TransactionHistoryViewSet, basename='transactionhistory')

urlpatterns = [
    path('', include(router.urls)),
]
