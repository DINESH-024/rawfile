from django.urls import path
# pyrefly: ignore [missing-import]
from .views import send_wish

urlpatterns = [
    path('send-wish/', send_wish, name='send_wish'),
]
