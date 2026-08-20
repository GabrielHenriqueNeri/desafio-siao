import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imovel } from '../imoveis/entities/imovel.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CartoriosController } from './cartorios.controller';
import { CartoriosService } from './cartorios.service';
import { Cartorio } from './entities/cartorio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cartorio, Usuario, Imovel])],
  controllers: [CartoriosController],
  providers: [CartoriosService],
  exports: [CartoriosService],
})
export class CartoriosModule {}
