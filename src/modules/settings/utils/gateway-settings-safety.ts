import { BadRequestException } from '@nestjs/common';

const SECRET_KEY_PATTERN =
  /(secret|token|password|private.?key|client.?secret|api.?key|credential|authorization|signature)/i;

export function assertNoGatewaySecrets(value: unknown): void {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach(assertNoGatewaySecrets);
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      throw new BadRequestException(
        'Gateway credentials must be configured through server-side environment variables or a secret manager, not settings.',
      );
    }
    assertNoGatewaySecrets(nestedValue);
  }
}

export function sanitizeGatewaySettings(
  value: unknown,
): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const sanitize = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(sanitize);
    if (!input || typeof input !== 'object') return input;

    return Object.fromEntries(
      Object.entries(input)
        .filter(([key]) => !SECRET_KEY_PATTERN.test(key))
        .map(([key, nested]) => [key, sanitize(nested)]),
    );
  };

  return sanitize(value) as Record<string, unknown>;
}
