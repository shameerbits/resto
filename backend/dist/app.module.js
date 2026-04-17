"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const schedule_1 = require("@nestjs/schedule");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const menu_module_1 = require("./modules/menu/menu.module");
const order_module_1 = require("./modules/order/order.module");
const kitchen_module_1 = require("./modules/kitchen/kitchen.module");
const billing_module_1 = require("./modules/billing/billing.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const recipe_module_1 = require("./modules/recipe/recipe.module");
const health_module_1 = require("./modules/health/health.module");
const table_module_1 = require("./modules/table/table.module");
const configuration_1 = __importDefault(require("./config/configuration"));
const logger_service_1 = require("./common/logger/logger.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            }),
            database_module_1.DatabaseModule,
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: parseInt(process.env.API_RESPONSE_CACHE_TTL || '3600', 10) * 1000,
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            menu_module_1.MenuModule,
            order_module_1.OrderModule,
            kitchen_module_1.KitchenModule,
            billing_module_1.BillingModule,
            inventory_module_1.InventoryModule,
            recipe_module_1.RecipeModule,
            health_module_1.HealthModule,
            table_module_1.TableModule,
        ],
        providers: [logger_service_1.LoggerService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map