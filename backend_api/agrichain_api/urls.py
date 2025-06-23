"""
URL configuration for agrichain_api project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        'message': 'Welcome to AgriChain API',
        'version': '1.0.0',
        'endpoints': {
            'produces': '/api/produces/',
            'categories': '/api/categories/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('produce.urls')),
    path('', api_root, name='api_root'),
]
