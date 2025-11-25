import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ?¤ì´ë²?ì»¤ë¨¸??API ?°ê²° ?ŒìŠ¤??
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?¸ì¦???„ìš”?©ë‹ˆ??' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { clientId, clientSecret } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID?€ Client Secret???…ë ¥?´ì£¼?¸ìš”.' },
        { status: 400 }
      );
    }

    // ?¤ì´ë²?ì»¤ë¨¸??API ?ŒìŠ¤???¸ì¶œ
    // ì£¼ì˜: ?¤ì œ ?¤ì´ë²?ì»¤ë¨¸??API ?”ë“œ?¬ì¸?¸ëŠ” ?¤ì´ë²?ë¬¸ì„œë¥?ì°¸ê³ ?˜ì„¸??
    // ?¬ê¸°?œëŠ” ê°„ë‹¨???¸ì¦ ?ŒìŠ¤?¸ë§Œ ?˜í–‰?©ë‹ˆ??
    
    try {
      // ?¤ì´ë²?ì»¤ë¨¸??API??OAuth 2.0???¬ìš©?©ë‹ˆ??
      // 1. Access Token ë°œê¸‰ ?ŒìŠ¤??
      const tokenResponse = await fetch('https://api.commerce.naver.com/external/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
          type: 'SELF',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        
        // ?¼ë°˜?ì¸ ?¤ë¥˜ ì²˜ë¦¬
        if (tokenResponse.status === 401) {
          return NextResponse.json(
            { error: 'Client ID ?ëŠ” Client Secret???¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤.' },
            { status: 400 }
          );
        }
        
        if (tokenResponse.status === 403) {
          return NextResponse.json(
            { error: 'API ?¬ìš© ê¶Œí•œ???†ìŠµ?ˆë‹¤. ?¤ì´ë²?ì»¤ë¨¸??API ? ì²­???¹ì¸?˜ì—ˆ?”ì? ?•ì¸?´ì£¼?¸ìš”.' },
            { status: 400 }
          );
        }

        throw new Error(errorData.message || 'API ?¸ì¶œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.');
      }

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        return NextResponse.json({
          ok: true,
          message: 'API ?°ê²° ?ŒìŠ¤?¸ì— ?±ê³µ?ˆìŠµ?ˆë‹¤!',
        });
      }

      throw new Error('Access Token??ë°›ì? ëª»í–ˆ?µë‹ˆ??');
      
    } catch (apiError: any) {
      console.error('Naver API test error:', apiError);
      
      // ?¤íŠ¸?Œí¬ ?¤ë¥˜ ??
      if (apiError.message.includes('fetch')) {
        return NextResponse.json(
          { error: '?¤ì´ë²?API ?œë²„???°ê²°?????†ìŠµ?ˆë‹¤. ?¤íŠ¸?Œí¬ ?°ê²°???•ì¸?´ì£¼?¸ìš”.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: apiError.message || 'API ?ŒìŠ¤??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API test error:', error);
    return NextResponse.json(
      { error: 'API ?°ê²° ?ŒìŠ¤??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

