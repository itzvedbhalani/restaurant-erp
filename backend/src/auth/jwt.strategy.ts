import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'restaurant_erp_super_secret_key_987654321',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        staff: {
          include: { restaurant: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or session expired');
    }

    // If this user belongs to a restaurant that has been suspended by the
    // Super Admin, block access immediately — even for an already-issued
    // token. SUPER_ADMIN itself is never tied to a restaurant, so it's
    // unaffected.
    if (user.staff?.restaurant?.status === 'SUSPENDED') {
      throw new UnauthorizedException('This restaurant\'s access has been suspended. Contact support.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.name),
      restaurantId: user.staff?.restaurantId || null,
      staffId: user.staff?.id || null,
    };
  }
}
