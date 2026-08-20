import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { StatusImovel, TipoImovel } from '../entities/imovel.entity';

export class FiltroImoveisDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TipoImovel, description: 'Filtra por tipo' })
  @IsOptional()
  @IsEnum(TipoImovel)
  tipo?: TipoImovel;

  @ApiPropertyOptional({ enum: StatusImovel, description: 'Filtra por status' })
  @IsOptional()
  @IsEnum(StatusImovel)
  status?: StatusImovel;

  @ApiPropertyOptional({ description: 'Filtra por cartório', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cartorio_id?: number;
}
