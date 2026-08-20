import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Paginated } from '../common/dto/paginated.dto';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { FiltroImoveisDto } from './dto/filtro-imoveis.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';
import { Imovel } from './entities/imovel.entity';
import { ImoveisService } from './imoveis.service';

@ApiTags('Imóveis')
@ApiBearerAuth('bearer')
@Controller('imoveis')
export class ImoveisController {
  constructor(private readonly imoveisService: ImoveisService) {}

  @Post()
  @ApiOperation({ summary: 'Registra um imóvel em um cartório' })
  @ApiResponse({ status: 201, description: 'Imóvel criado' })
  @ApiResponse({ status: 404, description: 'Cartório informado não existe' })
  @ApiResponse({ status: 409, description: 'Matrícula já registrada neste cartório' })
  create(@Body() dto: CreateImovelDto): Promise<Imovel> {
    return this.imoveisService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Lista imóveis com paginação, busca (matrícula/cidade/proprietário) e filtros por tipo, status e cartório',
  })
  findAll(@Query() query: FiltroImoveisDto): Promise<Paginated<Imovel>> {
    return this.imoveisService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um imóvel pelo ID' })
  @ApiResponse({ status: 404, description: 'Imóvel não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Imovel> {
    return this.imoveisService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um imóvel' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImovelDto,
  ): Promise<Imovel> {
    return this.imoveisService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um imóvel (soft delete — preserva o histórico)' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.imoveisService.remove(id);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaura um imóvel excluído' })
  restore(@Param('id', ParseIntPipe) id: number): Promise<Imovel> {
    return this.imoveisService.restore(id);
  }
}
