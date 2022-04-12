import {
    createAssociatedTokenAccount,
    createMint,
    getAccount,
    mintToChecked
} from '@solana/spl-token'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import {
    clusterApiUrl,
    Connection,
    Keypair
} from '@solana/web3.js'

import base58 from 'bs58'

// Read .env into process.env
import 'dotenv/config'

// Initialize Solana connection
const network = WalletAdapterNetwork.Devnet
const endpoint = clusterApiUrl(network)
const connection = new Connection(endpoint)

// Initialize shop account
const shopPrivateKey = process.env.SHOP_PRIVATE_KEY
if (!shopPrivateKey) {
    throw new Error('SHOP_PRIVATE_KEY not set')
}
// Here, we're loading the Solana account from the private key that we exported from Phantom
// This will enable us to use it as a 'payer' (it creates the token)
// And also as a signer/authority (it grants permission to mint the token)
const shopAccount = Keypair.fromSecretKey(base58.decode(shopPrivateKey))

// Create the TOKEN, returns the token public key
console.log("Creating token...")
const myCouponAddress = await createMint(
    connection,

    // Payer
    shopAccount,

    // Who has permission to mint?
    shopAccount.publicKey,

    // Who has permission to freeze?
    shopAccount.publicKey,

    // Decimals (0 = whole numbers)
    0
)
console.log("Token created:", myCouponAddress.toString())

// Create the associated TOKEN ACCOUNT for the shop
console.log("Creating token account for the shop...")
const shopCouponAddress = await createAssociatedTokenAccount(
    connection,

    // Payer
    shopAccount,

    // Token
    myCouponAddress,

    // Who to create an account for
    shopAccount.publicKey,
)
console.log("Token account created:", shopCouponAddress.toString())

// Mint 1 million coupons to the TOKEN ACCOUNT for the shop
console.log("Minting 1 million coupons to the shop account...")
await mintToChecked(
    connection,

    // Payer
    shopAccount,

    // Token
    myCouponAddress,

    // Recipient
    shopCouponAddress,

    // Authority to mint
    shopAccount,

    // Amount
    1_000_000,

    // Decimals
    0,
)
console.log("Minted 1 mill;ion coupons to the shop account")

const { amount } = await getAccount(connection, shopCouponAddress)
console.log({
    myCouponAddress: myCouponAddress.toString(),
    balance: amount.toLocaleString(),
})