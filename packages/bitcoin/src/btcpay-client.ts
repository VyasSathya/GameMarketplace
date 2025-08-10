import axios, { AxiosInstance } from 'axios';
import { Invoice, PaymentStatus } from '@gamemarketplace/shared';

export interface BTCPayConfig {
  baseUrl: string;
  apiKey: string;
  storeId: string;
  network: 'mainnet' | 'testnet' | 'regtest';
}

export interface CreateInvoiceRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  redirectUrl?: string;
  notificationUrl?: string;
  metadata?: Record<string, any>;
}

export interface BTCPayInvoice {
  id: string;
  storeId: string;
  amount: number;
  currency: string;
  status: string;
  checkoutLink: string;
  createdTime: string;
  expirationTime: string;
  monitoringExpiration: string;
  metadata: Record<string, any>;
  checkout: {
    speedPolicy: string;
    paymentMethods: string[];
    defaultPaymentMethod: string;
    expirationMinutes: number;
    monitoringMinutes: number;
    paymentTolerance: number;
    redirectURL: string;
    redirectAutomatically: boolean;
    requiresRefundEmail: boolean;
  };
}

export class BTCPayClient {
  private client: AxiosInstance;
  private config: BTCPayConfig;

  constructor(config: BTCPayConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `token ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async createInvoice(request: CreateInvoiceRequest): Promise<BTCPayInvoice> {
    try {
      const response = await this.client.post(
        `/api/v1/stores/${this.config.storeId}/invoices`,
        {
          amount: request.amount,
          currency: request.currency,
          orderId: request.orderId,
          itemDesc: request.description,
          redirectURL: request.redirectUrl,
          notificationURL: request.notificationUrl,
          metadata: request.metadata || {}
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to create BTCPay invoice:', error);
      throw new Error('Failed to create payment invoice');
    }
  }

  async getInvoice(invoiceId: string): Promise<BTCPayInvoice> {
    try {
      const response = await this.client.get(
        `/api/v1/stores/${this.config.storeId}/invoices/${invoiceId}`
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get BTCPay invoice:', error);
      throw new Error('Failed to retrieve payment invoice');
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<PaymentStatus> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      return this.mapBTCPayStatus(invoice.status);
    } catch (error) {
      console.error('Failed to get invoice status:', error);
      return 'failed';
    }
  }

  private mapBTCPayStatus(btcpayStatus: string): PaymentStatus {
    switch (btcpayStatus.toLowerCase()) {
      case 'new':
      case 'processing':
        return 'pending';
      case 'paid':
        return 'processing';
      case 'confirmed':
      case 'complete':
        return 'confirmed';
      case 'expired':
        return 'expired';
      case 'invalid':
        return 'failed';
      default:
        return 'pending';
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<boolean> {
    // BTCPay Server webhook validation logic
    // This would implement HMAC signature verification
    // For now, returning true for development
    return true;
  }

  getCheckoutUrl(invoiceId: string): string {
    return `${this.config.baseUrl}/invoice?id=${invoiceId}`;
  }

  isTestnet(): boolean {
    return this.config.network === 'testnet' || this.config.network === 'regtest';
  }
}
