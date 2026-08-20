/** Dispara o download de um Blob no navegador com o nome informado. */
export function baixarArquivo(conteudo: Blob, nomeDoArquivo: string): void {
  const url = URL.createObjectURL(conteudo);
  const ancora = document.createElement('a');
  ancora.href = url;
  ancora.download = nomeDoArquivo;
  document.body.appendChild(ancora);
  ancora.click();
  ancora.remove();
  URL.revokeObjectURL(url);
}
