import { cookies } from 'next/headers';

export async function POST(request) {
  const cookieStore = await cookies();
  
  cookieStore.delete('authenticated');
  cookieStore.delete('admin_role');
  cookieStore.delete('admin_user');

  return Response.json(
    { success: true, message: 'লগআউট সফল' },
    { status: 200 }
  );
}
