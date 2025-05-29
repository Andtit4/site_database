import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TableManagerService } from './table-manager.service';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [TableManagerService],
  exports: [TableManagerService]
})
export class TableManagerModule {} 
