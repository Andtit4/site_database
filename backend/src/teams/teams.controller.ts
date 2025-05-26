import { Controller, Get, Post, Body, Param, Delete, Put, Query, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, TeamFilterDto } from './dto/team.dto';
import { Team } from './entities/team.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { DepartmentAdminGuard, SpecificDepartmentGuard } from '../auth/guards/department-admin.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('teams')
@Controller('teams')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createTeamDto: CreateTeamDto): Promise<Team> {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() filterDto: TeamFilterDto): Promise<Team[]> {
    return this.teamsService.findAll(filterDto);
  }

  @Get('statistics')
  @UseGuards(DepartmentAdminGuard)
  getStatistics() {
    return this.teamsService.getStatistics();
  }

  @Get('department/:departmentId')
  @UseGuards(SpecificDepartmentGuard)
  findByDepartment(@Param('departmentId') departmentId: string): Promise<Team[]> {
    return this.teamsService.findByDepartment(departmentId);
  }

  @Get(':id')
  @UseGuards(DepartmentAdminGuard)
  findOne(@Param('id') id: string): Promise<Team> {
    return this.teamsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<Team> {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @UseGuards(DepartmentAdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.teamsService.remove(id);
  }
} 