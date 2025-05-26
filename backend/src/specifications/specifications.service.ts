import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specification } from './entities/specification.entity';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';
import { TableManagerService } from '../table-manager/table-manager.service';

@Injectable()
export class SpecificationsService {
  constructor(
    @InjectRepository(Specification)
    private specificationRepository: Repository<Specification>,
    private tableManagerService: TableManagerService,
  ) {}

  async findAll(): Promise<Specification[]> {
    return this.specificationRepository.find();
  }

  async findByType(equipmentType: string): Promise<Specification[]> {
    return this.specificationRepository.find({
      where: { equipmentType }
    });
  }

  async findOne(id: string): Promise<Specification> {
    const specification = await this.specificationRepository.findOne({ where: { id } });
    if (!specification) {
      throw new NotFoundException(`Spécification avec l'ID ${id} non trouvée`);
    }
    return specification;
  }

  async create(createSpecificationDto: CreateSpecificationDto): Promise<Specification> {
    const specification = this.specificationRepository.create({
      equipmentType: createSpecificationDto.equipmentType,
      columns: createSpecificationDto.columns
    });

    const savedSpecification = await this.specificationRepository.save(specification);
    
    // Créer la table correspondante
    await this.tableManagerService.createTable(savedSpecification);

    return savedSpecification;
  }

  async update(id: string, updateSpecificationDto: UpdateSpecificationDto): Promise<Specification> {
    const specification = await this.findOne(id);
    
    const updatedSpecification = this.specificationRepository.merge(specification, {
      equipmentType: updateSpecificationDto.equipmentType,
      columns: updateSpecificationDto.columns
    });

    const savedSpecification = await this.specificationRepository.save(updatedSpecification);

    // Recréer la table avec les nouvelles spécifications
    await this.tableManagerService.createTable(savedSpecification);

    return savedSpecification;
  }

  async remove(id: string): Promise<void> {
    const specification = await this.findOne(id);
    
    // Supprimer d'abord la table correspondante
    await this.tableManagerService.dropTable(specification.equipmentType);
    
    // Puis supprimer la spécification
    await this.specificationRepository.remove(specification);
  }
} 