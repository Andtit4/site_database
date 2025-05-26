import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SpecificationsService } from './specifications.service';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';

@Controller('specifications')
export class SpecificationsController {
  constructor(private readonly specificationsService: SpecificationsService) {}

  @Get()
  async findAll() {
    return this.specificationsService.findAll();
  }

  @Get('type/:equipmentType')
  async findByType(@Param('equipmentType') equipmentType: string) {
    return this.specificationsService.findByType(equipmentType);
  }

  @Post()
  async create(@Body() createSpecificationDto: CreateSpecificationDto) {
    return this.specificationsService.create(createSpecificationDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSpecificationDto: UpdateSpecificationDto,
  ) {
    return this.specificationsService.update(id, updateSpecificationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.specificationsService.remove(id);
  }
} 