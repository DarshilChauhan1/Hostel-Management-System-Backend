import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionHandling } from './common/helpers/globalCatchHandler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1')
  app.useGlobalFilters(new ExceptionHandling());
  const config = new DocumentBuilder()
    .setTitle('HMS APIS')
    .setDescription('The HMS API description')
    .setVersion('1.0')
    .addTag('hms')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
