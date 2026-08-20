import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;

  const usuariosRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((entidade) => Promise.resolve(entidade)),
    softDelete: jest.fn(),
  };
  const cartoriosRepo = { exists: jest.fn() };

  const usuarioVinculado = {
    id: 1,
    nome: 'Beatriz Andrade',
    cpf: '529.982.247-25',
    email: 'beatriz@exemplo.com.br',
    cartorio_id: 4,
    // Relação carregada pelo findOne — é ela que causava o bug de desvinculação
    cartorio: { id: 4, nome: 'Cartório Exemplo' },
  } as unknown as Usuario;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        { provide: getRepositoryToken(Cartorio), useValue: cartoriosRepo },
      ],
    }).compile();
    service = moduleRef.get(UsuariosService);
  });

  describe('update — desvinculação de cartório (regressão)', () => {
    it('grava cartorio_id null e NÃO reenvia a relação carregada', async () => {
      usuariosRepo.findOne.mockResolvedValue({ ...usuarioVinculado });

      await service.update(1, { cartorio_id: null });

      const salvo = usuariosRepo.save.mock.calls[0][0];
      expect(salvo.cartorio_id).toBeNull();
      // Se a relação fosse junto, o TypeORM restauraria o vínculo antigo
      expect(salvo.cartorio).toBeUndefined();
    });

    it('mantém o vínculo quando o campo não é enviado', async () => {
      usuariosRepo.findOne.mockResolvedValue({ ...usuarioVinculado });

      await service.update(1, { nome: 'Beatriz A. Andrade' });

      const salvo = usuariosRepo.save.mock.calls[0][0];
      expect(salvo.cartorio_id).toBe(4);
    });

    it('rejeita vínculo com cartório inexistente', async () => {
      usuariosRepo.findOne.mockResolvedValue({ ...usuarioVinculado });
      cartoriosRepo.exists.mockResolvedValue(false);

      await expect(service.update(1, { cartorio_id: 999 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(usuariosRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('rejeita e-mail já cadastrado com 409', async () => {
      usuariosRepo.findOne.mockResolvedValue({ id: 9 });

      await expect(
        service.create({
          nome: 'Novo Usuário',
          cpf: '111.444.777-35',
          email: 'beatriz@exemplo.com.br',
          password: 'Senha@123',
          telefone: '(81) 98888-0000',
          endereco: 'Rua A, 1',
          cidade: 'Recife',
          estado: 'PE',
          cep: '50000-000',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usuariosRepo.save).not.toHaveBeenCalled();
    });
  });
});
