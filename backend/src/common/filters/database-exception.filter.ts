import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/** Códigos de erro do PostgreSQL que têm tradução clara para o cliente. */
const TRADUCAO: Record<string, { status: number; mensagem: string }> = {
  '23505': {
    status: HttpStatus.CONFLICT,
    mensagem: 'Já existe um cadastro com esses dados',
  },
  '23503': {
    status: HttpStatus.CONFLICT,
    mensagem: 'Operação bloqueada: existem registros vinculados',
  },
  '23502': {
    status: HttpStatus.BAD_REQUEST,
    mensagem: 'Campo obrigatório não informado',
  },
  '23514': {
    status: HttpStatus.BAD_REQUEST,
    mensagem: 'Dados fora das regras do cadastro',
  },
};

/**
 * Rede de segurança para erros do banco: as regras já são validadas em DTO e
 * service, mas uma condição de corrida (dois cadastros simultâneos com o mesmo
 * documento, por exemplo) ainda pode esbarrar numa constraint. Aqui isso vira
 * um código HTTP semântico — e o detalhe técnico fica no log do servidor, nunca
 * na resposta, para não expor a estrutura do banco.
 */
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(excecao: QueryFailedError, host: ArgumentsHost): void {
    const resposta = host.switchToHttp().getResponse<Response>();
    const codigo = (excecao as QueryFailedError & { code?: string }).code;

    this.logger.error(`Erro do banco (${codigo ?? 'sem código'}): ${excecao.message}`);

    const traduzido = TRADUCAO[codigo ?? ''] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      mensagem: 'Não foi possível concluir a operação no banco de dados',
    };

    resposta.status(traduzido.status).json({
      statusCode: traduzido.status,
      message: traduzido.mensagem,
    });
  }
}
