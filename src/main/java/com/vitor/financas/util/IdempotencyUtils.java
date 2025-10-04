package com.vitor.financas.util;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

public final class IdempotencyUtils {

    private IdempotencyUtils() {
    }

    public static String deterministicCode(String seed) {
        return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8)).toString();
    }
}
