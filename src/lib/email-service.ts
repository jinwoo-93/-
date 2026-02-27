/**
 * 이메일 알림 서비스 (Resend)
 * 관리자 알림, 고객 문의 응답 등
 */

import { Resend } from 'resend';

// Resend는 API 키가 있을 때만 초기화 (빌드 시 오류 방지)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@jikguyeokgu.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@jikguyeokgu.com';

export interface SupportTicketEmailData {
  ticketId: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  content: string;
  orderId?: string;
  createdAt: Date;
}

/**
 * 관리자에게 새 고객 문의 알림 발송
 */
export async function notifyAdminNewTicket(
  ticketData: SupportTicketEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Resend API 키가 없으면 로그만 출력 (개발 환경)
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] RESEND_API_KEY not configured. Email not sent.');
      console.log('[Email] New support ticket:', {
        ticketId: ticketData.ticketId,
        subject: ticketData.subject,
        category: ticketData.category,
      });
      return { success: true };
    }

    const categoryLabels: Record<string, string> = {
      ORDER: '주문 문의',
      SHIPPING: '배송 문의',
      REFUND: '환불/반품',
      ACCOUNT: '계정 문의',
      TECHNICAL: '기술 지원',
      REPORT: '신고/제재',
      SUGGESTION: '제안/건의',
      OTHER: '기타',
    };

    const categoryLabel = categoryLabels[ticketData.category] || '기타';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #6B7280; }
            .value { margin-top: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6B7280; font-size: 12px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 새로운 고객 문의</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">문의 번호</div>
                <div class="value">${ticketData.ticketId}</div>
              </div>
              <div class="field">
                <div class="label">카테고리</div>
                <div class="value">${categoryLabel} (${ticketData.category})</div>
              </div>
              <div class="field">
                <div class="label">제목</div>
                <div class="value"><strong>${ticketData.subject}</strong></div>
              </div>
              <div class="field">
                <div class="label">문의자</div>
                <div class="value">
                  ${ticketData.name} (${ticketData.email})
                  ${ticketData.phone ? `<br>전화: ${ticketData.phone}` : ''}
                </div>
              </div>
              ${
                ticketData.orderId
                  ? `
              <div class="field">
                <div class="label">관련 주문</div>
                <div class="value">${ticketData.orderId}</div>
              </div>
              `
                  : ''
              }
              <div class="field">
                <div class="label">문의 내용</div>
                <div class="value" style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 6px;">${ticketData.content}</div>
              </div>
              <div class="field">
                <div class="label">접수 시간</div>
                <div class="value">${new Date(ticketData.createdAt).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</div>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://jikguyeokgu.com'}/admin/support/${ticketData.ticketId}" class="button">
                  관리자 페이지에서 확인하기
                </a>
              </div>
            </div>
            <div class="footer">
              <p>직구역구 관리자 알림 시스템</p>
              <p>이 메일은 자동으로 발송되었습니다.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!resend) {
      console.log('[Email] Resend not initialized (missing API key)');
      return { success: false, error: 'Resend not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[고객문의] ${categoryLabel} - ${ticketData.subject}`,
      html: emailHtml,
    });

    if (error) {
      console.error('[Email] Failed to send admin notification:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Admin notification sent:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 고객에게 문의 접수 확인 이메일 발송
 */
export async function sendTicketConfirmation(
  ticketData: SupportTicketEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] RESEND_API_KEY not configured. Confirmation email not sent.');
      return { success: true };
    }

    const categoryLabels: Record<string, string> = {
      ORDER: '주문 문의',
      SHIPPING: '배송 문의',
      REFUND: '환불/반품',
      ACCOUNT: '계정 문의',
      TECHNICAL: '기술 지원',
      REPORT: '신고/제재',
      SUGGESTION: '제안/건의',
      OTHER: '기타',
    };

    const categoryLabel = categoryLabels[ticketData.category] || '기타';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6B7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ 문의가 접수되었습니다</h1>
            </div>
            <div class="content">
              <p>안녕하세요, <strong>${ticketData.name}</strong>님!</p>
              <p>고객님의 문의가 정상적으로 접수되었습니다.</p>
              <p>빠른 시일 내에 답변 드리도록 하겠습니다.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p><strong>문의 번호:</strong> ${ticketData.ticketId}</p>
              <p><strong>카테고리:</strong> ${categoryLabel}</p>
              <p><strong>제목:</strong> ${ticketData.subject}</p>
              <p><strong>접수 시간:</strong> ${new Date(ticketData.createdAt).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6B7280; font-size: 14px;">
                답변은 영업일 기준 1-2일 내에 이메일로 전송됩니다.<br>
                추가 문의사항이 있으시면 언제든지 연락 주시기 바랍니다.
              </p>
            </div>
            <div class="footer">
              <p>직구역구 고객센터</p>
              <p>support@jikguyeokgu.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!resend) {
      console.log('[Email] Resend not initialized (missing API key)');
      return { success: false, error: 'Resend not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ticketData.email,
      subject: `[직구역구] 문의가 접수되었습니다 - ${ticketData.subject}`,
      html: emailHtml,
    });

    if (error) {
      console.error('[Email] Failed to send confirmation:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Confirmation sent:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
