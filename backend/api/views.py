import json
import time
import html
import base64
import urllib.request
import urllib.error
from urllib.parse import urlparse

from django.conf import settings
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


# Simple in-memory rate limiting store: { ip: [timestamp1, timestamp2, ...] }
RATE_LIMIT_STORE = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 5  # max 5 requests per minute per IP


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "127.0.0.1")

    return ip


def is_rate_limited(ip):
    now = time.time()

    timestamps = RATE_LIMIT_STORE.get(ip, [])

    # Filter out timestamps older than the rate limit window
    timestamps = [
        ts for ts in timestamps
        if now - ts < RATE_LIMIT_WINDOW
    ]

    RATE_LIMIT_STORE[ip] = timestamps

    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        return True

    timestamps.append(now)

    return False


@csrf_exempt
@require_http_methods(["POST"])
def send_wish(request):

    # ==========================================================
    # 1. Rate Limiting Check
    # ==========================================================

    ip = get_client_ip(request)

    if is_rate_limited(ip):
        return JsonResponse({
            "success": False,
            "message": "Too many requests. Please wait a moment before sending another wish."
        }, status=429)


    # ==========================================================
    # 2. Parse JSON Payload
    # ==========================================================

    try:
        data = json.loads(request.body)

    except (ValueError, TypeError):
        return JsonResponse({
            "success": False,
            "message": "Invalid JSON format."
        }, status=400)


    # ==========================================================
    # 3. Validate Wish Text
    # ==========================================================

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


    # ==========================================================
    # 4. Optional Media Data / URL Processing
    # ==========================================================

    media_url = data.get("media_url", "")

    valid_media_url = None

    if media_url and isinstance(media_url, str):

        media_url_clean = media_url.strip()

        parsed = urlparse(media_url_clean)

        if parsed.scheme in ("http", "https") and parsed.netloc:
            valid_media_url = media_url_clean


    media_data = data.get("media_data", "")

    media_name = data.get(
        "media_name",
        "attached_media.png"
    )

    media_type = data.get(
        "media_type",
        "image/png"
    )


    # ==========================================================
    # Decode Base64 Media
    # ==========================================================

    attachment_bytes = None

    if (
        media_data
        and isinstance(media_data, str)
        and media_data.startswith("data:")
    ):

        try:

            header, encoded = media_data.split(",", 1)

            if "base64" in header:

                attachment_bytes = base64.b64decode(
                    encoded
                )

                mime_part = header.split(";")[0]

                if ":" in mime_part:
                    media_type = mime_part.split(":")[1]

        except Exception as err:

            print(
                "[ERROR] Failed to decode media_data:",
                err
            )


    source_page = data.get(
        "page",
        "Wish.html"
    )


    birthday_site_url = getattr(
        settings,
        "BIRTHDAY_SITE_URL",
        "https://YOUR_USERNAME.github.io/deepika-birthday/"
    )


    receiver_email = getattr(
        settings,
        "BIRTHDAY_WISH_RECEIVER",
        "itzmenobita007@gmail.com"
    )


    # ==========================================================
    # 5. Build Email
    # ==========================================================

    subject = "💖 Deepika sent you a birthday wish"


    # Resend sender address
    #
    # For initial testing, use:
    # onboarding@resend.dev
    #
    # For production, use a sender address from a verified
    # domain in Resend.

    from_email = getattr(
        settings,
        "RESEND_FROM_EMAIL",
        "onboarding@resend.dev"
    )


    context = {
        "wish_text": escaped_wish,
        "raw_wish_text": wish_text,
        "media_data": (
            media_data
            if (
                media_data
                and media_data.startswith("data:image")
            )
            else None
        ),
        "media_url": valid_media_url,
        "media_name": media_name,
        "birthday_site_url": birthday_site_url,
        "source_page": source_page,
    }


    # ==========================================================
    # 6. Render Email Templates
    # ==========================================================

    try:

        html_content = render_to_string(
            "emails/wish_email.html",
            context
        )

        text_content = render_to_string(
            "emails/wish_email.txt",
            context
        )

    except Exception as e:

        print(
            f"[ERROR] Failed to render email templates: {e}"
        )

        return JsonResponse({
            "success": False,
            "message": "Unable to prepare wish email"
        }, status=500)


    # ==========================================================
    # 7. Resend API Configuration
    # ==========================================================

    resend_api_key = os.getenv(
        "RESEND_API_KEY",
        ""
    )

    if not resend_api_key:

        print(
            "[ERROR] RESEND_API_KEY is not configured."
        )

        return JsonResponse({
            "success": False,
            "message": "Email service is not configured."
        }, status=500)


    # ==========================================================
    # 8. Build Resend API Payload
    # ==========================================================

    resend_payload = {
        "from": from_email,
        "to": [receiver_email],
        "subject": subject,
        "html": html_content,
        "text": text_content,
    }


    # ==========================================================
    # 9. Add Media Attachment
    # ==========================================================

    if attachment_bytes:

        attachment_base64 = base64.b64encode(
            attachment_bytes
        ).decode("utf-8")


        resend_payload["attachments"] = [
            {
                "filename": media_name,
                "content": attachment_base64,
            }
        ]


    # ==========================================================
    # 10. Send Using Resend HTTPS API
    # ==========================================================

    try:

        api_url = "https://api.resend.com/emails"


        request_body = json.dumps(
            resend_payload
        ).encode("utf-8")


        req = urllib.request.Request(
            api_url,
            data=request_body,
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )


        with urllib.request.urlopen(
            req,
            timeout=20
        ) as response:

            response_body = response.read().decode(
                "utf-8"
            )


            response_data = json.loads(
                response_body
            )


        # Resend returns an email id on success.
        # Current API documentation shows a response
        # containing an "id" field.
        email_id = response_data.get("id")


        if email_id:

            print(
                f"[SUCCESS] Wish email sent via Resend: {email_id}"
            )

            return JsonResponse({
                "success": True,
                "message": "Wish sent successfully"
            }, status=200)


        print(
            "[ERROR] Resend returned an unexpected response:",
            response_data
        )

        return JsonResponse({
            "success": False,
            "message": "Email service returned an unexpected response."
        }, status=502)


    except urllib.error.HTTPError as e:

        try:
            error_body = e.read().decode(
                "utf-8"
            )
        except Exception:
            error_body = str(e)


        print(
            f"[ERROR] Resend API HTTP {e.code}: {error_body}"
        )


        return JsonResponse({
            "success": False,
            "message": "Unable to send wish email."
        }, status=502)


    except urllib.error.URLError as e:

        print(
            f"[ERROR] Resend API connection failed: {e}"
        )


        return JsonResponse({
            "success": False,
            "message": "Email service connection failed."
        }, status=502)


    except Exception as e:

        # Internal log without leaking credentials to client
        print(
            f"[ERROR] Failed to dispatch wish email: {e}"
        )


        return JsonResponse({
            "success": False,
            "message": "Unable to send wish"
        }, status=500)
