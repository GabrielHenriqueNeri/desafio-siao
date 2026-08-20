import { CreateUsuarioDto } from '../../usuarios/dto/create-usuario.dto';

/**
 * O registro público usa exatamente o mesmo contrato da criação de usuário.
 * A classe separada existe para o contrato do endpoint ficar explícito no Swagger.
 */
export class RegisterDto extends CreateUsuarioDto {}
