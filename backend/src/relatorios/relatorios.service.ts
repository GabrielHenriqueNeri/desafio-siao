import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { Imovel } from '../imoveis/entities/imovel.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

export interface ResumoGeral {
  total_cartorios: number;
  total_usuarios: number;
  total_imoveis: number;
  valor_total_avaliado: number;
  area_total_registrada: number;
}

export interface LinhaPorCartorio {
  cartorio_id: number;
  cartorio_nome: string;
  total_imoveis: number;
  valor_total_avaliado: number;
  total_usuarios: number;
}

export interface LinhaAgrupada {
  chave: string;
  total: number;
  valor_total_avaliado: number;
}

@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Cartorio)
    private readonly cartoriosRepo: Repository<Cartorio>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Imovel)
    private readonly imoveisRepo: Repository<Imovel>,
  ) {}

  async resumo(): Promise<ResumoGeral> {
    const [totalCartorios, totalUsuarios, totalImoveis, agregados] =
      await Promise.all([
        this.cartoriosRepo.count(),
        this.usuariosRepo.count(),
        this.imoveisRepo.count(),
        this.imoveisRepo
          .createQueryBuilder('imovel')
          .select('COALESCE(SUM(imovel.valor_avaliado), 0)', 'valor')
          .addSelect('COALESCE(SUM(imovel.area_total), 0)', 'area')
          .getRawOne<{ valor: string; area: string }>(),
      ]);

    return {
      total_cartorios: totalCartorios,
      total_usuarios: totalUsuarios,
      total_imoveis: totalImoveis,
      valor_total_avaliado: parseFloat(agregados?.valor ?? '0'),
      area_total_registrada: parseFloat(agregados?.area ?? '0'),
    };
  }

  async imoveisPorCartorio(): Promise<LinhaPorCartorio[]> {
    const linhas = await this.cartoriosRepo
      .createQueryBuilder('cartorio')
      .leftJoin(
        'cartorio.imoveis',
        'imovel',
        'imovel.deleted_at IS NULL',
      )
      .leftJoin(
        'cartorio.usuarios',
        'usuario',
        'usuario.deleted_at IS NULL',
      )
      .select('cartorio.id', 'cartorio_id')
      .addSelect('cartorio.nome', 'cartorio_nome')
      .addSelect('COUNT(DISTINCT imovel.id)', 'total_imoveis')
      .addSelect('COUNT(DISTINCT usuario.id)', 'total_usuarios')
      .groupBy('cartorio.id')
      .addGroupBy('cartorio.nome')
      .orderBy('cartorio.id', 'ASC')
      .getRawMany<{
        cartorio_id: number;
        cartorio_nome: string;
        total_imoveis: string;
        total_usuarios: string;
      }>();

    // O join duplo (imóveis × usuários) multiplicaria linhas num SUM direto;
    // o valor avaliado por cartório é somado em consulta própria, correta por construção:
    const valores = await this.imoveisRepo
      .createQueryBuilder('imovel')
      .select('imovel.cartorio_id', 'cartorio_id')
      .addSelect('COALESCE(SUM(imovel.valor_avaliado), 0)', 'valor')
      .groupBy('imovel.cartorio_id')
      .getRawMany<{ cartorio_id: number; valor: string }>();
    const valorPorCartorio = new Map(
      valores.map((v) => [Number(v.cartorio_id), parseFloat(v.valor)]),
    );

    return linhas.map((linha) => ({
      cartorio_id: Number(linha.cartorio_id),
      cartorio_nome: linha.cartorio_nome,
      total_imoveis: Number(linha.total_imoveis),
      valor_total_avaliado: valorPorCartorio.get(Number(linha.cartorio_id)) ?? 0,
      total_usuarios: Number(linha.total_usuarios),
    }));
  }

  imoveisPorTipo(): Promise<LinhaAgrupada[]> {
    return this.agruparImoveis('tipo');
  }

  imoveisPorStatus(): Promise<LinhaAgrupada[]> {
    return this.agruparImoveis('status');
  }

  private async agruparImoveis(coluna: 'tipo' | 'status'): Promise<LinhaAgrupada[]> {
    const linhas = await this.imoveisRepo
      .createQueryBuilder('imovel')
      .select(`imovel.${coluna}`, 'chave')
      .addSelect('COUNT(*)', 'total')
      .addSelect('COALESCE(SUM(imovel.valor_avaliado), 0)', 'valor')
      .groupBy(`imovel.${coluna}`)
      .orderBy('total', 'DESC')
      .getRawMany<{ chave: string; total: string; valor: string }>();

    return linhas.map((linha) => ({
      chave: linha.chave,
      total: Number(linha.total),
      valor_total_avaliado: parseFloat(linha.valor),
    }));
  }
}
