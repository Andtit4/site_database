"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableManagerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let TableManagerService = class TableManagerService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async createTable(specification) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tableName = `spec_${specification.equipmentType.toLowerCase()}`;
            const columns = specification.columns.map(column => {
                let columnDefinition = `${column.name} ${column.type}`;
                if (column.type === 'varchar' && column.length) {
                    columnDefinition += `(${column.length})`;
                }
                if (!column.nullable) {
                    columnDefinition += ' NOT NULL';
                }
                if (column.defaultValue !== undefined) {
                    if (column.type === 'int' || column.type === 'float' || column.type === 'decimal') {
                        columnDefinition += column.defaultValue === '' ? ' DEFAULT NULL' : ` DEFAULT ${column.defaultValue}`;
                    }
                    else {
                        columnDefinition += ` DEFAULT '${column.defaultValue}'`;
                    }
                }
                return columnDefinition;
            }).join(', ');
            const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id VARCHAR(36) PRIMARY KEY,
          ${columns},
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
            await queryRunner.query(createTableQuery);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async dropTable(equipmentType) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tableName = `spec_${equipmentType.toLowerCase()}`;
            await queryRunner.query(`DROP TABLE IF EXISTS ${tableName}`);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.TableManagerService = TableManagerService;
exports.TableManagerService = TableManagerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], TableManagerService);
//# sourceMappingURL=table-manager.service.js.map