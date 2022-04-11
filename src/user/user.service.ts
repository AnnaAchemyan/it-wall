import { Injectable } from '@nestjs/common';
import { LoginDto } from '../auth/dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByPayload(email): Promise<LoginDto> {
    return await this.userRepo.findOne({
      where: { email: email.email },
    });
  }
}
