import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';

/**
 * Seed idempotente: cria dados de demonstração apenas se ainda não existirem.
 * Executar com `npm run seed` (após as migrations).
 *
 * Credenciais de demonstração: admin@siao.com.br / Admin@123
 */
async function seed(): Promise<void> {
  const ds = await AppDataSource.initialize();
  await ds.runMigrations();

  const jaExiste = await ds.query(
    `SELECT 1 FROM usuarios WHERE email = $1 LIMIT 1`,
    ['admin@siao.com.br'],
  );
  if (jaExiste.length > 0) {
    console.log('Seed já aplicado anteriormente — nada a fazer.');
    await ds.destroy();
    return;
  }

  const cartorios = await ds.query(
    `INSERT INTO cartorios
       (nome, cnpj, telefone, email, logradouro, numero, bairro, cidade, estado, cep,
        responsavel_id, responsavel_nome, responsavel_cpf)
     VALUES
       ('1º Cartório de Registro de Imóveis de Recife', '11.222.333/0001-81',
        '(81) 3222-1100', 'contato@cri1recife.com.br', 'Avenida Rio Branco', 240,
        'Recife Antigo', 'Recife', 'PE', '50030-310', NULL, 'João Pereira Lima', '111.444.777-35'),
       ('2º Cartório de Notas de Olinda', '11.444.777/0001-61',
        '(81) 3429-8800', 'atendimento@notasolinda.com.br', 'Rua do Amparo', 88,
        'Amparo', 'Olinda', 'PE', '53020-190', NULL, 'Carla Menezes Duarte', '987.654.321-00')
     RETURNING id`,
  );
  const [cartorio1, cartorio2] = cartorios.map((c: { id: number }) => c.id);

  const senhaAdmin = await bcrypt.hash('Admin@123', 10);
  await ds.query(
    `INSERT INTO usuarios
       (nome, cpf, email, password, telefone, endereco, cidade, estado, cep, cartorio_id)
     VALUES
       ('Administrador do Sistema', '111.444.777-35', 'admin@siao.com.br', $1,
        '(81) 98888-0001', 'Rua do Sol, 120', 'Recife', 'PE', '50030-230', $2),
       ('Beatriz Andrade', '529.982.247-25', 'beatriz@cri1recife.com.br', $1,
        '(81) 98888-0002', 'Rua da Aurora, 1520, ap 903', 'Recife', 'PE', '50050-000', $2),
       ('Rafael Cavalcanti', '123.456.789-09', 'rafael@notasolinda.com.br', $1,
        '(81) 98888-0003', 'Rua do Amparo, 45', 'Olinda', 'PE', '53020-190', $3)`,
    [senhaAdmin, cartorio1, cartorio2],
  );

  await ds.query(
    `INSERT INTO imoveis
       (matricula, tipo, logradouro, numero, bairro, cidade, estado, cep,
        area_total, valor_avaliado, status, proprietario_id, proprietario_nome,
        proprietario_cpf, cartorio_id)
     VALUES
       ('MAT-2026-000101', 'apartamento', 'Rua da Aurora', 1520, 'Boa Vista', 'Recife', 'PE',
        '50050-000', 78.50, 420000.00, 'regular', NULL, 'Ana Beatriz Costa', '111.444.777-35', $1),
       ('MAT-2026-000102', 'casa', 'Rua Benfica', 305, 'Madalena', 'Recife', 'PE',
        '50720-001', 160.00, 650000.00, 'regular', NULL, 'Marcos Vinícius Rocha', '529.982.247-25', $1),
       ('MAT-2026-000103', 'terreno', 'Avenida Caxangá', 4820, 'Várzea', 'Recife', 'PE',
        '50740-000', 450.00, 380000.00, 'pendente', NULL, 'Construtora Horizonte Ltda', '123.456.789-09', $1),
       ('MAT-2026-000104', 'sala_comercial', 'Avenida Conde da Boa Vista', 800, 'Boa Vista', 'Recife', 'PE',
        '50060-004', 42.30, 260000.00, 'alienado', NULL, 'Paula Regina Souto', '111.444.777-35', $1),
       ('MAT-2026-000201', 'casa', 'Rua do Amparo', 77, 'Amparo', 'Olinda', 'PE',
        '53020-190', 210.00, 890000.00, 'regular', NULL, 'Fernando Antônio Braga', '987.654.321-00', $2),
       ('MAT-2026-000202', 'galpao', 'Avenida Presidente Kennedy', 1200, 'Peixinhos', 'Olinda', 'PE',
        '53230-630', 950.00, 1250000.00, 'bloqueado', NULL, 'Logística Atlântico S.A.', '529.982.247-25', $2)`,
    [cartorio1, cartorio2],
  );

  console.log('Seed aplicado com sucesso!');
  console.log('Login de demonstração: admin@siao.com.br / Admin@123');
  await ds.destroy();
}

seed().catch((erro) => {
  console.error('Falha ao aplicar o seed:', erro);
  process.exit(1);
});
