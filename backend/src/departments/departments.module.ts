import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../entities/department.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { UsersModule } from '../users/users.module';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
    UsersModule, // Pour pouvoir créer des utilisateurs de département
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, EmailService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {} 