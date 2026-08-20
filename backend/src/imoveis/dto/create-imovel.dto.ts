import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsCpf } from '../../common/validators/documento.validator';
import { MENSAGEM_UF_INVALIDA, UFS_BRASIL } from '../../common/validators/uf.constante';
import { StatusImovel, TipoImovel } from '../entities/imovel.entity';

export class CreateImovelDto {
  @ApiProperty({ example: 'MAT-2026-000123', maxLength: 40, description: 'Matrícula do imóvel (única por cartório)' })
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  matricula: string;

  @ApiProperty({ enum: TipoImovel, example: TipoImovel.APARTAMENTO })
  @IsEnum(TipoImovel, { message: 'Tipo inválido' })
  tipo: TipoImovel;

  @ApiProperty({ example: 'Rua da Aurora', maxLength: 160 })
  @IsString()
  @MaxLength(160)
  logradouro: string;

  @ApiProperty({ example: 1520 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  numero: number;

  @ApiProperty({ example: 'Boa Vista', maxLength: 80 })
  @IsString()
  @MaxLength(80)
  bairro: string;

  @ApiProperty({ example: 'Recife', maxLength: 80 })
  @IsString()
  @MaxLength(80)
  cidade: string;

  @ApiProperty({ example: 'PE', description: 'UF brasileira válida', enum: UFS_BRASIL })
  @IsIn(UFS_BRASIL, { message: MENSAGEM_UF_INVALIDA })
  estado: string;

  @ApiProperty({ example: '50050-000', maxLength: 9 })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido (formato 00000-000)' })
  cep: string;

  @ApiProperty({ example: 78.5, description: 'Área total em m² (maior que zero)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Área total deve ser maior que zero' })
  area_total: number;

  @ApiProperty({ example: 420000.0, description: 'Valor de avaliação em reais' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Valor avaliado não pode ser negativo' })
  valor_avaliado: number;

  @ApiPropertyOptional({ enum: StatusImovel, default: StatusImovel.REGULAR })
  @IsOptional()
  @IsEnum(StatusImovel, { message: 'Status inválido' })
  status?: StatusImovel;

  @ApiPropertyOptional({ example: 55, description: 'Identificador externo do proprietário' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  proprietario_id?: number;

  @ApiProperty({ example: 'Ana Beatriz Costa', maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  proprietario_nome: string;

  @ApiProperty({ example: '111.444.777-35', description: 'CPF válido do proprietário' })
  @IsCpf()
  proprietario_cpf: string;

  @ApiProperty({ example: 1, description: 'ID do cartório onde o imóvel está registrado' })
  @Type(() => Number)
  @IsInt()
  cartorio_id: number;
}
