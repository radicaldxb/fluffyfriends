import Stripe from "stripe"

export function getStripeClient(secret: string) {
  return new Stripe(secret, {
    apiVersion: "2024-06-20",
  })
}

