import json
import os
from pywebpush import webpush, WebPushException
from django.conf import settings


def pad_base64(data: str | None) -> str:
    """Add missing base64 padding for unpadded keys."""
    if not data:
        return ""
    missing = len(data) % 4
    if missing:
        return data + ("=" * (4 - missing))
    return data

def send_push_notification(subscription, message_data):
    try:
        # Subscription keys are already URL-safe base64 from the browser
        p256dh = subscription.p256dh
        auth = subscription.auth

        # Ensure VAPID private key uses real newlines and proper padding
        raw_key = os.environ.get("VAPID_PRIVATE_KEY", settings.VAPID_PRIVATE_KEY)
        clean_key = pad_base64(raw_key).replace("\\n", "\n")

        # Debug: confirm worker sees the injected key
        print(f"DEBUG - VAPID Key length: {len(raw_key) if raw_key else 0}")

        response = webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": p256dh,
                    "auth": auth
                }
            },
            data=json.dumps(message_data),
            vapid_private_key=clean_key,
            vapid_claims={"sub": settings.VAPID_ADMIN_EMAIL}
        )
        print(f"DEBUG - Webpush status: {getattr(response, 'status_code', 'unknown')}")
        return True
    except WebPushException as ex:
        if ex.response and ex.response.status_code in [404, 410]:
            subscription.delete()
        return False 
    except Exception as e:
        return False
