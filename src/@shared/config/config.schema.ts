import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  JWT_SECRET: z.string(),
  SWAGGER_TITLE: z.string().default('NestJS DDD Boilerplate'),
  SWAGGER_DESCRIPTION: z.string().default('API Documentation'),
  SWAGGER_VERSION: z.string().default('1.0'),
});

export type Config = z.infer<typeof configSchema>;

export const validateConfig = (config: Record<string, any>): Config => {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, value]) => `  ${key}: ${value?.join(', ')}`)
      .join('\n');
    throw new Error(`Config validation error:\n${formatted}`);
  }
  return result.data;
};
