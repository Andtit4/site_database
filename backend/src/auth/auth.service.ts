import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Authentifie un utilisateur et retourne un token JWT
   * @param username Nom d'utilisateur
   * @param password Mot de passe
   * @returns Données d'authentification avec le token JWT
   */
  async login(username: string, password: string): Promise<any> {
    const user = await this.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    
    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await this.usersRepository.save(user);
    
    // Récupérer les permissions et droits de l'utilisateur
    const permissions = await this.usersService.getUserPermissions(user.id);
    
    // Créer le payload du token
    const payload = { 
      sub: user.id, 
      username: user.username,
      isAdmin: user.isAdmin,
      isDepartmentAdmin: user.isDepartmentAdmin,
      isTeamMember: user.isTeamMember,
      departmentId: user.departmentId,
      teamId: user.teamId,
      hasDepartmentRights: user.hasDepartmentRights
    };
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isDepartmentAdmin: user.isDepartmentAdmin,
      isTeamMember: user.isTeamMember,
      departmentId: user.departmentId,
      teamId: user.teamId,
      hasDepartmentRights: user.hasDepartmentRights,
      managedEquipmentTypes: permissions.managedEquipmentTypes,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async countAdmins(): Promise<number> {
    return this.usersRepository.count({
      where: {
        isAdmin: true
      }
    });
  }
} 