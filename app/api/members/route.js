import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'members.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read members data
function readMembers() {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading members:', error);
  }
  return [];
}

// Write members data
function writeMembers(members) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing members:', error);
  }
}

// GET - Retrieve all members
export async function GET() {
  try {
    const members = readMembers();
    return Response.json(members);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST - Add new member
export async function POST(request) {
  try {
    const newMember = await request.json();
    const members = readMembers();
    
    // Generate ID
    const id = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
    
    const member = {
      id,
      ...newMember,
      createdAt: new Date().toISOString(),
    };
    
    members.push(member);
    writeMembers(members);
    
    return Response.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return Response.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

// PUT - Update member
export async function PUT(request) {
  try {
    const { id, ...updateData } = await request.json();
    const members = readMembers();
    
    const index = members.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }
    
    members[index] = { ...members[index], ...updateData };
    writeMembers(members);
    
    return Response.json(members[index]);
  } catch (error) {
    console.error('Error updating member:', error);
    return Response.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

// DELETE - Remove member
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let members = readMembers();
    
    members = members.filter(m => m.id !== parseInt(id));
    writeMembers(members);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return Response.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
