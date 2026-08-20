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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CartoriosService } from './cartorios.service';
import { CreateCartorioDto } from './dto/create-cartorio.dto';
import { UpdateCartorioDto } from './dto/update-cartorio.dto';
import { Cartorio } from './entities/cartorio.entity';

@ApiTags('Cartórios')
@ApiBearerAuth('bearer')
@Controller('cartorios')
export class CartoriosController {
  constructor(private readonly cartoriosService: CartoriosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um cartório' })
  @ApiResponse({ status: 201, description: 'Cartório criado' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado' })
  create(@Body() dto: CreateCartorioDto): Promise<Cartorio> {
    return this.cartoriosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista cartórios com paginação e busca por nome/CNPJ/cidade' })
  findAll(@Query() query: PaginationQueryDto): Promise<Paginated<Cartorio>> {
    return this.cartoriosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cartório pelo ID' })
  @ApiResponse({ status: 404, description: 'Cartório não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cartorio> {
    return this.cartoriosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um cartório' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartorioDto,
  ): Promise<Cartorio> {
    return this.cartoriosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um cartório (soft delete; bloqueado se houver vínculos ativos)' })
  @ApiResponse({ status: 409, description: 'Cartório possui usuários ou imóveis ativos' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cartoriosService.remove(id);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaura um cartório excluído' })
  restore(@Param('id', ParseIntPipe) id: number): Promise<Cartorio> {
    return this.cartoriosService.restore(id);
  }
}
