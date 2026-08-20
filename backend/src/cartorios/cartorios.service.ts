import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paginated, paginar } from '../common/dto/paginated.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Imovel } from '../imoveis/entities/imovel.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateCartorioDto } from './dto/create-cartorio.dto';
import { UpdateCartorioDto } from './dto/update-cartorio.dto';
import { Cartorio } from './entities/cartorio.entity';

@Injectable()
export class CartoriosService {
  constructor(
    @InjectRepository(Cartorio)
    private readonly cartoriosRepo: Repository<Cartorio>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Imovel)
    private readonly imoveisRepo: Repository<Imovel>,
  ) {}

  async create(dto: CreateCartorioDto): Promise<Cartorio> {
    await this.garantirCnpjLivre(dto.cnpj);
    const cartorio = this.cartoriosRepo.create(dto);
    return this.cartoriosRepo.save(cartorio);
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<Cartorio>> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;

    const qb = this.cartoriosRepo
      .createQueryBuilder('cartorio')
      .orderBy('cartorio.id', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite);

    if (query.busca) {
      qb.andWhere(
        '(cartorio.nome ILIKE :busca OR cartorio.cnpj ILIKE :busca OR cartorio.cidade ILIKE :busca)',
        { busca: `%${query.busca}%` },
      );
    }

    const [dados, total] = await qb.getManyAndCount();
    return paginar(dados, total, pagina, limite);
  }

  async findOne(id: number): Promise<Cartorio> {
    const cartorio = await this.cartoriosRepo.findOne({ where: { id } });
    if (!cartorio) {
      throw new NotFoundException(`Cartório ${id} não encontrado`);
    }
    return cartorio;
  }

  async update(id: number, dto: UpdateCartorioDto): Promise<Cartorio> {
    const cartorio = await this.findOne(id);
    if (dto.cnpj && dto.cnpj !== cartorio.cnpj) {
      await this.garantirCnpjLivre(dto.cnpj, id);
    }
    await this.cartoriosRepo.save({ ...cartorio, ...dto });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    // Regra de integridade: cartório com vínculos ativos não pode ser excluído
    const [usuariosVinculados, imoveisVinculados] = await Promise.all([
      this.usuariosRepo.count({ where: { cartorio_id: id } }),
      this.imoveisRepo.count({ where: { cartorio_id: id } }),
    ]);
    if (usuariosVinculados > 0 || imoveisVinculados > 0) {
      throw new ConflictException(
        `Cartório possui ${usuariosVinculados} usuário(s) e ${imoveisVinculados} imóvel(is) ativos — ` +
          'transfira ou exclua os vínculos antes',
      );
    }

    await this.cartoriosRepo.softDelete(id);
  }

  async restore(id: number): Promise<Cartorio> {
    const resultado = await this.cartoriosRepo.restore(id);
    if (!resultado.affected) {
      throw new NotFoundException(`Cartório ${id} não encontrado`);
    }
    return this.findOne(id);
  }

  private async garantirCnpjLivre(cnpj: string, ignorarId?: number): Promise<void> {
    const existente = await this.cartoriosRepo.findOne({ where: { cnpj } });
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('Já existe um cartório com este CNPJ');
    }
  }
}
