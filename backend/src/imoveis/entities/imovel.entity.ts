import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';
import { Cartorio } from '../../cartorios/entities/cartorio.entity';

export enum TipoImovel {
  CASA = 'casa',
  APARTAMENTO = 'apartamento',
  TERRENO = 'terreno',
  SALA_COMERCIAL = 'sala_comercial',
  GALPAO = 'galpao',
  RURAL = 'rural',
  OUTRO = 'outro',
}

export enum StatusImovel {
  REGULAR = 'regular',
  PENDENTE = 'pendente',
  ALIENADO = 'alienado',
  BLOQUEADO = 'bloqueado',
  CANCELADO = 'cancelado',
}

@Entity('imoveis')
export class Imovel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 40 })
  matricula: string;

  @Column({ length: 20 })
  tipo: TipoImovel;

  @Column({ length: 160 })
  logradouro: string;

  @Column({ type: 'int' })
  numero: number;

  @Column({ length: 80 })
  bairro: string;

  @Column({ length: 80 })
  cidade: string;

  @Column({ type: 'char', length: 2 })
  estado: string;

  @Column({ length: 9 })
  cep: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: new NumericTransformer() })
  area_total: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: new NumericTransformer() })
  valor_avaliado: number;

  @Column({ length: 20, default: StatusImovel.REGULAR })
  status: StatusImovel;

  // Dados do proprietário mantidos desnormalizados, conforme o modelo ER do desafio
  @Column({ type: 'int', nullable: true })
  proprietario_id: number | null;

  @Column({ length: 120 })
  proprietario_nome: string;

  @Column({ length: 14 })
  proprietario_cpf: string;

  @Column({ type: 'int' })
  cartorio_id: number;

  @ManyToOne(() => Cartorio, (cartorio) => cartorio.imoveis, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cartorio_id' })
  cartorio?: Cartorio;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}
