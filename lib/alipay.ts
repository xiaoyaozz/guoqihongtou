import crypto from 'crypto';
import axios from 'axios';

interface AlipayConfig {
  appId: string;
  privateKey: string;
  publicKey: string;
  gateway: string;
}

function rsaSign(data: string, privateKey: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data, 'utf8');
  return sign.sign(privateKey, 'base64');
}

function rsaVerify(data: string, sign: string, publicKey: string): boolean {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(data, 'utf8');
  return verify.verify(publicKey, sign, 'base64');
}

function buildQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export async function createPrecreateTrade(
  config: AlipayConfig,
  orderNo: string,
  amount: number,
  subject: string
): Promise<{ qrCode: string }> {
  const bizContent = JSON.stringify({
    out_trade_no: orderNo,
    total_amount: amount.toFixed(2),
    subject,
  });

  const params: Record<string, string> = {
    app_id: config.appId,
    method: 'alipay.trade.precreate',
    format: 'JSON',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    version: '1.0',
    biz_content: bizContent,
  };

  const queryString = buildQuery(params);
  const sign = rsaSign(queryString, config.privateKey);
  params.sign = sign;

  const response = await axios.post(config.gateway, null, { params });
  const result = response.data.alipay_trade_precreate_response;

  if (result.code !== '10000') {
    throw new Error(`支付宝错误: ${result.sub_msg || result.msg}`);
  }

  return { qrCode: result.qr_code };
}

export async function queryTrade(config: AlipayConfig, orderNo: string): Promise<{
  trade_status: string;
  trade_no: string;
}> {
  const bizContent = JSON.stringify({
    out_trade_no: orderNo,
  });

  const params: Record<string, string> = {
    app_id: config.appId,
    method: 'alipay.trade.query',
    format: 'JSON',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    version: '1.0',
    biz_content: bizContent,
  };

  const queryString = buildQuery(params);
  const sign = rsaSign(queryString, config.privateKey);
  params.sign = sign;

  const response = await axios.post(config.gateway, null, { params });
  const result = response.data.alipay_trade_query_response;

  if (result.code !== '10000') {
    throw new Error(`支付宝错误: ${result.sub_msg || result.msg}`);
  }

  return {
    trade_status: result.trade_status,
    trade_no: result.trade_no,
  };
}

export function verifyCallback(params: Record<string, string>, publicKey: string): boolean {
  const sign = params.sign;
  const signType = params.sign_type;
  
  if (signType !== 'RSA2') {
    return false;
  }

  const filteredParams: Record<string, string> = {};
  Object.keys(params).forEach(key => {
    if (key !== 'sign' && key !== 'sign_type') {
      filteredParams[key] = params[key];
    }
  });

  const queryString = buildQuery(filteredParams);
  return rsaVerify(queryString, sign, publicKey);
}

export function generateOrderNo(): string {
  const date = new Date();
  const timestamp = date.getTime().toString();
  const random = Math.random().toString().slice(2, 8);
  return `GO${timestamp}${random}`;
}
