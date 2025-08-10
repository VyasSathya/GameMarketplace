import axios, { AxiosInstance } from 'axios';

export interface LightningConfig {
  baseUrl: string;
  apiKey: string;
  network: 'mainnet' | 'testnet' | 'regtest';
}

export interface LightningInvoice {
  payment_request: string;
  payment_hash: string;
  amount_msat: number;
  description: string;
  expires_at: number;
  created_at: number;
}

export interface CreateLightningInvoiceRequest {
  amount_msat: number;
  description: string;
  expiry?: number;
  private?: boolean;
}

export class LightningClient {
  private client: AxiosInstance;
  private config: LightningConfig;

  constructor(config: LightningConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async createInvoice(request: CreateLightningInvoiceRequest): Promise<LightningInvoice> {
    try {
      const response = await this.client.post('/v1/invoices', {
        value_msat: request.amount_msat,
        memo: request.description,
        expiry: request.expiry || 3600, // 1 hour default
        private: request.private || false
      });

      return {
        payment_request: response.data.payment_request,
        payment_hash: response.data.r_hash,
        amount_msat: request.amount_msat,
        description: request.description,
        expires_at: Date.now() + (request.expiry || 3600) * 1000,
        created_at: Date.now()
      };
    } catch (error) {
      console.error('Failed to create Lightning invoice:', error);
      throw new Error('Failed to create Lightning invoice');
    }
  }

  async getInvoice(paymentHash: string): Promise<LightningInvoice | null> {
    try {
      const response = await this.client.get(`/v1/invoice/${paymentHash}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get Lightning invoice:', error);
      return null;
    }
  }

  async payInvoice(paymentRequest: string): Promise<{ payment_hash: string; payment_preimage: string }> {
    try {
      const response = await this.client.post('/v1/channels/transactions', {
        payment_request: paymentRequest
      });

      return {
        payment_hash: response.data.payment_hash,
        payment_preimage: response.data.payment_preimage
      };
    } catch (error) {
      console.error('Failed to pay Lightning invoice:', error);
      throw new Error('Failed to pay Lightning invoice');
    }
  }

  async getBalance(): Promise<{ confirmed: number; unconfirmed: number }> {
    try {
      const response = await this.client.get('/v1/balance/blockchain');
      return {
        confirmed: response.data.confirmed_balance,
        unconfirmed: response.data.unconfirmed_balance
      };
    } catch (error) {
      console.error('Failed to get Lightning balance:', error);
      throw new Error('Failed to get Lightning balance');
    }
  }

  isTestnet(): boolean {
    return this.config.network === 'testnet' || this.config.network === 'regtest';
  }
}
