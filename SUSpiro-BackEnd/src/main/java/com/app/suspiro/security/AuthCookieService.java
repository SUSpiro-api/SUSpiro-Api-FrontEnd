package com.app.suspiro.security;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthCookieService {

    private static final String DEFAULT_SESSION_COOKIE_NAME = "SUSPIRO_SESSION";
    private static final String DEFAULT_CSRF_COOKIE_NAME = "XSRF-TOKEN";

    private final SecureRandom secureRandom = new SecureRandom();
    private final String sessionCookieName;
    private final String csrfCookieName;
    private final boolean secure;
    private final String sameSite;
    private final String path;
    private final long maxAgeSeconds;

    public AuthCookieService(
            @Value("${AUTH_COOKIE_NAME:" + DEFAULT_SESSION_COOKIE_NAME + "}") String sessionCookieName,
            @Value("${CSRF_COOKIE_NAME:" + DEFAULT_CSRF_COOKIE_NAME + "}") String csrfCookieName,
            @Value("${AUTH_COOKIE_SECURE:false}") boolean secure,
            @Value("${AUTH_COOKIE_SAME_SITE:Lax}") String sameSite,
            @Value("${AUTH_COOKIE_PATH:/}") String path,
            @Value("${JWT_EXPIRATION:86400000}") long jwtExpirationMillis) {

        this.sessionCookieName = sessionCookieName;
        this.csrfCookieName = csrfCookieName;
        this.secure = secure;
        this.sameSite = sameSite;
        this.path = path;
        this.maxAgeSeconds = Math.max(1L, jwtExpirationMillis / 1000L);
    }

    public String getSessionCookieName() {
        return sessionCookieName;
    }

    public String getCsrfCookieName() {
        return csrfCookieName;
    }

    public void writeAuthenticationCookies(HttpServletResponse response, String jwt) {
        String csrfToken = generateCsrfToken();
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(jwt));
        response.addHeader(HttpHeaders.SET_COOKIE, csrfCookie(csrfToken));
    }

    public void clearAuthenticationCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie(sessionCookieName, true));
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie(csrfCookieName, false));
    }

    private String sessionCookie(String jwt) {
        return ResponseCookie.from(sessionCookieName, jwt)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(path)
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build()
                .toString();
    }

    private String csrfCookie(String token) {
        return ResponseCookie.from(csrfCookieName, token)
                .httpOnly(false)
                .secure(secure)
                .sameSite(sameSite)
                .path(path)
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build()
                .toString();
    }

    private String expiredCookie(String name, boolean httpOnly) {
        return ResponseCookie.from(name, "")
                .httpOnly(httpOnly)
                .secure(secure)
                .sameSite(sameSite)
                .path(path)
                .maxAge(Duration.ZERO)
                .build()
                .toString();
    }

    private String generateCsrfToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
