import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { Imovel } from '../imoveis/entities/imovel.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { escaparCampoCsv, RelatoriosService } from './relatorios.service';

describe('escaparCampoCsv', () => {
  it('mantém texto simples sem aspas', () => {
    expect(escaparCampoCsv('Recife')).toBe('Recife');
  });

  it('envolve em aspas quando o campo contém o separador', () => {
    expect(escaparCampoCsv('Cartório; o maior')).toBe('"Cartório; o maior"');
  });

  it('duplica aspas internas (RFC 4180)', () => {
    expect(escaparCampoCsv('Sítio "Boa Vista"')).toBe('"Sítio ""Boa Vista"""');
  });

  it('converte nulo em vazio', () => {
    expect(escaparCampoCsv(null)).toBe('');
  });
});

describe('RelatoriosService — exportarImoveisCsv', () => {
  const imoveisRepo = { find: jest.fn(), createQueryBuilder: jest.fn(), count: jest.fn() };
  const cartoriosRepo = { createQueryBuilder: jest.fn(), count: jest.fn() };
  const usuariosRepo = { count: jest.fn() };

  let service: RelatoriosService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RelatoriosService,
        { provide: getRepositoryToken(Cartorio), useValue: cartoriosRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuariosRepo },
        { provide: getRepositoryToken(Imovel), useValue: imoveisRepo },
      ],
    }).compile();
    service = moduleRef.get(RelatoriosService);
  });

  it('gera cabeçalho + uma linha por imóvel, com campo problemático escapado', async () => {
    imoveisRepo.find.mockResolvedValue([
      {
        id: 1,
        matricula: 'MAT-1',
        tipo: 'casa',
        status: 'regular',
        logradouro: 'Rua A; casa B',
        numero: 10,
        bairro: 'Centro',
        cidade: 'Recife',
        estado: 'PE',
        cep: '50000-000',
        area_total: 100,
        valor_avaliado: 250000,
        proprietario_nome: 'Ana',
        proprietario_cpf: '111.444.777-35',
        cartorio: { nome: '1º Cartório de Recife' },
      },
    ]);

    const csv = await service.exportarImoveisCsv();
    const linhas = csv.split('\r\n');

    expect(linhas).toHaveLength(2);
    expect(linhas[0].startsWith('id;matricula;tipo;status')).toBe(true);
    expect(linhas[1]).toContain('"Rua A; casa B"');
    expect(linhas[1]).toContain('1º Cartório de Recife');
  });
});
