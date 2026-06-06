import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const ADMINS_FILE = path.join(process.cwd(), 'data', 'admins.json');
const MAIN_ADMIN_USERNAME = "admin";
const MAIN_ADMIN_PASSWORD = "admin123";

function readAdmins() {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading admins:', error);
  }
  return [];
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const cookieStore = await cookies();

    // Check main admin
    if (username === MAIN_ADMIN_USERNAME && password === MAIN_ADMIN_PASSWORD) {
      cookieStore.set('authenticated', 'true', { 
        maxAge: 86400,
        path: '/',
        sameSite: 'lax'
      });
      cookieStore.set('admin_role', 'main-admin', { 
        maxAge: 86400,
        path: '/',
        sameSite: 'lax'
      });
      cookieStore.set('admin_user', username, { 
        maxAge: 86400,
        path: '/',
        sameSite: 'lax'
      });

      return Response.json(
        { success: true, authenticated: true, role: 'main-admin', username, message: 'লগইন সফল' },
        { status: 200 }
      );
    }

    // Check sub-admins
    const admins = readAdmins();
    const admin = admins.find(a => a.username === username && a.password === password);

    if (admin) {
      cookieStore.set('authenticated', 'true', { 
        maxAge: 86400,
        path: '/',
        sameSite: 'lax'
      });
      cookieStore.set('admin_role', admin.role, { 
        maxAge: 86400,
        path: '/',
        sameSite: 'lax'
      });
      cookieStore.set('admin_user', admin.username, { 
        maxAge: 86400,
        path: '/',
        sameSite: 'lax'
      });

      return Response.json(
        { success: true, authenticated: true, role: admin.role, username: admin.username, message: 'লগইন সফল' },
        { status: 200 }
      );
    }

    return Response.json({ success: false, message: 'আপনার অ্যাকাউন্ট নেই' }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

