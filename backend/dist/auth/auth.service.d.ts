import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    private usersRepository;
    constructor(usersService: UsersService, jwtService: JwtService, usersRepository: Repository<User>);
    validateUser(username: string, password: string): Promise<any>;
    login(username: string, password: string): Promise<any>;
    countAdmins(): Promise<number>;
}
