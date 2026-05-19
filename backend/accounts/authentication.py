from django.core.cache import cache
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CachedJWTAuthentication(JWTAuthentication):
    def get_validated_token(self, raw_token):
        token = super().get_validated_token(raw_token)
        jti = token.get('jti')
        if jti and cache.get(f'blacklisted_jti_{jti}'):
            raise InvalidToken('Token has been revoked')
        return token
