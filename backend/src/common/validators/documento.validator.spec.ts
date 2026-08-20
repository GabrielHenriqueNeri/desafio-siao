import { cnpjEhValido, cpfEhValido } from './documento.validator';

describe('Validação de CPF', () => {
  it('aceita CPF válido com máscara', () => {
    expect(cpfEhValido('111.444.777-35')).toBe(true);
  });

  it('aceita CPF válido sem máscara', () => {
    expect(cpfEhValido('52998224725')).toBe(true);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(cpfEhValido('111.444.777-36')).toBe(false);
  });

  it('rejeita sequência repetida (ex.: 111.111.111-11)', () => {
    expect(cpfEhValido('111.111.111-11')).toBe(false);
  });

  it('rejeita tamanho inválido', () => {
    expect(cpfEhValido('123')).toBe(false);
  });
});

describe('Validação de CNPJ', () => {
  it('aceita CNPJ válido com máscara', () => {
    expect(cnpjEhValido('11.222.333/0001-81')).toBe(true);
  });

  it('aceita CNPJ válido sem máscara', () => {
    expect(cnpjEhValido('11444777000161')).toBe(true);
  });

  it('rejeita CNPJ com dígito verificador errado', () => {
    expect(cnpjEhValido('11.222.333/0001-82')).toBe(false);
  });

  it('rejeita sequência repetida', () => {
    expect(cnpjEhValido('11.111.111/1111-11')).toBe(false);
  });

  it('rejeita tamanho inválido', () => {
    expect(cnpjEhValido('11.222.333')).toBe(false);
  });
});
