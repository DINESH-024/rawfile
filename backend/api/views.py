import json
import time
import html
from urllib.parse import urlparse
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Simple in-memory rate limiting store: { ip: [timestamp1, timestamp2, ...] }
RATE_LIMIT_STORE = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 5  # max 5 requests per minute per IP

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip

def is_rate_limited(ip):
    now = time.time()
    timestamps = RATE_LIMIT_STORE.get(ip, [])
    # Filter out timestamps older than the rate limit window
    timestamps = [ts for ts in timestamps if now - ts < RATE_LIMIT_WINDOW]
    RATE_LIMIT_STORE[ip] = timestamps
    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        return True
    timestamps.append(now)
    return False

@csrf_exempt
@require_http_methods(["POST"])
def send_wish(request):
    # 1. Rate Limiting Check
    ip = get_client_ip(request)
    if is_rate_limited(ip):
        return JsonResponse({
            "success": False,
            "message": "Too many requests. Please wait a moment before sending another wish."
        }, status=429)

    # 2. Parse JSON Payload
    try:
        data = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({
            "success": False,
            "message": "Invalid JSON format."
        }, status=400)

    # 3. Validate Wish Text
    raw_wish = data.get("wish", "")
    if not isinstance(raw_wish, str):
        return JsonResponse({
            "success": False,
            "message": "Wish must be a text string."
        }, status=400)

    wish_text = raw_wish.strip()
    if not wish_text:
        return JsonResponse({
            "success": False,
            "message": "Wish cannot be empty."
        }, status=400)

    if len(wish_text) > 2000:
        return JsonResponse({
            "success": False,
            "message": "Wish exceeds maximum allowed length of 2000 characters."
        }, status=400)

    # Escape HTML to prevent injection inside emails
    escaped_wish = html.escape(wish_text)

    # 4. Optional Media Data / URL Processing
    media_url = data.get("media_url", "")
    valid_media_url = None
    if media_url and isinstance(media_url, str):
        media_url_clean = media_url.strip()
        parsed = urlparse(media_url_clean)
        if parsed.scheme in ("http", "https") and parsed.netloc:
            valid_media_url = media_url_clean

    media_data = data.get("media_data", "")
    media_name = data.get("media_name", "attached_media.png")
    media_type = data.get("media_type", "image/png")
    
    attachment_bytes = None
    if media_data and isinstance(media_data, str) and media_data.startswith("data:"):
        try:
            import base64
            header, encoded = media_data.split(",", 1)
            if "base64" in header:
                attachment_bytes = base64.b64decode(encoded)
                mime_part = header.split(";")[0]
                if ":" in mime_part:
                    media_type = mime_part.split(":")[1]
        except Exception as err:
            print("[ERROR] Failed to decode media_data:", err)

    source_page = data.get("page", "Wish.html")
    birthday_site_url = getattr(settings, "BIRTHDAY_SITE_URL", "https://YOUR_USERNAME.github.io/deepika-birthday/")
    receiver_email = getattr(settings, "BIRTHDAY_WISH_RECEIVER", "itzmenobita007@gmail.com")

    # 5. Build & Send Email
    subject = "💖 Deepika sent you a birthday wish"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)

    context = {
        "wish_text": escaped_wish,
        "raw_wish_text": wish_text,
        "media_data": media_data if (media_data and media_data.startswith("data:image")) else None,
        "media_url": valid_media_url,
        "media_name": media_name,
        "birthday_site_url": birthday_site_url,
        "source_page": source_page,
    }

    try:
        html_content = render_to_string("emails/wish_email.html", context)
        text_content = render_to_string("emails/wish_email.txt", context)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[receiver_email],
        )
        msg.attach_alternative(html_content, "text/html")

        if attachment_bytes:
            msg.attach(media_name, attachment_bytes, media_type)

        msg.send(fail_silently=False)

        return JsonResponse({
            "success": True,
            "message": "Wish sent successfully"
        }, status=200)

    except Exception as e:
        # Internal log without leaking credentials to client
        print(f"[ERROR] Failed to dispatch wish email: {e}")
        return JsonResponse({
            "success": False,
            "message": "Unable to send wish"
        }, status=500)
