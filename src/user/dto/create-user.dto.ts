import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Yumi' })
  nombre: string;

  @ApiProperty({ example: 'Namie' })
  apellidos: string;

  @ApiProperty({ example: 1000 })
  saldo: number;

  @ApiProperty({ example: 'password1234' })
  password: string;

  @ApiProperty({ example: 'yumi@example.com' })
  email: string;

  @ApiProperty({ example: '2023-06-16' })
  fecha_creacion: Date;

  @ApiProperty({ example: '2023-06-16' })
  fecha_actualizacion: Date;
}
