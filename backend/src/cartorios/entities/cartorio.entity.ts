import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Imovel } from '../../imoveis/entities/imovel.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('cartorios')
export class Cartorio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  nome: string;

  @Column({ length: 18 })
  cnpj: string;

  @Column({ length: 20 })
  telefone: string;

  @Column({ length: 160 })
  email: string;

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

  // Dados do responsável mantidos desnormalizados, conforme o modelo ER do desafio
  @Column({ type: 'int', nullable: true })
  responsavel_id: number | null;

  @Column({ length: 120 })
  responsavel_nome: string;

  @Column({ length: 14 })
  responsavel_cpf: string;

  @OneToMany(() => Usuario, (usuario) => usuario.cartorio)
  usuarios: Usuario[];

  @OneToMany(() => Imovel, (imovel) => imovel.cartorio)
  imoveis: Imovel[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}
