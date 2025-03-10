import secrets

# Generate a 32-byte (256-bit) secret key
jwt_secret_key = secrets.token_urlsafe(32)
print(jwt_secret_key)