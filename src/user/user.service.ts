import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity';
import { Repository } from 'typeorm'

@ApiTags('user')
@Injectable()
export class UserService {

  constructor (
    @InjectRepository (User) private userRepository: Repository <User>,
  ) {}
  
  createUser(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  //findAll
  async getUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  //findOne
  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  //update
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const toUpdate = await this.userRepository.findOne({ where: { id } });
  
    if (toUpdate) {
      Object.assign(toUpdate, updateUserDto);
      return this.userRepository.save(toUpdate);
    }

  }

  // async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
  //   const { password, bio } = updateUserDto;
  //   const user = await this.userRepository.findOne({ where: { id } });
  //   if (user) {
  //     user.password = password;
  //     user.bio = bio;
  //     return this.userRepository.save(user);
  //   }
    
  //   return undefined; 
  // }
  
  // updateUser(id: number, updateUserDto: UpdateUserDto) {
  //   const { password, bio } = updateUserDto;
    
  //   return this.userRepository.createQueryBuilder().update(User).set({password, bio}).where('id = :id', { id }).execute()
  // };

  //remove
  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
