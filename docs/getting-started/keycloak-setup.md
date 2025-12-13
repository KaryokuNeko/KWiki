# Keycloak Setup Guide

This guide walks you through setting up Keycloak authentication for K-Wiki.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Access Keycloak Admin Console](#access-keycloak-admin-console)
4. [Create Realm](#create-realm)
5. [Create Client](#create-client)
6. [Configure Client Settings](#configure-client-settings)
7. [Get Client Secret](#get-client-secret)
8. [Create Test User](#create-test-user)
9. [Verify Configuration](#verify-configuration)
10. [Production Setup](#production-setup)
11. [Troubleshooting](#troubleshooting)

## Overview

Keycloak provides enterprise-grade authentication and authorization for K-Wiki. This setup is required before you can use the application.

**Time Required:** 10-15 minutes

## Prerequisites

Ensure Keycloak is running:

```bash
# Check Keycloak status
docker compose ps keycloak

# View Keycloak logs
docker compose logs -f keycloak
```

Wait until you see "Keycloak ... started" in the logs.

## Access Keycloak Admin Console

### By Deployment Mode

**Mode 1 (Local Dev) or Mode 2 (Full Docker with OrbStack):**
- URL: `https://keycloak.k-wiki.orb.local` or `http://keycloak.k-wiki.orb.local`
- Accept the self-signed certificate warning (development only)

**Mode 3 (Standard Docker/Localhost):**
- URL: `http://localhost:8080`

### Login Credentials

Use credentials from your `.env` file:
- Username: `KEYCLOAK_ADMIN` (default: `admin`)
- Password: `KEYCLOAK_ADMIN_PASSWORD` (default: `admin123`)

## Create Realm

A realm is a space where you manage users and applications.

1. Hover over the realm dropdown (shows "Master") in top-left corner
2. Click **"Create Realm"**
3. Enter realm name: **`k-wiki`** (must match `KEYCLOAK_REALM` in `.env`)
4. Click **"Create"**

## Create Client

A client represents the K-Wiki application in Keycloak.

1. In the left sidebar, click **"Clients"**
2. Click **"Create client"** button
3. Fill in **General Settings**:
   - Client type: `OpenID Connect`
   - Client ID: **`k-wiki-client`** (must match `KEYCLOAK_CLIENT_ID` in `.env`)
   - Name: `K-Wiki App` (optional, for display)
   - Description: `K-Wiki authentication client` (optional)
4. Click **"Next"**

## Configure Client Settings

### Capability Config

Configure authentication flow:
- Client authentication: **ON** (enables confidential client)
- Authorization: **OFF** (not needed for basic auth)
- Authentication flow:
  - ✅ Standard flow (OAuth2 Authorization Code)
  - ✅ Direct access grants (useful for testing)
  - ❌ Other flows (uncheck all others)

Click **"Next"**

### Login Settings

Configure redirect URLs based on your deployment mode:

#### Mode 1: Local Development
```
Root URL: http://localhost:3000
Home URL: http://localhost:3000
Valid redirect URIs: http://localhost:3000/api/auth/callback/keycloak
Valid post logout redirect URIs: http://localhost:3000/*
Web origins: http://localhost:3000
```

#### Mode 2: Full Docker with OrbStack
```
Root URL: https://nginx.k-wiki.orb.local
Home URL: https://nginx.k-wiki.orb.local
Valid redirect URIs: https://nginx.k-wiki.orb.local/api/auth/callback/keycloak
Valid post logout redirect URIs: https://nginx.k-wiki.orb.local/*
Web origins: https://nginx.k-wiki.orb.local
```

#### Mode 3: Standard Docker (Localhost)
```
Root URL: http://localhost
Home URL: http://localhost
Valid redirect URIs: http://localhost/api/auth/callback/keycloak
Valid post logout redirect URIs: http://localhost/*
Web origins: http://localhost
```

**Important:** The redirect URI must exactly match your application URL + `/api/auth/callback/keycloak`

Click **"Save"**

## Get Client Secret

1. Go to the **"Credentials"** tab of your client
2. Copy the **"Client secret"** value
3. Update your `.env` file:
   ```bash
   KEYCLOAK_CLIENT_SECRET=<paste-the-secret-here>
   ```
4. Restart your application:
   ```bash
   # Mode 1 (Local dev)
   # Stop dev server (Ctrl+C) and restart: pnpm dev

   # Mode 2 or 3 (Docker)
   docker compose restart app
   ```

## Create Test User

Create a user account for testing:

1. In the left sidebar, click **"Users"**
2. Click **"Add user"** button
3. Fill in user details:
   - **Username:** `testuser` (required)
   - **Email:** `test@example.com`
   - **Email verified:** **ON** (toggle to avoid email verification)
   - **First name:** `Test`
   - **Last name:** `User`
4. Click **"Create"**
5. Go to the **"Credentials"** tab
6. Click **"Set password"**
7. Enter password: `password123` (or your preferred password)
8. Set **"Temporary"** to **OFF** (user won't need to change password on first login)
9. Click **"Save"**
10. Confirm when prompted

## Verify Configuration

### 1. Check Configuration Summary

In your Keycloak client settings, verify:
- ✅ Client ID matches `.env` file
- ✅ Client authentication is ON
- ✅ Redirect URIs are correct
- ✅ Web origins are set
- ✅ Client secret is copied to `.env`

### 2. Test Authentication Flow

1. Access your application:
   - Mode 1: `http://localhost:3000`
   - Mode 2: `https://nginx.k-wiki.orb.local`
   - Mode 3: `http://localhost`

2. Click **"Sign in with Keycloak"**

3. You should be redirected to Keycloak login page

4. Enter test user credentials:
   - Username: `testuser`
   - Password: `password123`

5. Click **"Sign In"**

6. You should be redirected back to the application dashboard

7. Dashboard should display your user information

### Expected Result

✅ **Success:** You see the dashboard with user profile information
❌ **Failure:** See [Troubleshooting](#troubleshooting) section below

## Production Setup

For production deployments, implement these security measures:

### 1. Strong Passwords

```bash
# Generate strong password for Keycloak admin
openssl rand -base64 32

# Update in .env
KEYCLOAK_ADMIN_PASSWORD=<strong-password>

# Generate strong NEXTAUTH_SECRET
openssl rand -base64 32
```

### 2. HTTPS Configuration

- Use proper SSL/TLS certificates (not self-signed)
- Configure your domain's DNS
- Update all URLs to use HTTPS

Example production `.env`:
```bash
KEYCLOAK_ISSUER=https://auth.yourdomain.com/realms/k-wiki
NEXTAUTH_URL=https://yourdomain.com
```

### 3. Token Lifetimes

In Keycloak Realm Settings > Tokens:
- Access Token Lifespan: 5 minutes
- SSO Session Idle: 30 minutes
- SSO Session Max: 10 hours

### 4. Email Verification

In Realm Settings > Login:
- Enable "Verify email"
- Configure SMTP settings in Realm Settings > Email

### 5. Password Policies

In Realm Settings > Security Defenses > Password Policy:
- Minimum length: 12
- Uppercase characters: 1
- Lowercase characters: 1
- Digits: 1
- Special characters: 1

### 6. Additional Security

- Enable brute force detection (Realm Settings > Security Defenses)
- Configure Content Security Policy
- Enable CORS only for your domain
- Regular backup of Keycloak database

## Troubleshooting

### Error: "Invalid redirect_uri"

**Cause:** Redirect URI in Keycloak doesn't match the callback URL.

**Solution:**
1. Go to Clients > k-wiki-client > Settings
2. Check "Valid redirect URIs" exactly matches:
   - `<NEXTAUTH_URL>/api/auth/callback/keycloak`
3. No trailing slashes or typos
4. Save and test again

---

### Error: "Client not found"

**Cause:** Client ID mismatch between Keycloak and `.env`.

**Solution:**
1. Verify client exists in Keycloak (Clients page)
2. Check `KEYCLOAK_CLIENT_ID` in `.env` matches exactly
3. Restart application after changing `.env`

---

### Error: "Invalid client credentials"

**Cause:** Client secret is incorrect or not configured.

**Solution:**
1. Go to Clients > k-wiki-client > Credentials tab
2. Copy the **Client secret**
3. Update `KEYCLOAK_CLIENT_SECRET` in `.env`
4. Restart application

---

### Error: "fetch failed" or "SELF_SIGNED_CERT_IN_CHAIN"

**Cause:** Node.js rejects self-signed certificates in development.

**Solution:**
Use HTTP (not HTTPS) for internal calls:
```bash
# In .env, use HTTP for server-side Keycloak calls
KEYCLOAK_ISSUER=http://keycloak:8080/realms/k-wiki  # NOT https://
```

---

### Can't Access Keycloak Admin Console

**Symptoms:** Connection timeout or refused.

**Solutions:**

1. Check Keycloak is running:
   ```bash
   docker compose ps keycloak
   docker compose logs keycloak
   ```

2. Check port 8080 is not in use:
   ```bash
   lsof -i :8080  # macOS/Linux
   netstat -ano | findstr :8080  # Windows
   ```

3. Try alternative URL:
   - If `https://keycloak.k-wiki.orb.local` fails, try HTTP: `http://keycloak.k-wiki.orb.local`
   - If OrbStack domains fail, try `http://localhost:8080`

---

### Session Not Persisting

**Cause:** Missing or invalid `NEXTAUTH_SECRET`.

**Solution:**
```bash
# Generate new secret
openssl rand -base64 32

# Update .env
NEXTAUTH_SECRET=<generated-secret>

# Clear browser cookies
# Restart application
```

---

### User Can't Login (Credentials Valid)

**Possible Causes:**

1. **Email not verified:**
   - Go to Users > testuser
   - Set "Email verified" to ON

2. **User disabled:**
   - Check Users > testuser > Details
   - Ensure "Enabled" is ON

3. **Wrong realm:**
   - Verify you created user in `k-wiki` realm, not `Master`

---

### Redirect After Login Goes to Wrong URL

**Cause:** `NEXTAUTH_URL` doesn't match actual access URL.

**Solution:**
Update `.env` with the correct URL you're accessing from browser:
```bash
# Mode 1
NEXTAUTH_URL=http://localhost:3000

# Mode 2
NEXTAUTH_URL=https://nginx.k-wiki.orb.local

# Mode 3
NEXTAUTH_URL=http://localhost
```

Restart application after changes.

## Advanced Configuration

### Custom Login Theme

Customize the Keycloak login page appearance:

1. Create custom theme directory
2. Mount to Keycloak container in `docker-compose.yml`:
   ```yaml
   keycloak:
     volumes:
       - ./keycloak-themes:/opt/keycloak/themes/custom
   ```
3. Select theme in Realm Settings > Themes

### Social Login (OAuth)

Add Google, GitHub, or other providers:

1. Go to Identity Providers
2. Select provider (e.g., "Google")
3. Configure with OAuth credentials from provider
4. Users can now login with social accounts

### Multi-Factor Authentication (MFA)

Enable 2FA/MFA:

1. Go to Authentication > Flows
2. Configure OTP flow
3. Set as required in Authentication > Required Actions
4. Users will be prompted to set up MFA on next login

### User Federation

Connect to existing user database (LDAP/AD):

1. Go to User Federation
2. Add LDAP provider
3. Configure connection settings
4. Import and sync users

## Reference

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [NextAuth.js Keycloak Provider](https://next-auth.js.org/providers/keycloak)
- [K-Wiki Environment Setup](environment-setup.md)
- [K-Wiki Architecture](../architecture/authentication.md)
- [Return to Getting Started](README.md)