export const paywayPaymentService = {
  get: async (orderId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/payway-payment?order_id=${orderId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get PayWay payment");
    }

    return await response.json();
  },

  fail: async (orderId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/payway-payment/fail/${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fail PayWay payment");
    }

    return await response.json();
  },

   status: async (orderId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/payway-payment/status/${orderId}`
    );

    if (!response.ok) {
      throw new Error("Failed to check payment status");
    }

    return await response.json();
  },
};
