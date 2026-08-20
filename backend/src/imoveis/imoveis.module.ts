import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { Imovel } from './entities/imovel.entity';
import { ImoveisController } from './imoveis.controller';
import { ImoveisService } from './imoveis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Imovel, Cartorio])],
  controllers: [ImoveisController],
  providers: [ImoveisService],
  exports: [ImoveisService],
})
export class ImoveisModule {}
