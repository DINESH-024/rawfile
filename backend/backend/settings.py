import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-birthday-secret-key-change-in-prod"
)

DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS_ENV = os.getenv("ALLOWED_HOSTS", "*")
ALLOWED_HOSTS = [
    host.strip()
    for host in ALLOWED_HOSTS_ENV.split(",")
    if host.strip()
]


# ==========================================================
# CORS Configuration
# ==========================================================

CORS_ALLOWED_ORIGINS_ENV = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()

if CORS_ALLOWED_ORIGINS_ENV:
    CORS_ALLOWED_ORIGINS = [
        origin.strip()
        for origin in CORS_ALLOWED_ORIGINS_ENV.split(",")
        if origin.strip()
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        # Production frontend
        "https://rawfile-umnq.onrender.com",

        # Local development
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ]

CORS_ALLOW_CREDENTIALS = True


INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "api",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "backend.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "backend.wsgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"
    },
]


# ==========================================================
# Gmail SMTP Configuration
# ==========================================================

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in (
    "true",
    "1",
    "yes",
)

EMAIL_HOST_USER = os.getenv(
    "EMAIL_HOST_USER",
    "itzmenobita007@gmail.com"
)

# IMPORTANT:
# Keep the Gmail App Password in Render Environment Variables.
# Do NOT hard-code it in this file or commit it to GitHub.
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")

DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    EMAIL_HOST_USER
)


# ==========================================================
# Custom Birthday Project Configs
# ==========================================================

BIRTHDAY_WISH_RECEIVER = os.getenv(
    "BIRTHDAY_WISH_RECEIVER",
    "itzmenobita007@gmail.com"
)

BIRTHDAY_SITE_URL = os.getenv(
    "BIRTHDAY_SITE_URL",
    "https://YOUR_USERNAME.github.io/deepika-birthday/"
)


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
