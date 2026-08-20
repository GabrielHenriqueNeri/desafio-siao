import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Imovel } from '../imoveis/entities/imovel.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CartoriosService } from './cartorios.service';
import { Cartorio } from './entities/cartorio.entity';

describe('CartoriosService', () => {
  let service: CartoriosService;

  const cartoriosRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((entidade) => Promise.resolve({ id: 1, ...entidade })),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };
  const usuariosRepo = { count: jest.fn() };
  const imoveisRepo = { count: jest.fn() };

  const dtoBase = {
    nome: '1º Cartório de Registro de Imóveis de Recife',
    cnpj: '11.222.333/0001-81',
    telefone: '(81) 3222-1100',
    email: 'contato@cri1recife.com.br',
    logradouro: 'Avenida Rio Branco',
    numero: 240,
    bairro: 'Recife Antigo',
    cidade: 'Recife',
    estado: 'PE',
    cep: '50030-310',
    responsavel_nome: 'João Pereira Lima',
    responsavel_cpf: '111.444.777-35',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CartoriosService,
        { provide: getRepositoryToken(Cartorio), useValue: cartoriosRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        { provide: getRepositoryToken(Imovel), useValue: imoveisRepo },
      ],
    }).compile();
    service = moduleRef.get(CartoriosService);
  });

  describe('create', () => {
    it('cria quando o CNPJ está livre', async () => {
      cartoriosRepo.findOne.mockResolvedValue(null);

      const criado = await service.create({ ...dtoBase });

      expect(cartoriosRepo.save).toHaveBeenCalled();
      expect(criado.cnpj).toBe(dtoBase.cnpj);
    });

    it('rejeita CNPJ duplicado com 409', async () => {
      cartoriosRepo.findOne.mockResolvedValue({ id: 99, cnpj: dtoBase.cnpj });

      await expect(service.create({ ...dtoBase })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(cartoriosRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('lança 404 quando o cartório não existe', async () => {
      cartoriosRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(123)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('bloqueia exclusão de cartório com vínculos ativos', async () => {
      cartoriosRepo.findOne.mockResolvedValue({ id: 1, ...dtoBase });
      usuariosRepo.count.mockResolvedValue(2);
      imoveisRepo.count.mockResolvedValue(4);

      await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
      expect(cartoriosRepo.softDelete).not.toHaveBeenCalled();
    });

    it('exclui via soft delete quando não há vínculos', async () => {
      cartoriosRepo.findOne.mockResolvedValue({ id: 1, ...dtoBase });
      usuariosRepo.count.mockResolvedValue(0);
      imoveisRepo.count.mockResolvedValue(0);

      await service.remove(1);

      expect(cartoriosRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
