// ## 'PublicKey' is another term we use for address
import { PublicKey } from "@solana/web3.js"

// This is you SHOP wallet address
export const shopAddress = new PublicKey('FeTWpoMnseiS4TrBpsFGbhriqRyNryN6xq6cySrMxG2i')

// ##
// Following on from '../lib/calculatePrice.ts' file (see: Lines 5-6) ⬇⬇
// Now we need to get the USDC address
// Which we'll then use to make a transaction that transfers USDC from the buyer to the shop
// $USDC address (this is the same for everyone)
export const usdcAddress = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')

// This is your TOKEN/COUPON address
export const couponAddress = new PublicKey('8e3sj1hZxoeKoBZcS2xzJrc1n5VtKGLYfN7cLYgmNs4g')