import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { StatusImovel, TipoImovel } from './entities/imovel.entity';
import { Imovel } from './entities/imovel.entity';
import { ImoveisService } from './imoveis.service';

describe('ImoveisService', () => {
  let service: ImoveisService;

  const imoveisRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((entidade) => Promise.resolve({ id: 10, ...entidade })),
    softDelete: jest.fn(),
  };
  const cartoriosRepo = { exists: jest.fn() };

  const dtoBase = {
    matricula: 'MAT-2026-000123',
    tipo: TipoImovel.APARTAMENTO,
    logradouro: 'Rua da Aurora',
    numero: 1520,
    bairro: 'Boa Vista',
    cidade: 'Recife',
    estado: 'PE',
    cep: '50050-000',
    area_total: 78.5,
    valor_avaliado: 420000,
    status: StatusImovel.REGULAR,
    proprietario_nome: 'Ana Beatriz Costa',
    proprietario_cpf: '111.444.777-35',
    cartorio_id: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ImoveisService,
        { provide: getRepositoryToken(Imovel), useValue: imoveisRepo },
        { provide: getRepositoryToken(Cartorio), useValue: cartoriosRepo },
      ],
    }).compile();
    service = moduleRef.get(ImoveisService);
  });

  describe('create', () => {
    it('rejeita com 404 quando o cartório informado não existe', async () => {
      cartoriosRepo.exists.mockResolvedValue(false);

      await expect(service.create({ ...dtoBase })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(imoveisRepo.save).not.toHaveBeenCalled();
    });

    it('rejeita com 409 quando a matrícula já existe no mesmo cartório', async () => {
      cartoriosRepo.exists.mockResolvedValue(true);
      imoveisRepo.findOne.mockResolvedValue({ id: 5, matricula: dtoBase.matricula });

      await expect(service.create({ ...dtoBase })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(imoveisRepo.save).not.toHaveBeenCalled();
    });

    it('cria o imóvel quando cartório existe e matrícula está livre', async () => {
      cartoriosRepo.exists.mockResolvedValue(true);
      // 1ª chamada: verificação de matrícula (livre); 2ª: findOne(id) após salvar
      imoveisRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 10, ...dtoBase });

      const criado = await service.create({ ...dtoBase });

      expect(imoveisRepo.save).toHaveBeenCalled();
      expect(criado.id).toBe(10);
      expect(criado.matricula).toBe(dtoBase.matricula);
    });
  });
});
