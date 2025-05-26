import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Equipment, EquipmentType, EquipmentStatus } from '../entities/equipment.entity';
import { CreateEquipmentDto, UpdateEquipmentDto, EquipmentFilterDto } from '../dto/equipment.dto';
import { SitesService } from '../sites/sites.service';
import { DepartmentsService } from '../departments/departments.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private sitesService: SitesService,
    private departmentsService: DepartmentsService,
    private teamsService: TeamsService,
  ) {}

  async findAll(filterDto: EquipmentFilterDto = {}): Promise<Equipment[]> {
    const { search, type, status, siteId, departmentId } = filterDto;
    const query = this.equipmentRepository.createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.site', 'site')
      .leftJoinAndSelect('equipment.department', 'department')
      .where('equipment.isDeleted = :isDeleted', { isDeleted: false });

    if (search) {
      query.andWhere(
        '(equipment.model LIKE :search OR equipment.manufacturer LIKE :search OR equipment.serialNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type && type.length > 0) {
      query.andWhere('equipment.name IN (:...type)', { type });
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
      where: { id, isDeleted: false } 
    });
    
    if (!equipment) {
      throw new NotFoundException(`equipement avec ID ${id} non trouve`);
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
    const equipment = this.equipmentRepository.create(createEquipmentDto);
    
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
    // Nombre total d'equipements non supprimés
    const totalEquipment = await this.equipmentRepository.count({
      where: { isDeleted: false }
    });
    
    // equipements par type
    const typeCounts = {};
    for (const type in EquipmentType) {
      const count = await this.equipmentRepository.count({
        where: { name: EquipmentType[type], isDeleted: false },
      });
      typeCounts[EquipmentType[type]] = count;
    }
    
    // equipements par statut
    const statusCounts = {};
    for (const status in EquipmentStatus) {
      const count = await this.equipmentRepository.count({
        where: { status: EquipmentStatus[status], isDeleted: false },
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
    if (!Object.keys(EquipmentType).includes(type)) {
      throw new NotFoundException(`Type d'équipement ${type} invalide`);
    }

    return this.equipmentRepository.find({
      where: { name: EquipmentType[type], isDeleted: false },
      relations: ['site', 'department'],
    });
  }
} 