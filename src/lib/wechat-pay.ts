/**
 * WeChat Pay (위챗페이) 결제 통합
 *
 * 중국 사용자를 위한 위챗페이 결제 시스템
 */

import crypto from 'crypto';

export interface WeChatPayConfig {
  appId: string;
  mchId: string; // 상점 ID
  apiKey: string; // API 키
  certPath?: string; // 인증서 경로 (환불 시 필요)
  keyPath?: string; // 개인키 경로
}

export interface WeChatPayOrder {
  orderId: string;
  amount: number; // 위안화 (분 단위, 1元 = 100分)
  description: string;
  userId: string;
  openId?: string; // 위챗 OpenID (공식계정 결제 시 필요)
  notifyUrl: string;
  tradeType: 'JSAPI' | 'NATIVE' | 'APP' | 'MWEB'; // 결제 방식
}

export interface WeChatPayResult {
  success: boolean;
  prepayId?: string;
  codeUrl?: string; // QR 코드 URL (NATIVE 타입)
  mwebUrl?: string; // H5 결제 URL (MWEB 타입)
  paySign?: string; // 결제 서명
  timestamp?: string;
  nonceStr?: string;
  packageValue?: string;
  error?: string;
}

/**
 * WeChat Pay 클래스
 */
export class WeChatPay {
  private config: WeChatPayConfig;

  constructor(config?: WeChatPayConfig) {
    this.config = config || {
      appId: process.env.WECHAT_APP_ID || '',
      mchId: process.env.WECHAT_MCH_ID || '',
      apiKey: process.env.WECHAT_API_KEY || '',
    };
  }

  /**
   * XML을 객체로 변환
   */
  private parseXML(xml: string): Record<string, string> {
    const result: Record<string, string> = {};
    const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }

    return result;
  }

  /**
   * 객체를 XML로 변환
   */
  private buildXML(obj: Record<string, any>): string {
    let xml = '<xml>';

    Object.keys(obj).forEach((key) => {
      if (obj[key] !== undefined && obj[key] !== null) {
        xml += `<${key}><![CDATA[${obj[key]}]]></${key}>`;
      }
    });

    xml += '</xml>';
    return xml;
  }

  /**
   * 서명 생성
   */
  private generateSign(params: Record<string, any>): string {
    // 파라미터를 알파벳순으로 정렬
    const sortedKeys = Object.keys(params).sort();
    const stringA = sortedKeys
      .filter((key) => params[key] !== undefined && params[key] !== '')
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const stringSignTemp = `${stringA}&key=${this.config.apiKey}`;
    const sign = crypto
      .createHash('md5')
      .update(stringSignTemp, 'utf8')
      .digest('hex')
      .toUpperCase();

    return sign;
  }

  /**
   * 서명 검증
   */
  private verifySign(params: Record<string, any>, sign: string): boolean {
    const calculatedSign = this.generateSign(params);
    return calculatedSign === sign;
  }

  /**
   * 랜덤 문자열 생성
   */
  private generateNonceStr(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 통합下单 API 호출
   */
  async createOrder(order: WeChatPayOrder): Promise<WeChatPayResult> {
    try {
      const nonceStr = this.generateNonceStr();
      const timestamp = Math.floor(Date.now() / 1000).toString();

      // 기본 파라미터
      const params: Record<string, any> = {
        appid: this.config.appId,
        mch_id: this.config.mchId,
        nonce_str: nonceStr,
        body: order.description,
        out_trade_no: order.orderId,
        total_fee: order.amount,
        spbill_create_ip: '127.0.0.1', // 실제 환경에서는 클라이언트 IP
        notify_url: order.notifyUrl,
        trade_type: order.tradeType,
      };

      // JSAPI 타입일 경우 openId 필수
      if (order.tradeType === 'JSAPI' && order.openId) {
        params.openid = order.openId;
      }

      // 서명 생성
      params.sign = this.generateSign(params);

      // XML 생성
      const xml = this.buildXML(params);

      // API 호출
      const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml,
      });

      const responseText = await response.text();
      const result = this.parseXML(responseText);

      // 결과 검증
      if (result.return_code !== 'SUCCESS') {
        return {
          success: false,
          error: result.return_msg || 'WeChat Pay API error',
        };
      }

      if (result.result_code !== 'SUCCESS') {
        return {
          success: false,
          error: result.err_code_des || 'Payment creation failed',
        };
      }

      // 결제 방식에 따라 다른 응답
      if (order.tradeType === 'NATIVE') {
        // QR 코드 결제
        return {
          success: true,
          codeUrl: result.code_url,
        };
      } else if (order.tradeType === 'MWEB') {
        // H5 결제
        return {
          success: true,
          mwebUrl: result.mweb_url,
        };
      } else if (order.tradeType === 'JSAPI') {
        // JSAPI 결제 (위챗 내부 브라우저)
        const paySign = this.generateSign({
          appId: this.config.appId,
          timeStamp: timestamp,
          nonceStr: nonceStr,
          package: `prepay_id=${result.prepay_id}`,
          signType: 'MD5',
        });

        return {
          success: true,
          prepayId: result.prepay_id,
          timestamp,
          nonceStr,
          packageValue: `prepay_id=${result.prepay_id}`,
          paySign,
        };
      }

      return {
        success: true,
        prepayId: result.prepay_id,
      };
    } catch (error) {
      console.error('WeChat Pay createOrder error:', error);
      return {
        success: false,
        error: 'Failed to create WeChat Pay order',
      };
    }
  }

  /**
   * 결제 결과 콜백 검증
   */
  async verifyCallback(xml: string): Promise<{
    success: boolean;
    orderId?: string;
    transactionId?: string;
    amount?: number;
    error?: string;
  }> {
    try {
      const data = this.parseXML(xml);

      // 서명 검증
      const sign = data.sign;
      delete data.sign;

      if (!this.verifySign(data, sign)) {
        return {
          success: false,
          error: 'Invalid signature',
        };
      }

      // 결제 성공 여부 확인
      if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
        return {
          success: false,
          error: 'Payment not successful',
        };
      }

      return {
        success: true,
        orderId: data.out_trade_no,
        transactionId: data.transaction_id,
        amount: parseInt(data.total_fee),
      };
    } catch (error) {
      console.error('WeChat Pay verifyCallback error:', error);
      return {
        success: false,
        error: 'Failed to verify callback',
      };
    }
  }

  /**
   * 결제 조회
   */
  async queryOrder(orderId: string): Promise<{
    success: boolean;
    tradeState?: string;
    error?: string;
  }> {
    try {
      const nonceStr = this.generateNonceStr();

      const params: Record<string, any> = {
        appid: this.config.appId,
        mch_id: this.config.mchId,
        out_trade_no: orderId,
        nonce_str: nonceStr,
      };

      params.sign = this.generateSign(params);

      const xml = this.buildXML(params);

      const response = await fetch('https://api.mch.weixin.qq.com/pay/orderquery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml,
      });

      const responseText = await response.text();
      const result = this.parseXML(responseText);

      if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
        return {
          success: false,
          error: 'Query failed',
        };
      }

      return {
        success: true,
        tradeState: result.trade_state,
      };
    } catch (error) {
      console.error('WeChat Pay queryOrder error:', error);
      return {
        success: false,
        error: 'Failed to query order',
      };
    }
  }
}

// 싱글톤 인스턴스
let wechatPayInstance: WeChatPay | null = null;

export function getWeChatPay(): WeChatPay {
  if (!wechatPayInstance) {
    wechatPayInstance = new WeChatPay();
  }
  return wechatPayInstance;
}
