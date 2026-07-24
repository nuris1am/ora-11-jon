import { NextResponse } from 'next/server';
import { getMembersData, saveMembersData } from '../../../lib/db';

export async function GET() {
  const members = getMembersData();
  return NextResponse.json({ success: true, members });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const members = getMembersData();

    if (body.action === 'ADD_MEMBER') {
      const newMember = {
        id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
        name: body.payload.name,
        share: Number(body.payload.share) || 1,
        address: body.payload.address || 'N/A',
        membershipType: body.payload.membershipType || 'GENERAL',
        workingLocation: body.payload.workingLocation || 'N/A',
        phone: body.payload.phone || '',
        createdAt: new Date().toISOString()
      };
      members.push(newMember);
      saveMembersData(members);
      return NextResponse.json({ success: true, member: newMember });
    }

    if (body.action === 'UPDATE_MEMBER') {
      const index = members.findIndex(m => m.id === body.payload.id);
      if (index >= 0) {
        members[index] = { ...members[index], ...body.payload, share: Number(body.payload.share) };
        saveMembersData(members);
        return NextResponse.json({ success: true, member: members[index] });
      }
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
