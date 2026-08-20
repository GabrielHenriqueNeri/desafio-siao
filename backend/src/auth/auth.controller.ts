import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService, JwtPayload, LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Cria um usuário e já devolve o token de acesso' })
  @ApiResponse({ status: 201, description: 'Usuário criado; token JWT no corpo da resposta' })
  @ApiResponse({ status: 409, description: 'E-mail ou CPF já cadastrado' })
  register(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica por e-mail e senha e devolve o token JWT' })
  @ApiResponse({ status: 200, description: 'Token JWT + dados do usuário' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  @Get('perfil')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Dados do usuário autenticado (token atual)' })
  @ApiResponse({ status: 200, description: 'Usuário do token' })
  perfil(@Req() req: Request & { user: JwtPayload }): Promise<Usuario> {
    return this.usuariosService.findOne(req.user.sub);
  }
}
