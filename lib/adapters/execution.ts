/**
 * Execution adapter interface.
 * All real execution goes through this boundary.
 * In demo mode, the mock adapter is used. In production,
 * this connects to Auth0 Token Vault and external services.
 */

import { CommerceProduct, DelegatedExecutionRequest } from "@/lib/types";

export type ExecutionResult = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
};

export interface ExecutionAdapter {
  execute: (request: DelegatedExecutionRequest) => Promise<ExecutionResult>;
  isAvailable: () => Promise<boolean>;
}

/**
 * Mock execution adapter for demo mode.
 * Simulates successful execution with realistic delay.
 */
export const mockExecutionAdapter: ExecutionAdapter = {
  execute: async (request) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      message: `Simulated ${request.actionType} on ${request.resourceId}`,
      data: {
        simulatedAt: Date.now(),
        mode: "mock",
      },
    };
  },
  isAvailable: async () => true,
};

type ExecuteCommerceProductInput = {
  userId: string;
  product: CommerceProduct;
  preferShopifyCheckout?: boolean;
};

export async function executeCommerceProduct({
  userId,
  product,
  preferShopifyCheckout = true,
}: ExecuteCommerceProductInput): Promise<ExecutionResult> {
  if (preferShopifyCheckout && product.checkoutUrl) {
    return {
      success: true,
      message: `Created a Shopify-ready cart for ${product.title}.`,
      data: {
        mode: "shopify",
        checkoutUrl: product.checkoutUrl,
        productId: product.id,
      },
    };
  }

  return mockExecutionAdapter.execute({
    userId,
    actionType: "purchase",
    resourceId: product.id,
    amount: product.price,
    metadata: {
      productTitle: product.title,
      shopId: product.shopId,
    },
  });
}
