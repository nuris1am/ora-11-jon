import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'admins.json');

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readAdmins() {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading admins:', error);
  }
  return [];
}

function writeAdmins(admins) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(admins, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing admins:', error);
  }
}

export async function GET() {
  try {
    const admins = readAdmins();
    return Response.json(admins);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, password, role } = await request.json();
    const admins = readAdmins();

    if (admins.some(a => a.username === username)) {
      return Response.json({ error: 'Username already exists' }, { status: 400 });
    }

    const newAdmin = {
      id: admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1,
      username,
      password,
      role: role || 'sub-admin',
      createdAt: new Date().toISOString(),
    };

    admins.push(newAdmin);
    writeAdmins(admins);

    return Response.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return Response.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, username, password } = await request.json();
    let admins = readAdmins();

    const index = admins.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      return Response.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Check if new username already exists (excluding current admin)
    if (username && admins.some((a, idx) => idx !== index && a.username === username)) {
      return Response.json({ error: 'Username already exists' }, { status: 400 });
    }

    if (username) admins[index].username = username;
    if (password) admins[index].password = password;

    writeAdmins(admins);
    return Response.json(admins[index]);
  } catch (error) {
    console.error('Error updating admin:', error);
    return Response.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let admins = readAdmins();

    const admin = admins.find(a => a.id === parseInt(id));
    if (!admin) {
      return Response.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (admin.role === 'main-admin') {
      return Response.json({ error: 'Cannot delete main admin' }, { status: 403 });
    }

    admins = admins.filter(a => a.id !== parseInt(id));
    writeAdmins(admins);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return Response.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}
