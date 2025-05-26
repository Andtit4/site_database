import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, TeamFilterDto } from './dto/team.dto';
import { Team } from './entities/team.entity';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    create(createTeamDto: CreateTeamDto): Promise<Team>;
    findAll(filterDto: TeamFilterDto): Promise<Team[]>;
    getStatistics(): Promise<any>;
    findByDepartment(departmentId: string): Promise<Team[]>;
    findOne(id: string): Promise<Team>;
    update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team>;
    remove(id: string): Promise<void>;
}
