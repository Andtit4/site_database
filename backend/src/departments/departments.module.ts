import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Department } from '../entities/department.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../services/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
    forwardRef(() => UsersModule), // Utiliser forwardRef pour éviter la dépendance circulaire
    EmailModule, // Importer EmailModule au lieu d'ajouter EmailService directement
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService], // Retirer EmailService des providers
  exports: [DepartmentsService],
})
export class DepartmentsModule {} 
