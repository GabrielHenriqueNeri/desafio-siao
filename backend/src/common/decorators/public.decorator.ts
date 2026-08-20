import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca um endpoint como público (dispensa o JWT exigido globalmente). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
