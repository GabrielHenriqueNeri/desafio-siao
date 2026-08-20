import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

/** Todos os campos do create, porém opcionais (atualização parcial via PATCH). */
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
