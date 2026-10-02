package com.app.suspiro.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CsrfTokenFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-CSRF-TOKEN";

    private final AuthCookieService authCookieService;

    public CsrfTokenFilter(AuthCookieService authCookieService) {
        this.authCookieService = authCookieService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String method = request.getMethod();
        if (isSafeMethod(method) || "/auth/login".equals(request.getServletPath())) {
            filterChain.doFilter(request, response);
            return;
        }

        // O legado Bearer não depende de cookies e continua compatível sem CSRF.
        String sessionCookie = findCookieValue(request, authCookieService.getSessionCookieName());
        if (sessionCookie == null || sessionCookie.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String cookieToken = findCookieValue(request, authCookieService.getCsrfCookieName());
        String headerToken = request.getHeader(HEADER_NAME);

        if (cookieToken == null || headerToken == null || !constantTimeEquals(cookieToken, headerToken)) {
            writeForbidden(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isSafeMethod(String method) {
        return "GET".equalsIgnoreCase(method)
                || "HEAD".equalsIgnoreCase(method)
                || "OPTIONS".equalsIgnoreCase(method);
    }

    private String findCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private boolean constantTimeEquals(String left, String right) {
        if (left == null || right == null) return false;
        return java.security.MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }

    private void writeForbidden(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                "{\"message\":\"Token CSRF ausente ou inválido.\",\"code\":\"CSRF_INVALID\"}");
    }
}
