import Stripe from "stripe"

export function getStripeClient(secret: string) {
  return new Stripe(secret, {
    apiVersion: "2023-10-16",
  })
}

