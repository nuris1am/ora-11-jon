import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    
    const authenticated = cookieStore.get('authenticated')?.value;
    const role = cookieStore.get('admin_role')?.value;
    const username = cookieStore.get('admin_user')?.value;

    if (authenticated === 'true') {
      return Response.json({ 
        authenticated: true, 
        role: role || 'sub-admin',
        username: username || 'unknown'
      });
    }

    return Response.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error('Auth check error:', error);
    return Response.json({ authenticated: false }, { status: 401 });
  }
}
