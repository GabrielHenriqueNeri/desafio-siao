/** As 27 unidades federativas do Brasil — fonte única para validação de estado. */
export const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const MENSAGEM_UF_INVALIDA =
  'Estado deve ser uma UF brasileira válida (ex.: PE, SP, RJ)';
