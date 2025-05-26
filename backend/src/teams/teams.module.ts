import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './entities/team.entity';
import { DepartmentsModule } from '../departments/departments.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../services/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team]),
    DepartmentsModule, // Importer le module des départements pour l'injection dans le service
    UsersModule, // Importer le module des utilisateurs pour la création de comptes utilisateurs
    EmailModule, // Importer le module d'email pour l'envoi d'emails
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {} 