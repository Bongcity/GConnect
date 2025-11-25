/**
 * ?뱁썒 ?쒖뒪??
 * 
 * ?숆린???꾨즺 ???몃? ?쒖뒪?쒖뿉 ?뚮┝??蹂대깄?덈떎.
 */

import { prisma } from '@gconnect/db';
import { encrypt, decrypt } from './naver-api';

export interface WebhookPayload {
  event: 'sync.success' | 'sync.error';
  timestamp: string;
  data: {
    userId: string;
    shopName?: string;
    status: string;
    itemsTotal: number;
    itemsSynced: number;
    itemsFailed: number;
    duration?: number;
    error?: string;
  };
}

/**
 * ?뱁썒 ?몃━嫄?
 */
export async function triggerWebhooks(userId: string, payload: WebhookPayload) {
  try {
    // ?ъ슜?먯쓽 ?쒖꽦?붾맂 ?뱁썒 議고쉶
    const webhooks = await db.webhook.findMany({
      where: {
        userId,
        isEnabled: true,
        ...(payload.event === 'sync.success'
          ? { triggerOnSuccess: true }
          : { triggerOnError: true }),
      },
    });

    if (webhooks.length === 0) {
      console.log('?뱁썒 ?놁쓬 - ?ㅽ궢');
      return;
    }

    console.log(`?뱻 ?뱁썒 ?몃━嫄? ${webhooks.length}媛?);

    // 蹂묐젹濡?紐⑤뱺 ?뱁썒 ?ㅽ뻾
    await Promise.all(
      webhooks.map((webhook) => executeWebhook(webhook, payload))
    );
  } catch (error) {
    console.error('?뱁썒 ?몃━嫄??ㅻ쪟:', error);
  }
}

/**
 * ?뱁썒 ?ㅽ뻾
 */
async function executeWebhook(webhook: any, payload: WebhookPayload) {
  const startTime = Date.now();
  let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let errorMessage: string | null = null;

  try {
    // ?뱁썒 ??낅퀎 泥섎━
    let requestBody: string;
    let requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhook.type === 'SLACK') {
      requestBody = JSON.stringify(buildSlackPayload(payload));
    } else if (webhook.type === 'DISCORD') {
      requestBody = JSON.stringify(buildDiscordPayload(payload));
    } else {
      // CUSTOM
      requestBody = JSON.stringify(payload);
    }

    // ?몄쬆 ?ㅻ뜑 異붽?
    if (webhook.authType && webhook.authValue) {
      const authValue = decrypt(webhook.authValue);
      if (webhook.authType === 'BEARER') {
        requestHeaders['Authorization'] = `Bearer ${authValue}`;
      } else if (webhook.authType === 'BASIC') {
        requestHeaders['Authorization'] = `Basic ${authValue}`;
      }
    }

    // 而ㅼ뒪? ?ㅻ뜑 異붽?
    if (webhook.customHeaders) {
      try {
        const customHeaders = JSON.parse(webhook.customHeaders);
        requestHeaders = { ...requestHeaders, ...customHeaders };
      } catch (e) {
        console.error('而ㅼ뒪? ?ㅻ뜑 ?뚯떛 ?ㅻ쪟:', e);
      }
    }

    // HTTP ?붿껌 ?ㅽ뻾
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: requestHeaders,
      body: requestBody,
    });

    responseStatus = response.status;
    responseBody = await response.text();

    if (!response.ok) {
      status = 'FAILED';
      errorMessage = `HTTP ${response.status}: ${responseBody}`;
    }

    console.log(`???뱁썒 ?꾩넚 ?깃났: ${webhook.name}`);
  } catch (error: any) {
    status = 'FAILED';
    errorMessage = error.message;
    console.error(`???뱁썒 ?꾩넚 ?ㅽ뙣: ${webhook.name}`, error);
  }

  const responseTime = Date.now() - startTime;

  // ?뱁썒 濡쒓렇 ???
  await db.webhookLog.create({
    data: {
      webhookId: webhook.id,
      requestUrl: webhook.url,
      requestMethod: 'POST',
      requestBody: JSON.stringify(payload),
      requestHeaders: JSON.stringify(requestHeaders),
      responseStatus,
      responseBody,
      responseTime,
      status,
      errorMessage,
    },
  });

  // ?뱁썒 ?듦퀎 ?낅뜲?댄듃
  await db.webhook.update({
    where: { id: webhook.id },
    data: {
      lastTriggered: new Date(),
      lastStatus: status,
      totalTriggers: { increment: 1 },
      successTriggers: status === 'SUCCESS' ? { increment: 1 } : undefined,
      failedTriggers: status === 'FAILED' ? { increment: 1 } : undefined,
    },
  });
}

/**
 * Slack 硫붿떆吏 ?щ㎎
 */
function buildSlackPayload(payload: WebhookPayload) {
  const { event, data } = payload;
  const isSuccess = event === 'sync.success';

  const color = isSuccess ? 'good' : 'danger';
  const emoji = isSuccess ? '?? : '??;
  const title = isSuccess ? '?먮룞 ?숆린???꾨즺' : '?먮룞 ?숆린???ㅽ뙣';

  const fields = [
    {
      title: '?곸젏',
      value: data.shopName || '?????놁쓬',
      short: true,
    },
    {
      title: '?곹깭',
      value: isSuccess ? '?깃났' : '?ㅽ뙣',
      short: true,
    },
    {
      title: '珥??곹뭹',
      value: `${data.itemsTotal}媛?,
      short: true,
    },
    {
      title: '?숆린???깃났',
      value: `${data.itemsSynced}媛?,
      short: true,
    },
  ];

  if (data.itemsFailed > 0) {
    fields.push({
      title: '?숆린???ㅽ뙣',
      value: `${data.itemsFailed}媛?,
      short: true,
    });
  }

  if (data.duration) {
    fields.push({
      title: '?뚯슂 ?쒓컙',
      value: `${(data.duration / 1000).toFixed(2)}珥?,
      short: true,
    });
  }

  const attachment: any = {
    color,
    title: `${emoji} ${title}`,
    fields,
    footer: 'GConnect ?먮룞 ?숆린??,
    ts: Math.floor(Date.now() / 1000),
  };

  if (!isSuccess && data.error) {
    attachment.text = `?ㅻ쪟: ${data.error}`;
  }

  return {
    text: `${emoji} ${title}`,
    attachments: [attachment],
  };
}

/**
 * Discord 硫붿떆吏 ?щ㎎
 */
function buildDiscordPayload(payload: WebhookPayload) {
  const { event, data } = payload;
  const isSuccess = event === 'sync.success';

  const color = isSuccess ? 0x22f089 : 0xff4d4f;
  const emoji = isSuccess ? '?? : '??;
  const title = isSuccess ? '?먮룞 ?숆린???꾨즺' : '?먮룞 ?숆린???ㅽ뙣';

  const fields = [
    {
      name: '?곸젏',
      value: data.shopName || '?????놁쓬',
      inline: true,
    },
    {
      name: '?곹깭',
      value: isSuccess ? '?깃났' : '?ㅽ뙣',
      inline: true,
    },
    {
      name: '珥??곹뭹',
      value: `${data.itemsTotal}媛?,
      inline: true,
    },
    {
      name: '?숆린???깃났',
      value: `${data.itemsSynced}媛?,
      inline: true,
    },
  ];

  if (data.itemsFailed > 0) {
    fields.push({
      name: '?숆린???ㅽ뙣',
      value: `${data.itemsFailed}媛?,
      inline: true,
    });
  }

  if (data.duration) {
    fields.push({
      name: '?뚯슂 ?쒓컙',
      value: `${(data.duration / 1000).toFixed(2)}珥?,
      inline: true,
    });
  }

  const embed: any = {
    title: `${emoji} ${title}`,
    color,
    fields,
    footer: {
      text: 'GConnect ?먮룞 ?숆린??,
    },
    timestamp: new Date().toISOString(),
  };

  if (!isSuccess && data.error) {
    embed.description = `**?ㅻ쪟:** ${data.error}`;
  }

  return {
    content: `${emoji} ${title}`,
    embeds: [embed],
  };
}

/**
 * ?뱁썒 ?뚯뒪??
 */
export async function testWebhook(webhookId: string) {
  const webhook = await db.webhook.findUnique({
    where: { id: webhookId },
    include: {
      user: {
        select: {
          shopName: true,
        },
      },
    },
  });

  if (!webhook) {
    throw new Error('?뱁썒??李얠쓣 ???놁뒿?덈떎.');
  }

  // ?뚯뒪???섏씠濡쒕뱶
  const testPayload: WebhookPayload = {
    event: 'sync.success',
    timestamp: new Date().toISOString(),
    data: {
      userId: webhook.userId,
      shopName: webhook.user.shopName || '?뚯뒪???곸젏',
      status: 'SUCCESS',
      itemsTotal: 10,
      itemsSynced: 10,
      itemsFailed: 0,
      duration: 5000,
    },
  };

  await executeWebhook(webhook, testPayload);

  // 理쒓렐 濡쒓렇 議고쉶
  const log = await db.webhookLog.findFirst({
    where: { webhookId },
    orderBy: { createdAt: 'desc' },
  });

  return log;
}

