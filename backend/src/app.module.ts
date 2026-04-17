import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { MenuModule } from '@modules/menu/menu.module';
import { OrderModule } from '@modules/order/order.module';
import { KitchenModule } from '@modules/kitchen/kitchen.module';
import { BillingModule } from '@modules/billing/billing.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { RecipeModule } from '@modules/recipe/recipe.module';
import { HealthModule } from '@modules/health/health.module';
import { TableModule } from '@modules/table/table.module';
import config from '@config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Database
    DatabaseModule,

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.API_RESPONSE_CACHE_TTL || '3600', 10) * 1000,
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    MenuModule,
    OrderModule,
    KitchenModule,
    BillingModule,
    InventoryModule,
    RecipeModule,
    HealthModule,
    TableModule,
  ],
})
export class AppModule {}
