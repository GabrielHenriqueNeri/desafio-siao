import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paginated, paginar } from '../common/dto/paginated.dto';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { FiltroImoveisDto } from './dto/filtro-imoveis.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';
import { Imovel } from './entities/imovel.entity';

@Injectable()
export class ImoveisService {
  constructor(
    @InjectRepository(Imovel)
    private readonly imoveisRepo: Repository<Imovel>,
    @InjectRepository(Cartorio)
    private readonly cartoriosRepo: Repository<Cartorio>,
  ) {}

  async create(dto: CreateImovelDto): Promise<Imovel> {
    await this.garantirCartorioExiste(dto.cartorio_id);
    await this.garantirMatriculaLivre(dto.matricula, dto.cartorio_id);

    const imovel = this.imoveisRepo.create(dto);
    const salvo = await this.imoveisRepo.save(imovel);
    return this.findOne(salvo.id);
  }

  async findAll(query: FiltroImoveisDto): Promise<Paginated<Imovel>> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;

    const qb = this.imoveisRepo
      .createQueryBuilder('imovel')
      .leftJoinAndSelect('imovel.cartorio', 'cartorio')
      .orderBy('imovel.id', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite);

    if (query.busca) {
      qb.andWhere(
        '(imovel.matricula ILIKE :busca OR imovel.cidade ILIKE :busca OR imovel.proprietario_nome ILIKE :busca)',
        { busca: `%${query.busca}%` },
      );
    }
    if (query.tipo) {
      qb.andWhere('imovel.tipo = :tipo', { tipo: query.tipo });
    }
    if (query.status) {
      qb.andWhere('imovel.status = :status', { status: query.status });
    }
    if (query.cartorio_id) {
      qb.andWhere('imovel.cartorio_id = :cartorioId', { cartorioId: query.cartorio_id });
    }

    const [dados, total] = await qb.getManyAndCount();
    return paginar(dados, total, pagina, limite);
  }

  async findOne(id: number): Promise<Imovel> {
    const imovel = await this.imoveisRepo.findOne({
      where: { id },
      relations: { cartorio: true },
    });
    if (!imovel) {
      throw new NotFoundException(`Imóvel ${id} não encontrado`);
    }
    return imovel;
  }

  async update(id: number, dto: UpdateImovelDto): Promise<Imovel> {
    const imovel = await this.findOne(id);

    if (dto.cartorio_id != null) {
      await this.garantirCartorioExiste(dto.cartorio_id);
    }

    const novaMatricula = dto.matricula ?? imovel.matricula;
    const novoCartorio = dto.cartorio_id ?? imovel.cartorio_id;
    if (novaMatricula !== imovel.matricula || novoCartorio !== imovel.cartorio_id) {
      await this.garantirMatriculaLivre(novaMatricula, novoCartorio, id);
    }

    const { cartorio: _cartorio, ...dadosAtuais } = imovel;
    await this.imoveisRepo.save({ ...dadosAtuais, ...dto });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.imoveisRepo.softDelete(id);
  }

  async restore(id: number): Promise<Imovel> {
    const resultado = await this.imoveisRepo.restore(id);
    if (!resultado.affected) {
      throw new NotFoundException(`Imóvel ${id} não encontrado`);
    }
    return this.findOne(id);
  }

  private async garantirCartorioExiste(cartorioId: number): Promise<void> {
    const existe = await this.cartoriosRepo.exists({ where: { id: cartorioId } });
    if (!existe) {
      throw new NotFoundException(`Cartório ${cartorioId} não encontrado`);
    }
  }

  private async garantirMatriculaLivre(
    matricula: string,
    cartorioId: number,
    ignorarId?: number,
  ): Promise<void> {
    const existente = await this.imoveisRepo.findOne({
      where: { matricula, cartorio_id: cartorioId },
    });
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException(
        'Já existe um imóvel com esta matrícula neste cartório',
      );
    }
  }
}
