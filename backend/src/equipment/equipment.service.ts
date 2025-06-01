import { Injectable, NotFoundException, ConflictException, Inject, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Equipment, EquipmentType, EquipmentStatus } from '../entities/equipment.entity';
import { CreateEquipmentDto, UpdateEquipmentDto, EquipmentFilterDto } from '../dto/equipment.dto';
import { SitesService } from '../sites/sites.service';
import { DepartmentsService } from '../departments/departments.service';
import { TeamsService } from '../teams/teams.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private sitesService: SitesService,
    private departmentsService: DepartmentsService,
    private teamsService: TeamsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  private getCurrentUser() {
    return this.request.user as any;
  }

  async findAll(filterDto: EquipmentFilterDto = {}): Promise<Equipment[]> {
    const { search, type, status, siteId, departmentId } = filterDto;
    const query = this.equipmentRepository.createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.site', 'site')
      .leftJoinAndSelect('equipment.department', 'department')
      .where('equipment.isDeleted = :isDeleted', { isDeleted: false });

    // Filtrage par utilisateur : les membres d'équipe ne voient que les équipements de leur département
    const user = this.getCurrentUser();
    if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
      query.andWhere('equipment.departmentId = :userDepartmentId', { userDepartmentId: user.departmentId });
    }

    if (search) {
      query.andWhere(
        '(equipment.model LIKE :search OR equipment.manufacturer LIKE :search OR equipment.serialNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type && type.length > 0) {
      query.andWhere('equipment.type IN (:...type)', { type });
    }

    if (status && status.length > 0) {
      query.andWhere('equipment.status IN (:...status)', { status });
    }

    if (siteId) {
      query.andWhere('equipment.siteId = :siteId', { siteId });
    }

    if (departmentId) {
      query.andWhere('equipment.departmentId = :departmentId', { departmentId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({ 
      where: { id, isDeleted: false },
      relations: ['department', 'site']
    });
    
    if (!equipment) {
      throw new NotFoundException(`equipement avec ID ${id} non trouve`);
    }

    // Vérifier si l'utilisateur a accès à cet équipement
    const user = this.getCurrentUser();
    if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
      if (equipment.departmentId !== user.departmentId) {
        throw new NotFoundException(`equipement avec ID ${id} non trouve ou accès non autorisé`);
      }
    }
    
    return equipment;
  }

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    // Verifier si le site existe
    await this.sitesService.findOne(createEquipmentDto.siteId);
    
    // Verifier si le departement existe (si specifie)
    if (createEquipmentDto.departmentId) {
      await this.departmentsService.findOne(createEquipmentDto.departmentId);
    }

    // Verifier si l'equipe existe (si specifiee)
    if (createEquipmentDto.teamId) {
      await this.teamsService.findOne(createEquipmentDto.teamId);
    }

    // Verifier si un equipement avec cet ID existe dejà
    const existingEquipment = await this.equipmentRepository.findOne({
      where: { id: createEquipmentDto.id, isDeleted: false },
    });

    if (existingEquipment) {
      throw new ConflictException(`Un equipement avec l'ID ${createEquipmentDto.id} existe dejà`);
    }

    // Creer un nouvel equipement
    const equipment = this.equipmentRepository.create({
      ...createEquipmentDto,
      name: `${createEquipmentDto.type} - ${createEquipmentDto.model}` // Générer un nom automatiquement
    });
    
    // Sauvegarder et retourner l'equipement
    return this.equipmentRepository.save(equipment);
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto): Promise<Equipment> {
    // Verifier si l'equipement existe
    const equipment = await this.findOne(id);
    
    // Verifier si le site existe (si specifie)
    if (updateEquipmentDto.siteId) {
      await this.sitesService.findOne(updateEquipmentDto.siteId);
    }
    
    // Verifier si le departement existe (si specifie)
    if (updateEquipmentDto.departmentId) {
      await this.departmentsService.findOne(updateEquipmentDto.departmentId);
    }

    // Verifier si l'equipe existe (si specifiee)
    if (updateEquipmentDto.teamId) {
      await this.teamsService.findOne(updateEquipmentDto.teamId);
    }

    // Mettre à jour les proprietes
    Object.assign(equipment, updateEquipmentDto);
    
    // Mettre à jour le nom si le type ou le modèle a changé
    if (updateEquipmentDto.type || updateEquipmentDto.model) {
      equipment.name = `${equipment.type} - ${equipment.model}`;
    }
    
    // Sauvegarder et retourner l'equipement
    return this.equipmentRepository.save(equipment);
  }

  async remove(id: string): Promise<void> {
    // Marquer comme supprimé au lieu de supprimer physiquement
    const equipment = await this.findOne(id);
    equipment.isDeleted = true;
    await this.equipmentRepository.save(equipment);
  }

  // Méthode pour supprimer tous les équipements d'un site
  async removeBySiteId(siteId: string): Promise<number> {
    // Marquer tous les équipements du site comme supprimés
    const result = await this.equipmentRepository
      .createQueryBuilder()
      .update(Equipment)
      .set({ isDeleted: true })
      .where("siteId = :siteId", { siteId })
      .andWhere("isDeleted = :isDeleted", { isDeleted: false })
      .execute();
    
    return result.affected || 0;
  }

  // Méthode pour supprimer tous les équipements d'un département
  async removeByDepartmentId(departmentId: string): Promise<number> {
    // Marquer tous les équipements du département comme supprimés
    const result = await this.equipmentRepository
      .createQueryBuilder()
      .update(Equipment)
      .set({ isDeleted: true })
      .where("departmentId = :departmentId", { departmentId })
      .andWhere("isDeleted = :isDeleted", { isDeleted: false })
      .execute();
    
    return result.affected || 0;
  }

  // utilitaire pour obtenir des statistiques des equipements
  async getStatistics() {
    const user = this.getCurrentUser();
    
    // Construire la condition de base
    let whereCondition: any = { isDeleted: false };
    
    // Filtrer par département pour les utilisateurs non-admin
    if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
      whereCondition.departmentId = user.departmentId;
    }
    
    // Nombre total d'equipements non supprimés
    const totalEquipment = await this.equipmentRepository.count({
      where: whereCondition
    });
    
    // equipements par type
    const typeCounts = {};
    for (const type in EquipmentType) {
      const count = await this.equipmentRepository.count({
        where: { 
          ...whereCondition,
          type: EquipmentType[type]
        },
      });
      typeCounts[EquipmentType[type]] = count;
    }
    
    // equipements par statut
    const statusCounts = {};
    for (const status in EquipmentStatus) {
      const count = await this.equipmentRepository.count({
        where: { 
          ...whereCondition,
          status: EquipmentStatus[status]
        },
      });
      statusCounts[EquipmentStatus[status]] = count;
    }
    
    return {
      totalEquipment,
      byType: typeCounts,
      byStatus: statusCounts,
    };
  }

  async findAllByType(type: string): Promise<Equipment[]> {
    // Vérifier que le type demandé existe dans l'énumération
    if (!Object.values(EquipmentType).includes(type as EquipmentType)) {
      throw new NotFoundException(`Type d'équipement ${type} invalide`);
    }

    const user = this.getCurrentUser();
    let whereCondition: any = { type: type as EquipmentType, isDeleted: false };
    
    // Filtrer par département pour les utilisateurs non-admin
    if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
      whereCondition.departmentId = user.departmentId;
    }

    return this.equipmentRepository.find({
      where: whereCondition,
      relations: ['site', 'department'],
    });
  }
} 
