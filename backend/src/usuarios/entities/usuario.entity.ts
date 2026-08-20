import { Exclude } from 'class-transformer';
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
import { Cartorio } from '../../cartorios/entities/cartorio.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  nome: string;

  @Column({ length: 14 })
  cpf: string;

  @Column({ length: 160 })
  email: string;

  // select:false tira o hash das consultas por padrão; @Exclude é a segunda barreira na serialização
  @Exclude()
  @Column({ length: 72, select: false })
  password: string;

  @Column({ length: 20 })
  telefone: string;

  @Column({ length: 200 })
  endereco: string;

  @Column({ length: 80 })
  cidade: string;

  @Column({ type: 'char', length: 2 })
  estado: string;

  @Column({ length: 9 })
  cep: string;

  @Column({ type: 'int', nullable: true })
  cartorio_id: number | null;

  @ManyToOne(() => Cartorio, (cartorio) => cartorio.usuarios, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cartorio_id' })
  cartorio?: Cartorio | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}
