import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator';

/**
 * Diagnóstico rápido do ambiente: confirma que a API está de pé E que o
 * banco responde. Público de propósito — é o primeiro lugar para olhar
 * quando o frontend reportar "API indisponível".
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verifica se a API e o banco de dados estão no ar' })
  @ApiResponse({ status: 200, description: 'API e banco operacionais' })
  @ApiResponse({ status: 503, description: 'API de pé, mas sem conexão com o banco' })
  async verificar(): Promise<{ status: string; banco: string; timestamp: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        banco: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'degradado',
        banco: 'sem conexão',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
