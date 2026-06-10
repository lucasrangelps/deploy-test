import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractBearerToken } from '@/lib/auth';

const ROTAS_PROTEGIDAS = ['/api/users'];
const ROTAS_ADMIN = ['/api/users'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const precisaAutenticacao = ROTAS_PROTEGIDAS.some((rota) =>
    pathname.startsWith(rota)
  );

  if (!precisaAutenticacao) return NextResponse.next();

  const token = extractBearerToken(req.headers.get('Authorization'));
  if (!token) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);

    const precisaAdmin = ROTAS_ADMIN.some((rota) => pathname.startsWith(rota));
    if (precisaAdmin && payload.role !== 'ADMIN') {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/users/:path*'],
};