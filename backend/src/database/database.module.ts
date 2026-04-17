import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'mysql' as const,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: ['src/modules/**/*.entity.ts'],
          subscribers: ['src/database/subscribers/**/*.ts'],
          migrations: ['src/database/migrations/**/*.ts'],
          migrationsRun: false,
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          maxQueryExecutionTime: dbConfig.maxQueryExecutionTime,
          connectTimeout: 60000,
          waitForConnections: true,
          connectionLimit: dbConfig.connectionLimit,
          queueLimit: 0,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
