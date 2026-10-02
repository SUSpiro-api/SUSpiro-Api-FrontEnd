package com.app.suspiro.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Carrega variáveis do arquivo .env para propriedades do sistema durante o desenvolvimento local.
 * Variáveis já fornecidas pelo ambiente do processo têm prioridade e não são sobrescritas.
 */
public final class DotenvLoader {

    private DotenvLoader() {
    }

    public static void init() {
        Path envFile = Path.of(".env");
        if (!Files.exists(envFile)) {
            return;
        }

        try {
            List<String> lines = Files.readAllLines(envFile, StandardCharsets.UTF_8);
            for (String rawLine : lines) {
                loadLine(rawLine);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Não foi possível ler o arquivo .env", exception);
        }
    }

    private static void loadLine(String rawLine) {
        String line = rawLine.trim();
        if (line.startsWith("\uFEFF")) {
            line = line.substring(1).trim();
        }
        if (line.isEmpty() || line.startsWith("#")) {
            return;
        }

        int separator = line.indexOf('=');
        if (separator <= 0) {
            return;
        }

        String key = line.substring(0, separator).trim();
        if (key.startsWith("export ")) {
            key = key.substring("export ".length()).trim();
        }
        if (key.isEmpty()) {
            return;
        }

        String value = unquote(line.substring(separator + 1).trim());
        if (System.getProperty(key) == null && System.getenv(key) == null) {
            System.setProperty(key, value);
        }

        if ("SPRING_PROFILES_ACTIVE".equals(key) && System.getProperty("spring.profiles.active") == null) {
            System.setProperty("spring.profiles.active", value);
        }
    }

    private static String unquote(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
