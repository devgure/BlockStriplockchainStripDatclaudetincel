////services/auth-service/src/services/auth.service.ts` .typescript


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RedisService } from './redis.service';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

const prisma = new PrismaClient();

export class AuthService {
  private redis: RedisService;

  constructor() {
    this.redis = new RedisService();
  }

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        name: dto.name,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        location: dto.location,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        isPremium: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Store refresh token in Redis
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Store refresh token
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET!
      ) as { userId: string };

      // Check if refresh token is valid in Redis
      const storedToken = await this.redis.getRefreshToken(decoded.userId);
      if (storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(decoded.userId);

      // Update refresh token in Redis
      await this.redis.setRefreshToken(decoded.userId, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redis.deleteRefreshToken(userId);
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRY || '15m',
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    });

    return { accessToken, refreshToken };
  }
}
