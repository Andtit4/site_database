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
exports.SitesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_entity_1 = require("../entities/site.entity");
const team_entity_1 = require("../teams/entities/team.entity");
let SitesService = class SitesService {
    constructor(sitesRepository, teamsRepository) {
        this.sitesRepository = sitesRepository;
        this.teamsRepository = teamsRepository;
    }
    async findAll(filterDto = {}) {
        const { search, region, status } = filterDto;
        const query = this.sitesRepository.createQueryBuilder('site')
            .leftJoinAndSelect('site.equipment', 'equipment');
        if (search) {
            query.andWhere('(site.name LIKE :search OR site.id LIKE :search OR site.oldBase LIKE :search OR site.newBase LIKE :search)', { search: `%${search}%` });
        }
        if (region) {
            query.andWhere('site.region = :region', { region });
        }
        if (status && status.length > 0) {
            query.andWhere('site.status IN (:...status)', { status });
        }
        return query.getMany();
    }
    async findOne(id) {
        const site = await this.sitesRepository.findOne({ where: { id } });
        if (!site) {
            throw new common_1.NotFoundException(`Site avec ID ${id} non trouve`);
        }
        return site;
    }
    async create(createSiteDto) {
        const existingSite = await this.sitesRepository.findOne({
            where: { id: createSiteDto.id },
        });
        if (existingSite) {
            throw new common_1.ConflictException(`Un site avec l'ID ${createSiteDto.id} existe deja`);
        }
        const site = this.sitesRepository.create(createSiteDto);
        return this.sitesRepository.save(site);
    }
    async update(id, updateSiteDto) {
        const site = await this.findOne(id);
        Object.assign(site, updateSiteDto);
        return this.sitesRepository.save(site);
    }
    async remove(id) {
        const result = await this.sitesRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Site avec ID ${id} non trouve`);
        }
    }
    async getStatistics() {
        const totalSites = await this.sitesRepository.count();
        const statusCounts = {};
        for (const status in site_entity_1.SiteStatus) {
            const count = await this.sitesRepository.count({
                where: { status: site_entity_1.SiteStatus[status] },
            });
            statusCounts[site_entity_1.SiteStatus[status]] = count;
        }
        const regions = await this.sitesRepository
            .createQueryBuilder('site')
            .select('site.region')
            .addSelect('COUNT(site.id)', 'count')
            .groupBy('site.region')
            .getRawMany();
        return {
            totalSites,
            byStatus: statusCounts,
            byRegion: regions,
        };
    }
    async assignTeams(siteId, teamIds) {
        const site = await this.sitesRepository.findOne({
            where: { id: siteId },
            relations: ['teams']
        });
        if (!site) {
            throw new common_1.NotFoundException(`Site avec ID ${siteId} non trouve`);
        }
        const teams = await this.teamsRepository.find({
            where: { id: (0, typeorm_2.In)(teamIds) }
        });
        if (teams.length !== teamIds.length) {
            throw new common_1.NotFoundException('Une ou plusieurs equipes n\'ont pas ete trouvees');
        }
        site.teams = [...site.teams, ...teams];
        return this.sitesRepository.save(site);
    }
    async removeTeams(siteId, teamIds) {
        const site = await this.sitesRepository.findOne({
            where: { id: siteId },
            relations: ['teams']
        });
        if (!site) {
            throw new common_1.NotFoundException(`Site avec ID ${siteId} non trouve`);
        }
        site.teams = site.teams.filter(team => !teamIds.includes(team.id));
        return this.sitesRepository.save(site);
    }
    async getSiteTeams(siteId) {
        const site = await this.sitesRepository.findOne({
            where: { id: siteId },
            relations: ['teams']
        });
        if (!site) {
            throw new common_1.NotFoundException(`Site avec ID ${siteId} non trouve`);
        }
        return site.teams;
    }
};
exports.SitesService = SitesService;
exports.SitesService = SitesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_entity_1.Site)),
    __param(1, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SitesService);
//# sourceMappingURL=sites.service.js.map