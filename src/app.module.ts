import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ConfigModule.forRoot(), LoggerModule],
})
export class AppModule {}
