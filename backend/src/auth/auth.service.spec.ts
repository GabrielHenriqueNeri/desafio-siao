import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const usuariosService = {
    create: jest.fn(),
    findByEmailComSenha: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('token-de-teste'),
  };

  const senhaCorreta = 'Senha@123';
  const usuarioBase = {
    id: 1,
    nome: 'Maria da Silva',
    email: 'maria@exemplo.com.br',
    password: bcrypt.hashSync(senhaCorreta, 4),
  } as Usuario;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('devolve token e usuário sem o hash da senha quando as credenciais são válidas', async () => {
      usuariosService.findByEmailComSenha.mockResolvedValue({ ...usuarioBase });

      const resultado = await service.login({
        email: usuarioBase.email,
        password: senhaCorreta,
      });

      expect(resultado.access_token).toBe('token-de-teste');
      expect(resultado.usuario.email).toBe(usuarioBase.email);
      expect((resultado.usuario as { password?: string }).password).toBeUndefined();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: usuarioBase.id,
        email: usuarioBase.email,
        nome: usuarioBase.nome,
      });
    });

    it('rejeita senha incorreta com 401', async () => {
      usuariosService.findByEmailComSenha.mockResolvedValue({ ...usuarioBase });

      await expect(
        service.login({ email: usuarioBase.email, password: 'senha-errada-1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejeita e-mail inexistente com a MESMA mensagem de senha errada (anti-enumeração)', async () => {
      usuariosService.findByEmailComSenha.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@exemplo.com.br', password: senhaCorreta }),
      ).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('register', () => {
    it('cria o usuário e já devolve um token', async () => {
      usuariosService.create.mockResolvedValue({ ...usuarioBase });

      const resultado = await service.register({
        nome: usuarioBase.nome,
        cpf: '111.444.777-35',
        email: usuarioBase.email,
        password: senhaCorreta,
        telefone: '(81) 98888-0001',
        endereco: 'Rua do Sol, 120',
        cidade: 'Recife',
        estado: 'PE',
        cep: '50030-230',
      });

      expect(usuariosService.create).toHaveBeenCalled();
      expect(resultado.access_token).toBe('token-de-teste');
    });
  });
});
