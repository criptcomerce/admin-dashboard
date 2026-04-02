import { NextRequest, NextResponse } from 'next/server';

// Credenciais estáticas de admin — em produção, valide contra banco de dados
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
  }

  // Gera um token simples (em produção use jsonwebtoken)
  const token = Buffer.from(
    JSON.stringify({ username, exp: Date.now() + 86400000, secret: JWT_SECRET }),
  ).toString('base64');

  return NextResponse.json({ token, username });
}
