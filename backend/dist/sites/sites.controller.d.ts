import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto, SiteFilterDto } from '../dto/site.dto';
import { Site } from '../entities/site.entity';
export declare class SitesController {
    private readonly sitesService;
    constructor(sitesService: SitesService);
    create(createSiteDto: CreateSiteDto): Promise<Site>;
    findAll(filterDto: SiteFilterDto): Promise<Site[]>;
    getStatistics(): Promise<{
        totalSites: number;
        byStatus: {};
        byRegion: any[];
    }>;
    findOne(id: string): Promise<Site>;
    update(id: string, updateSiteDto: UpdateSiteDto): Promise<Site>;
    remove(id: string): Promise<void>;
    assignTeams(id: string, body: {
        teamIds: string[];
    }): Promise<Site>;
    removeTeams(id: string, body: {
        teamIds: string[];
    }): Promise<Site>;
    getSiteTeams(id: string): Promise<import("../teams/entities/team.entity").Team[]>;
    getSiteSpecifications(id: string): Promise<Record<string, any>>;
    updateSiteSpecifications(id: string, specifications: Record<string, any>): Promise<Site>;
}
