import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsCnpj, IsCpf } from '../../common/validators/documento.validator';

export class CreateCartorioDto {
  @ApiProperty({ example: '1º Cartório de Registro de Imóveis de Recife', maxLength: 160 })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  nome: string;

  @ApiProperty({ example: '11.222.333/0001-81', description: 'CNPJ válido, com ou sem máscara' })
  @IsCnpj()
  cnpj: string;

  @ApiProperty({ example: '(81) 3222-1100', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  telefone: string;

  @ApiProperty({ example: 'contato@cartoriorecife.com.br', maxLength: 160 })
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'Avenida Rio Branco', maxLength: 160 })
  @IsString()
  @MaxLength(160)
  logradouro: string;

  @ApiProperty({ example: 240 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  numero: number;

  @ApiProperty({ example: 'Recife Antigo', maxLength: 80 })
  @IsString()
  @MaxLength(80)
  bairro: string;

  @ApiProperty({ example: 'Recife', maxLength: 80 })
  @IsString()
  @MaxLength(80)
  cidade: string;

  @ApiProperty({ example: 'PE', description: 'UF com 2 letras maiúsculas' })
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'Estado deve ser a UF com 2 letras maiúsculas (ex.: PE)' })
  estado: string;

  @ApiProperty({ example: '50030-310', maxLength: 9 })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido (formato 00000-000)' })
  cep: string;

  @ApiPropertyOptional({ example: 10, description: 'Identificador externo do responsável' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  responsavel_id?: number;

  @ApiProperty({ example: 'João Pereira Lima', maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  responsavel_nome: string;

  @ApiProperty({ example: '111.444.777-35', description: 'CPF válido do responsável' })
  @IsCpf()
  responsavel_cpf: string;
}
