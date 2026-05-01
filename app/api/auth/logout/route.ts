import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
<<<<<<< HEAD
  const cookieStore = await cookies();
=======
  const cookieStore = cookies();
>>>>>>> 2df9ebff25e016119b2a497f00296378c99d034e
  cookieStore.delete('auth_token');
  
  return NextResponse.json({ success: true });
}
