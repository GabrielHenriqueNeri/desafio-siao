import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsCpf } from '../../common/validators/documento.validator';
import { MENSAGEM_UF_INVALIDA, UFS_BRASIL } from '../../common/validators/uf.constante';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Maria da Silva', maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nome: string;

  @ApiProperty({ example: '111.444.777-35', description: 'CPF válido, com ou sem máscara' })
  @IsCpf()
  cpf: string;

  @ApiProperty({ example: 'maria@exemplo.com.br', maxLength: 160 })
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(160)
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    minLength: 8,
    description: 'Mínimo 8 caracteres, com ao menos uma letra e um número',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'A senha deve conter ao menos uma letra e um número',
  })
  password: string;

  @ApiProperty({ example: '(81) 98888-7777', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  telefone: string;

  @ApiProperty({ example: 'Rua do Sol, 120, ap 301', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  endereco: string;

  @ApiProperty({ example: 'Recife', maxLength: 80 })
  @IsString()
  @MaxLength(80)
  cidade: string;

  @ApiProperty({ example: 'PE', description: 'UF brasileira válida', enum: UFS_BRASIL })
  @IsIn(UFS_BRASIL, { message: MENSAGEM_UF_INVALIDA })
  estado: string;

  @ApiProperty({ example: '50030-230', maxLength: 9 })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido (formato 00000-000)' })
  cep: string;

  @ApiPropertyOptional({ example: 1, description: 'ID do cartório ao qual o usuário pertence' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cartorio_id?: number;
}
