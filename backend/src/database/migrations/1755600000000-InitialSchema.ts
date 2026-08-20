import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema inicial: cartorios, usuarios e imoveis, seguindo o modelo ER do
 * desafio, com as constraints de integridade:
 *  - PKs, FKs (usuario.cartorio_id e imovel.cartorio_id → cartorios.id);
 *  - UNIQUE parciais (só valem para registros não excluídos — soft delete);
 *  - CHECKs de domínio (estado com 2 letras, área > 0, valor >= 0, enums);
 *  - índices nas FKs e colunas mais filtradas.
 */
export class InitialSchema1755600000000 implements MigrationInterface {
  name = 'InitialSchema1755600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE cartorios (
        id               SERIAL PRIMARY KEY,
        nome             VARCHAR(160) NOT NULL,
        cnpj             VARCHAR(18)  NOT NULL,
        telefone         VARCHAR(20)  NOT NULL,
        email            VARCHAR(160) NOT NULL,
        logradouro       VARCHAR(160) NOT NULL,
        numero           INTEGER      NOT NULL,
        bairro           VARCHAR(80)  NOT NULL,
        cidade           VARCHAR(80)  NOT NULL,
        estado           CHAR(2)      NOT NULL,
        cep              VARCHAR(9)   NOT NULL,
        responsavel_id   INTEGER,
        responsavel_nome VARCHAR(120) NOT NULL,
        responsavel_cpf  VARCHAR(14)  NOT NULL,
        created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
        deleted_at       TIMESTAMPTZ,
        CONSTRAINT ck_cartorios_estado CHECK (estado ~ '^[A-Z]{2}$'),
        CONSTRAINT ck_cartorios_numero CHECK (numero >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE usuarios (
        id          SERIAL PRIMARY KEY,
        nome        VARCHAR(120) NOT NULL,
        cpf         VARCHAR(14)  NOT NULL,
        email       VARCHAR(160) NOT NULL,
        password    VARCHAR(72)  NOT NULL,
        telefone    VARCHAR(20)  NOT NULL,
        endereco    VARCHAR(200) NOT NULL,
        cidade      VARCHAR(80)  NOT NULL,
        estado      CHAR(2)      NOT NULL,
        cep         VARCHAR(9)   NOT NULL,
        cartorio_id INTEGER,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ,
        CONSTRAINT fk_usuarios_cartorio FOREIGN KEY (cartorio_id)
          REFERENCES cartorios (id) ON DELETE RESTRICT,
        CONSTRAINT ck_usuarios_estado CHECK (estado ~ '^[A-Z]{2}$')
      )
    `);

    await queryRunner.query(`
      CREATE TABLE imoveis (
        id               SERIAL PRIMARY KEY,
        matricula        VARCHAR(40)    NOT NULL,
        tipo             VARCHAR(20)    NOT NULL,
        logradouro       VARCHAR(160)   NOT NULL,
        numero           INTEGER        NOT NULL,
        bairro           VARCHAR(80)    NOT NULL,
        cidade           VARCHAR(80)    NOT NULL,
        estado           CHAR(2)        NOT NULL,
        cep              VARCHAR(9)     NOT NULL,
        area_total       NUMERIC(12,2)  NOT NULL,
        valor_avaliado   NUMERIC(14,2)  NOT NULL,
        status           VARCHAR(20)    NOT NULL DEFAULT 'regular',
        proprietario_id  INTEGER,
        proprietario_nome VARCHAR(120)  NOT NULL,
        proprietario_cpf VARCHAR(14)    NOT NULL,
        cartorio_id      INTEGER        NOT NULL,
        created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
        deleted_at       TIMESTAMPTZ,
        CONSTRAINT fk_imoveis_cartorio FOREIGN KEY (cartorio_id)
          REFERENCES cartorios (id) ON DELETE RESTRICT,
        CONSTRAINT ck_imoveis_estado CHECK (estado ~ '^[A-Z]{2}$'),
        CONSTRAINT ck_imoveis_area CHECK (area_total > 0),
        CONSTRAINT ck_imoveis_valor CHECK (valor_avaliado >= 0),
        CONSTRAINT ck_imoveis_tipo CHECK (
          tipo IN ('casa','apartamento','terreno','sala_comercial','galpao','rural','outro')
        ),
        CONSTRAINT ck_imoveis_status CHECK (
          status IN ('regular','pendente','alienado','bloqueado','cancelado')
        )
      )
    `);

    // UNIQUEs parciais: liberam o valor para reuso quando o registro foi soft-deletado
    await queryRunner.query(
      `CREATE UNIQUE INDEX uq_cartorios_cnpj ON cartorios (cnpj) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX uq_usuarios_email ON usuarios (email) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX uq_usuarios_cpf ON usuarios (cpf) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX uq_imoveis_matricula_cartorio
         ON imoveis (matricula, cartorio_id) WHERE deleted_at IS NULL`,
    );

    // Índices de apoio às consultas mais comuns (FKs e filtros dos relatórios)
    await queryRunner.query(`CREATE INDEX idx_usuarios_cartorio ON usuarios (cartorio_id)`);
    await queryRunner.query(`CREATE INDEX idx_imoveis_cartorio ON imoveis (cartorio_id)`);
    await queryRunner.query(`CREATE INDEX idx_imoveis_tipo ON imoveis (tipo)`);
    await queryRunner.query(`CREATE INDEX idx_imoveis_status ON imoveis (status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS imoveis`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
    await queryRunner.query(`DROP TABLE IF EXISTS cartorios`);
  }
}
