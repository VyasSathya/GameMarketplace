import QRCode from 'qrcode';

/**
 * Bitcoin utility functions
 */

/**
 * Convert satoshis to BTC
 */
export function satsToBTC(sats: number): number {
  return sats / 100000000;
}

/**
 * Convert BTC to satoshis
 */
export function btcToSats(btc: number): number {
  return Math.round(btc * 100000000);
}

/**
 * Convert millisatoshis to satoshis
 */
export function msatToSats(msat: number): number {
  return Math.floor(msat / 1000);
}

/**
 * Convert satoshis to millisatoshis
 */
export function satsToMsat(sats: number): number {
  return sats * 1000;
}

/**
 * Format Bitcoin amount with proper precision
 */
export function formatBTC(btc: number, precision: number = 8): string {
  return btc.toFixed(precision);
}

/**
 * Format satoshis with thousand separators
 */
export function formatSats(sats: number): string {
  return sats.toLocaleString();
}

/**
 * Validate Bitcoin address (basic validation)
 */
export function isValidBitcoinAddress(address: string): boolean {
  // Basic Bitcoin address validation
  const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
  const testnetRegex = /^[2mn][a-km-zA-HJ-NP-Z1-9]{25,34}$|^tb1[a-z0-9]{39,59}$/;
  
  return legacyRegex.test(address) || bech32Regex.test(address) || testnetRegex.test(address);
}

/**
 * Validate Lightning Network invoice
 */
export function isValidLightningInvoice(invoice: string): boolean {
  // Basic Lightning invoice validation
  return invoice.toLowerCase().startsWith('lnbc') || invoice.toLowerCase().startsWith('lntb');
}

/**
 * Generate QR code for Bitcoin address or Lightning invoice
 */
export async function generateQRCode(data: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Parse Lightning Network invoice to extract information
 */
export function parseLightningInvoice(invoice: string): {
  network: 'mainnet' | 'testnet';
  amount?: number;
  description?: string;
  timestamp?: number;
  expiry?: number;
} | null {
  try {
    // This is a simplified parser - in production, use a proper BOLT11 decoder
    const isTestnet = invoice.toLowerCase().startsWith('lntb');
    const network = isTestnet ? 'testnet' : 'mainnet';
    
    return {
      network,
      // Additional parsing would be implemented here
    };
  } catch (error) {
    console.error('Failed to parse Lightning invoice:', error);
    return null;
  }
}

/**
 * Calculate network fee estimate for Bitcoin transaction
 */
export function estimateNetworkFee(
  inputCount: number,
  outputCount: number,
  feeRate: number // sats per vbyte
): number {
  // Simplified fee calculation
  // P2WPKH input: ~68 vbytes, P2WPKH output: ~31 vbytes, overhead: ~10 vbytes
  const estimatedSize = (inputCount * 68) + (outputCount * 31) + 10;
  return Math.ceil(estimatedSize * feeRate);
}

/**
 * Convert USD to BTC using exchange rate
 */
export function usdToBTC(usd: number, btcPrice: number): number {
  return usd / btcPrice;
}

/**
 * Convert BTC to USD using exchange rate
 */
export function btcToUSD(btc: number, btcPrice: number): number {
  return btc * btcPrice;
}

/**
 * Get current Bitcoin price (mock implementation)
 */
export async function getCurrentBTCPrice(): Promise<number> {
  // In production, this would fetch from a real API like CoinGecko
  // For development, return a mock price
  return 45000; // $45,000 per BTC
}

/**
 * Calculate Lightning Network routing fee
 */
export function calculateLightningFee(amountSats: number, baseFee: number = 1, feeRate: number = 0.001): number {
  return baseFee + Math.ceil(amountSats * feeRate);
}
