import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Site, SiteStatus } from '../entities/site.entity';
import { CreateSiteDto, UpdateSiteDto, SiteFilterDto } from '../dto/site.dto';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private sitesRepository: Repository<Site>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  async findAll(filterDto: SiteFilterDto = {}): Promise<Site[]> {
    const { search, region, status } = filterDto;
    const query = this.sitesRepository.createQueryBuilder('site')
      .leftJoinAndSelect('site.equipment', 'equipment');

    if (search) {
      query.andWhere(
        '(site.name LIKE :search OR site.id LIKE :search OR site.oldBase LIKE :search OR site.newBase LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (region) {
      query.andWhere('site.region = :region', { region });
    }

    if (status && status.length > 0) {
      query.andWhere('site.status IN (:...status)', { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Site> {
    const site = await this.sitesRepository.findOne({ where: { id } });
    
    if (!site) {
      throw new NotFoundException(`Site avec ID ${id} non trouve`);
    }
    
    return site;
  }

  async create(createSiteDto: CreateSiteDto): Promise<Site> {
    // Verifier si un site avec cet ID existe deja
    const existingSite = await this.sitesRepository.findOne({
      where: { id: createSiteDto.id },
    });

    if (existingSite) {
      throw new ConflictException(`Un site avec l'ID ${createSiteDto.id} existe deja`);
    }

    // Creer un nouvel objet site
    const site = this.sitesRepository.create(createSiteDto);
    
    // Sauvegarder et retourner le site
    return this.sitesRepository.save(site);
  }

  async update(id: string, updateSiteDto: UpdateSiteDto): Promise<Site> {
    // Verifier que le site existe
    const site = await this.findOne(id);
    
    // Mettre a jour les proprietes
    Object.assign(site, updateSiteDto);
    
    // Sauvegarder les modifications
    return this.sitesRepository.save(site);
  }

  async remove(id: string): Promise<void> {
    const result = await this.sitesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Site avec ID ${id} non trouve`);
    }
  }

  // Methode utilitaire pour obtenir des statistiques des sites
  async getStatistics() {
    // Nombre total de sites
    const totalSites = await this.sitesRepository.count();
    
    // Sites par statut
    const statusCounts = {};
    for (const status in SiteStatus) {
      const count = await this.sitesRepository.count({
        where: { status: SiteStatus[status] },
      });
      statusCounts[SiteStatus[status]] = count;
    }
    
    // Sites par region
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

  async assignTeams(siteId: string, teamIds: string[]): Promise<Site> {
    const site = await this.sitesRepository.findOne({
      where: { id: siteId },
      relations: ['teams']
    });
    
    if (!site) {
      throw new NotFoundException(`Site avec ID ${siteId} non trouve`);
    }

    const teams = await this.teamsRepository.find({
      where: { id: In(teamIds) }
    });

    if (teams.length !== teamIds.length) {
      throw new NotFoundException('Une ou plusieurs equipes n\'ont pas ete trouvees');
    }

    site.teams = [...site.teams, ...teams];
    return this.sitesRepository.save(site);
  }

  async removeTeams(siteId: string, teamIds: string[]): Promise<Site> {
    const site = await this.sitesRepository.findOne({
      where: { id: siteId },
      relations: ['teams']
    });
    
    if (!site) {
      throw new NotFoundException(`Site avec ID ${siteId} non trouve`);
    }

    site.teams = site.teams.filter(team => !teamIds.includes(team.id));
    return this.sitesRepository.save(site);
  }

  async getSiteTeams(siteId: string): Promise<Team[]> {
    const site = await this.sitesRepository.findOne({
      where: { id: siteId },
      relations: ['teams']
    });
    
    if (!site) {
      throw new NotFoundException(`Site avec ID ${siteId} non trouve`);
    }

    return site.teams;
  }
} 