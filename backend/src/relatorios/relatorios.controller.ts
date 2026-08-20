import { Controller, Get, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
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

  @Get('exportar/imoveis')
  @ApiOperation({ summary: 'Exporta o acervo de imóveis em CSV (download)' })
  @ApiProduces('text/csv')
  async exportarImoveis(@Res() res: Response): Promise<void> {
    const csv = await this.relatoriosService.exportarImoveisCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="imoveis.csv"');
    // BOM U+FEFF para o Excel reconhecer UTF-8 (acentos corretos)
    const BOM = String.fromCharCode(0xfeff);
    res.send(BOM + csv);
  }
}
