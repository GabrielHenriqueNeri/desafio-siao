import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Paginated, paginar } from '../common/dto/paginated.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Cartorio } from '../cartorios/entities/cartorio.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Cartorio)
    private readonly cartoriosRepo: Repository<Cartorio>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    await this.garantirEmailECpfLivres(dto.email, dto.cpf);
    if (dto.cartorio_id != null) {
      await this.garantirCartorioExiste(dto.cartorio_id);
    }

    const usuario = this.usuariosRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    });
    const salvo = await this.usuariosRepo.save(usuario);
    return this.findOne(salvo.id);
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<Usuario>> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 10;

    const qb = this.usuariosRepo
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.cartorio', 'cartorio')
      .orderBy('usuario.id', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite);

    if (query.busca) {
      qb.andWhere(
        '(usuario.nome ILIKE :busca OR usuario.email ILIKE :busca OR usuario.cpf ILIKE :busca)',
        { busca: `%${query.busca}%` },
      );
    }

    const [dados, total] = await qb.getManyAndCount();
    return paginar(dados, total, pagina, limite);
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      relations: { cartorio: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }
    return usuario;
  }

  /** Uso exclusivo do login: única consulta que traz o hash da senha. */
  findByEmailComSenha(email: string): Promise<Usuario | null> {
    return this.usuariosRepo
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.email = :email', { email })
      .getOne();
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (dto.email || dto.cpf) {
      await this.garantirEmailECpfLivres(dto.email, dto.cpf, id);
    }
    if (dto.cartorio_id != null) {
      await this.garantirCartorioExiste(dto.cartorio_id);
    }

    const alteracoes: Partial<Usuario> = { ...dto } as Partial<Usuario>;
    if (dto.password) {
      alteracoes.password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }

    // A relação `cartorio` carregada tem precedência sobre a coluna cartorio_id
    // no save() — mantê-la reverteria a desvinculação (cartorio_id: null).
    const { cartorio: _cartorio, ...dadosAtuais } = usuario;
    await this.usuariosRepo.save({ ...dadosAtuais, ...alteracoes });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.usuariosRepo.softDelete(id);
  }

  async restore(id: number): Promise<Usuario> {
    const resultado = await this.usuariosRepo.restore(id);
    if (!resultado.affected) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }
    return this.findOne(id);
  }

  private async garantirEmailECpfLivres(
    email?: string,
    cpf?: string,
    ignorarId?: number,
  ): Promise<void> {
    if (email) {
      const existente = await this.usuariosRepo.findOne({ where: { email } });
      if (existente && existente.id !== ignorarId) {
        throw new ConflictException('Já existe um usuário com este e-mail');
      }
    }
    if (cpf) {
      const existente = await this.usuariosRepo.findOne({ where: { cpf } });
      if (existente && existente.id !== ignorarId) {
        throw new ConflictException('Já existe um usuário com este CPF');
      }
    }
  }

  private async garantirCartorioExiste(cartorioId: number): Promise<void> {
    const existe = await this.cartoriosRepo.exists({ where: { id: cartorioId } });
    if (!existe) {
      throw new NotFoundException(`Cartório ${cartorioId} não encontrado`);
    }
  }
}
