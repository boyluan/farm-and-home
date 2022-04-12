import BigNumber from "bignumber.js";
import { ParsedUrlQuery } from "querystring";
import { products } from "./products";

// Our API uses 'calculatePrice' to get the total price of the cookies being bought
// We need to update that to use the 'priceUsd' field (see below: Line 14)
export default function calculatePrice(query: ParsedUrlQuery): BigNumber {
  let amount = new BigNumber(0);
  for (let [id, quantity] of Object.entries(query)) {
    const product = products.find(p => p.id === id)
    if (!product) continue;

    // const price = product.priceSol {{ DEFUNCT }}
    const price = product.priceUsd
    const productQuantity = new BigNumber(quantity as string)
    amount = amount.plus(productQuantity.multipliedBy(price))
  }

  return amount
}
