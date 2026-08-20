import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  LinhaAgrupada,
  LinhaPorCartorio,
  RelatoriosService,
  ResumoGeral,
} from './relatorios.service';

@ApiTags('Relatórios')
@ApiBearerAuth('bearer')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Totais gerais: cartórios, usuários, imóveis, valor e área' })
  resumo(): Promise<ResumoGeral> {
    return this.relatoriosService.resumo();
  }

  @Get('imoveis-por-cartorio')
  @ApiOperation({ summary: 'Imóveis, usuários e valor avaliado consolidados por cartório' })
  imoveisPorCartorio(): Promise<LinhaPorCartorio[]> {
    return this.relatoriosService.imoveisPorCartorio();
  }

  @Get('imoveis-por-tipo')
  @ApiOperation({ summary: 'Distribuição de imóveis por tipo' })
  imoveisPorTipo(): Promise<LinhaAgrupada[]> {
    return this.relatoriosService.imoveisPorTipo();
  }

  @Get('imoveis-por-status')
  @ApiOperation({ summary: 'Distribuição de imóveis por status' })
  imoveisPorStatus(): Promise<LinhaAgrupada[]> {
    return this.relatoriosService.imoveisPorStatus();
  }
}
