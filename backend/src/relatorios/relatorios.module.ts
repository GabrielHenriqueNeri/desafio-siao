import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { Imovel } from '../imoveis/entities/imovel.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cartorio, Usuario, Imovel])],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}
