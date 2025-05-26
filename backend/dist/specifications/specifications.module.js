"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const specifications_controller_1 = require("./specifications.controller");
const specifications_service_1 = require("./specifications.service");
const specification_entity_1 = require("./entities/specification.entity");
const table_manager_module_1 = require("../table-manager/table-manager.module");
const typeorm_config_1 = require("../config/typeorm.config");
let SpecificationsModule = class SpecificationsModule {
};
exports.SpecificationsModule = SpecificationsModule;
exports.SpecificationsModule = SpecificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => (0, typeorm_config_1.typeOrmConfig)(configService)
            }),
            typeorm_1.TypeOrmModule.forFeature([specification_entity_1.Specification]),
            table_manager_module_1.TableManagerModule
        ],
        controllers: [specifications_controller_1.SpecificationsController],
        providers: [specifications_service_1.SpecificationsService],
        exports: [specifications_service_1.SpecificationsService]
    })
], SpecificationsModule);
//# sourceMappingURL=specifications.module.js.map