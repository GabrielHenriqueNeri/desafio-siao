import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // Segurança: headers HTTP endurecidos + CORS restrito à origem do frontend
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Validação global: rejeita payloads com campos desconhecidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Serialização: garante que campos @Exclude (ex.: password) nunca vazem
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Desafio Sião — API de Cartórios e Imóveis')
    .setDescription(
      'API CRUD de cartórios, usuários e imóveis com autenticação JWT.\n\n' +
        '**Como autenticar:** crie um usuário em `POST /api/auth/register` (ou use o usuário ' +
        'do seed: `admin@siao.com.br` / `Admin@123`), faça login em `POST /api/auth/login`, ' +
        'copie o `access_token` e clique em **Authorize** aqui no Swagger.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addTag('Health', 'Diagnóstico da API e do banco')
    .addTag('Auth', 'Registro, login e perfil do usuário autenticado')
    .addTag('Cartórios', 'CRUD de cartórios')
    .addTag('Usuários', 'CRUD de usuários')
    .addTag('Imóveis', 'CRUD de imóveis')
    .addTag('Relatórios', 'Consolidados e agregações')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API no ar em http://localhost:${port}/api — docs em http://localhost:${port}/api/docs`);
}

void bootstrap();
