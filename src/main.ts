import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const logLevel = process.env.LOG_LEVEL || 'error,debug';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: logLevel.split(',') as LogLevel[],
      bufferLogs: true,
      rawBody: true,
    },
  );

  const configService = app.get<ConfigService>(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  app.enableCors();

  // Starts listening for shutdown events to allow graceful shutdown and releasing of resources.
  // https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
  app.enableShutdownHooks();

  const host = configService.get<string>('HOSTNAME', '0.0.0.0');
  const port = configService.get<string>('PORT', '3000');
  const portNumber = parseInt(port, 10);

  await app.listen(portNumber, host);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
