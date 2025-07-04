import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Site, SiteStatus } from '../entities/site.entity';
import { Equipment } from '../entities/equipment.entity';
import { CreateSiteDto, UpdateSiteDto, SiteFilterDto } from '../dto/site.dto';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../teams/entities/team.entity';
import { SiteCustomFieldsService } from '../site-custom-fields/site-custom-fields.service';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private sitesRepository: Repository<Site>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private customFieldsService: SiteCustomFieldsService,
  ) {}

  async findAll(filterDto: SiteFilterDto = {}): Promise<Site[]> {
    const { search, region, status, includeDeleted } = filterDto;
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
    } else if (!includeDeleted) {
      // Si aucun statut n'est spécifié et qu'on ne demande pas explicitement les éléments supprimés,
      // exclure les sites avec le statut DELETED
      query.andWhere('site.status != :deletedStatus', { deletedStatus: SiteStatus.DELETED });
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

    // Traitement des champs personnalisés
    let customFieldsValues: Record<string, any> = {};

    if (createSiteDto.customFieldsValues) {
      // Appliquer les valeurs par défaut
      customFieldsValues = await this.customFieldsService.applyDefaultValues(createSiteDto.customFieldsValues);

      // Valider les champs personnalisés
      const validation = await this.customFieldsService.validateCustomValues(customFieldsValues);

      if (!validation.isValid) {
        throw new BadRequestException(`Erreurs de validation des champs personnalisés: ${validation.errors.join(', ')}`);
      }

      // Nettoyer les valeurs pour ne garder que les champs définis
      customFieldsValues = await this.customFieldsService.cleanCustomValues(customFieldsValues);
    }

    // Creer un nouvel objet site
    const siteData = {
      ...createSiteDto,
      customFieldsValues: customFieldsValues
    };
    
    const site = this.sitesRepository.create(siteData);
    
    // Sauvegarder et retourner le site
    return this.sitesRepository.save(site);
  }

  async update(id: string, updateSiteDto: UpdateSiteDto): Promise<Site> {
    // Verifier que le site existe
    const site = await this.findOne(id);
    
    // Traitement des champs personnalisés
    let customFieldsValues = site.customFieldsValues || {};

    if (updateSiteDto.customFieldsValues) {
      // Fusionner les nouvelles valeurs avec les existantes
      customFieldsValues = { ...customFieldsValues, ...updateSiteDto.customFieldsValues };
      
      // Valider les champs personnalisés
      const validation = await this.customFieldsService.validateCustomValues(customFieldsValues);

      if (!validation.isValid) {
        throw new BadRequestException(`Erreurs de validation des champs personnalisés: ${validation.errors.join(', ')}`);
      }

      // Nettoyer les valeurs
      customFieldsValues = await this.customFieldsService.cleanCustomValues(customFieldsValues);
    }
    
    // Mettre a jour les proprietes
    Object.assign(site, {
      ...updateSiteDto,
      customFieldsValues: customFieldsValues
    });
    
    // Sauvegarder les modifications
    return this.sitesRepository.save(site);
  }

  async remove(id: string): Promise<void> {
    // Vérifier que le site existe
    const site = await this.findOne(id);
    
    // Mettre à jour le statut au lieu de supprimer
    site.status = SiteStatus.DELETED;
    await this.sitesRepository.save(site);
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

  async getSiteSpecifications(id: string): Promise<Record<string, any>> {
    const site = await this.findOne(id);
    
    if (!site.specifications) {
      return {};
    }
    
    return site.specifications;
  }

  async updateSiteSpecifications(id: string, specifications: Record<string, any>): Promise<Site> {
    const site = await this.findOne(id);
    
    // Mettre à jour les spécifications
    site.specifications = specifications;
    
    // Sauvegarder les modifications
    await this.sitesRepository.save(site);
    
    return site;
  }

  async getSiteEquipment(id: string): Promise<Equipment[]> {
    const site = await this.sitesRepository.findOne({
      where: { id },
      relations: ['equipment']
    });
    
    if (!site) {
      throw new NotFoundException(`Site avec ID ${id} non trouve`);
    }

    return site.equipment || [];
  }
} 
