import { Repository } from 'typeorm';
import { Site } from '../entities/site.entity';
import { CreateSiteDto, UpdateSiteDto, SiteFilterDto } from '../dto/site.dto';
import { Team } from '../teams/entities/team.entity';
export declare class SitesService {
    private sitesRepository;
    private teamsRepository;
    constructor(sitesRepository: Repository<Site>, teamsRepository: Repository<Team>);
    findAll(filterDto?: SiteFilterDto): Promise<Site[]>;
    findOne(id: string): Promise<Site>;
    create(createSiteDto: CreateSiteDto): Promise<Site>;
    update(id: string, updateSiteDto: UpdateSiteDto): Promise<Site>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<{
        totalSites: number;
        byStatus: {};
        byRegion: any[];
    }>;
    assignTeams(siteId: string, teamIds: string[]): Promise<Site>;
    removeTeams(siteId: string, teamIds: string[]): Promise<Site>;
    getSiteTeams(siteId: string): Promise<Team[]>;
}
