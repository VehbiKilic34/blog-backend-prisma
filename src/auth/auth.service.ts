import prisma from '../prismaClient';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

interface RegisterInput {
  name: string;
  username: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

const ACCESS_TOKEN_EXPIRES_IN = '15m'; // Örnek, istersen ayarla
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export async function registerUser(data: RegisterInput) {
  const { name, username, password } = data;

  // Kullanıcı adı daha önce var mı kontrolü
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new Error('Kullanıcı adı zaten var');
  }

  const hashed_password = await argon2.hash(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      username,
      hashed_password,
      role: 'member', // Kayıt olurken herkes member olarak kaydolacak
    },
  });

  return {
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    role: newUser.role,
  };
}

export async function loginUser(data: LoginInput) {
  const { username, password } = data;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  const validPassword = await argon2.verify(user.hashed_password, password);
  if (!validPassword) {
    throw new Error('Geçersiz parola');
  }

  // Access Token üret
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  // Refresh Token üret
  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  // Refresh Token'ı veritabanına ekle (referans olarak)
  await prisma.refresh_session.create({
    data: {
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonrasına ayarla
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}

export async function refreshToken(oldRefreshToken: string) {
  try {
    const payload = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET) as { userId: number };

    // Refresh token'ın veritabanında geçerli olup olmadığını kontrol et
    const session = await prisma.refresh_session.findFirst({
      where: {
        user_id: payload.userId,
        expires_at: { gt: new Date() },
        revoked_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!session) {
      throw new Error('Refresh token geçersiz veya süresi dolmuş');
    }

    // Yeni access token ve refresh token üret
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new Error('Kullanıcı bulunamadı');

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Önceki refresh token'ı iptal et (revoked_at)
    await prisma.refresh_session.update({
      where: { id: session.id },
      data: { revoked_at: new Date() },
    });

    // Yeni refresh token'ı veritabanına kaydet
    await prisma.refresh_session.create({
      data: {
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new Error('Refresh token doğrulanamadı');
  }
}

export async function logoutUser(oldRefreshToken: string) {
  try {
    const payload = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET) as { userId: number };

    // Refresh token'ı iptal et
    await prisma.refresh_session.updateMany({
      where: {
        user_id: payload.userId,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });
  } catch (error) {
    // Token geçersiz olsa da logout başarılı sayabiliriz
  }
}
