import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: number;
  email: string;
  nome: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<LoginResponse> {
    const usuario = await this.usuariosService.create(dto);
    return this.gerarToken(usuario);
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const usuario = await this.usuariosService.findByEmailComSenha(dto.email);

    // Mensagem única para e-mail inexistente e senha errada:
    // não dar pistas de quais e-mails existem na base (enumeração de usuários)
    if (!usuario || !(await bcrypt.compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.gerarToken(usuario);
  }

  private gerarToken(usuario: Usuario): LoginResponse {
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
    };
    // Garante que o hash nunca sai na resposta, mesmo vindo de consulta com addSelect
    const { password: _password, ...usuarioSemSenha } = usuario;
    return {
      access_token: this.jwtService.sign(payload),
      usuario: usuarioSemSenha as Usuario,
    };
  }
}
