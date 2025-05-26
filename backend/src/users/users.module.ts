import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { EmailModule } from '../services/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Department]),
    EmailModule
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {} 