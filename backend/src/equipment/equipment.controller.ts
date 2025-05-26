import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto, UpdateEquipmentDto, EquipmentFilterDto } from '../dto/equipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { DepartmentAdminGuard } from '../auth/guards/department-admin.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('equipment')
@Controller('equipment')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() filterDto: EquipmentFilterDto) {
    return this.equipmentService.findAll(filterDto);
  }

  @Get('statistics')
  @UseGuards(DepartmentAdminGuard)
  getStatistics() {
    return this.equipmentService.getStatistics();
  }

  @Get(':id')
  @UseGuards(DepartmentAdminGuard)
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @UseGuards(DepartmentAdminGuard)
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }
} 