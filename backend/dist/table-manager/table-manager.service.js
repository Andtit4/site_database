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
    async createTable(tableDefinition) {
        let definition;
        if ('tableName' in tableDefinition) {
            definition = tableDefinition;
        }
        else {
            const spec = tableDefinition;
            definition = {
                tableName: `spec_${spec.equipmentType.toLowerCase()}`,
                columns: spec.columns
            };
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tableExists = await this.checkTableExists(definition.tableName);
            if (tableExists) {
                await this.dropTable(definition.tableName);
            }
            let query = `CREATE TABLE ${definition.tableName} (
        id varchar(36) PRIMARY KEY,
        site_id varchar(36) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
            for (const column of definition.columns) {
                const columnType = column.type + (column.type.toLowerCase() === 'varchar' ? `(${column.length || 255})` : '');
                const nullableStr = column.nullable ? 'NULL' : 'NOT NULL';
                const defaultStr = column.defaultValue ? `DEFAULT '${column.defaultValue}'` : '';
                query += `,\n        ${column.name} ${columnType} ${nullableStr} ${defaultStr}`.trim();
            }
            query += `,\n        FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
            await queryRunner.query(query);
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
    async checkTableExists(tableName) {
        const result = await this.dataSource.query(`SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = ?`, [tableName]);
        return result[0].count > 0;
    }
    async dropTable(tableName) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
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