import { PartialType } from '@nestjs/swagger';
import { CreateCartorioDto } from './create-cartorio.dto';

export class UpdateCartorioDto extends PartialType(CreateCartorioDto) {}
