import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto, UpdateTeamDto, TeamFilterDto } from './dto/team.dto';
import { DepartmentsService } from '../departments/departments.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../services/email.service';
import { EquipmentType } from '../entities/equipment.entity';
import { Request } from 'express';
export declare class TeamsService {
    private teamsRepository;
    private departmentsService;
    private usersService;
    private emailService;
    private request;
    private readonly logger;
    constructor(teamsRepository: Repository<Team>, departmentsService: DepartmentsService, usersService: UsersService, emailService: EmailService, request: Request);
    private getCurrentUser;
    private applyDepartmentFilter;
    create(createTeamDto: CreateTeamDto): Promise<Team>;
    private createTeamUser;
    private generateRandomPassword;
    findAll(filterDto?: TeamFilterDto): Promise<Team[]>;
    findByDepartment(departmentId: string): Promise<Team[]>;
    findByEquipmentType(equipmentType: EquipmentType): Promise<Team[]>;
    findOne(id: string): Promise<Team>;
    update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<any>;
}
