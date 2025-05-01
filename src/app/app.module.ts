import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { ProductsModule } from 'src/products/products.module';
import { CategoryModule } from 'src/category/category.module';
import { CartModule } from 'src/cart/cart.module';
import { CouponModule } from 'src/coupon/coupon.module';
import { WishlistModule } from 'src/wishlist/wishlist.module';
import { ReviewModule } from 'src/review/review.module';
import { AddressModule } from 'src/address/address.module';
import { ValideteZipModule } from 'src/validete-zip/validete-zip.module';
import { SiteContentModule } from 'src/site-content/site-content.module';
import { ImagesModule } from 'src/images/images.module';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { PromotionHeroModule } from 'src/promotion-hero/promotion-hero.module';
import { SocialMediaModule } from 'src/social-media/social-media.module';
import { ContactInfoModule } from 'src/contact-info/contact-info.module';
import { ThemeColorModule } from 'src/theme-color/theme-color.module';
import { InstitutionalLinkModule } from 'src/institutional-link/institutional-link.module';
import { BrandsModule } from 'src/brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'files'),
      serveRoot: '/files',
    }),
    EmailVerificationModule,
    ProductsModule,
    CategoryModule,
    CartModule,
    CouponModule,
    WishlistModule,
    ReviewModule,
    AddressModule,
    ValideteZipModule,
    SiteContentModule,
    ImagesModule,
    PromotionsModule,
    PromotionHeroModule,
    SocialMediaModule,
    ContactInfoModule,
    ThemeColorModule,
    InstitutionalLinkModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
