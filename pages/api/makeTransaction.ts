// Here, we're going to create our API route
// What is an API ?? ⬇⬇
// An API (Application Programming Interface): states the rules for a communication to happen
// See: <insert link>

// ##
// We're going to use this to generate a transaction for a given checkout
// And then we'll have the frontend of our dApp, to request the user to approve the transaction

import {
    createTransferCheckedInstruction,
    getAssociatedTokenAddress,
    getMint,
    getOrCreateAssociatedTokenAccount
} from "@solana/spl-token"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import {
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    // SystemProgram,
    // LAMPORTS_PER_SOL
} from "@solana/web3.js";

import { NextApiRequest, NextApiResponse } from "next";

import { 
    couponAddress,
    shopAddress,
    usdcAddress
} from "../../lib/addresses";

import calculatePrice from "../../lib/calculatePrice";

import base58 from "bs58";

export type MakeTransactionInputData = {
    account: string,
}

type MakeTransactionGetResponse = {
    label: string,
    icon: string,
}

export type MakeTransactionOutputData = {
    transaction: string,
    message: string,
}

type ErrorOutput = {
    error: string
}

// This is our new GET function
function get(res: NextApiResponse<MakeTransactionGetResponse>) {
    res.status(200).json({
        label: "Farm+Home",
        icon: "https://i.imgur.com/j8dmEta.png",
    })
}

/* {{ DEFUNCT }} (Moved below - see: Lines 430-441)
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) */

async function post(
    req: NextApiRequest,
    res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>
) {
    try {
        // We pass the selected items in the query, calculate the expected cost
        const amount = calculatePrice(req.query)
        if (amount.toNumber() === 0) {
            res.status(400).json({ error: "Can't checkout with a value of 0" })
            return
        }
        
        // We pass the reference to use in the query
        // This is a new Solana public key that we'll generate on the checkout page
        const { reference } = req.query
        if (!reference) {
            res.status(400).json({ error: "No reference provided" })
            return
        }

        // We pass the buyer's public ket in JSON body
        const { account } = req.body as MakeTransactionInputData
        if (!account) {
            res.status(40).json({ error: "No account provided" })
            return
        }

        // We get the shop private key from .env
        // This is the same as in our 'create-coupon.js' script
        // Since we're going to be sending a coupon from the shop account ⬇
        // We're going to need to sign the transaction as the shop
        // So we use the shop's private key (which we have in .env from the script)
        // And load the shop account from it, like we did in the script
        const shopPrivateKey = process.env.SHOP_PRIVATE_KEY as string
        if (!shopPrivateKey) {
            res.status(500).json({ error: "Shop private key not available" })
        }
        const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey))

        const buyerPublicKey = new PublicKey(account)
        // const shopPublicKey = shopAddress
        const shopPublicKey = shopKeypair.publicKey

        // We initialize a connection to solana's devnet network
        const network = WalletAdapterNetwork.Devnet
        const endpoint = clusterApiUrl(network)
        const connection = new Connection(endpoint)

        // Get the buyer and seller coupon token accounts
        // Buyer 1 may not exist, so we create it (which costs $SOL)
        const buyerCouponAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            
            // Shop pays the fee to create it
            shopKeypair,

            // Which token the account is for
            couponAddress,

            // Who the token account belongs to (the buyer)
            buyerPublicKey,
        )
        
        // .then(account => account.address) {{ DEFUNCT }}

        const shopCouponAddress = await getAssociatedTokenAddress(
            couponAddress,
            shopPublicKey
        )

        // If the buyer has at least 5 coupons, they can use them and get a discount
        const buyerGetsCouponDiscount = buyerCouponAccount.amount >= 5

        // ## Notes
        // The code above (see: Lines 123-144) is similar to how we get the $USDC accounts ⬇
        // For the buyer and the seller (see: Lines 167-176)
        // The return here however, is actually an 'Account' (previously we only needed the address)
        // But now we need to check the amount, so we keep it in this form
        // But in this case, we need to account for the buyer NOT having a coupon account yet
        // Therefore, we use 'getOrCreateAssociatedTokenAccount' ⬇
        // Along with the shopKeypair acting as the payer (see above: Line 127)
        // So in our API, if the user doesn't have an account..
        // Then the shop pays to create one for them, BEFORE creating the transaction
        // We have a new variable 'buyerGetsCouponDiscount' (see: Line 144) ⬇
        // And we'll use this whenever we need to change the behaviour of our transaction

        
        // Get details (metadata) about the $USDC token
        const usdcMint = await getMint(
            connection,
            usdcAddress
        )

        // Get the buyer's $USDC token account address
        const buyerUsdcAddress = await getAssociatedTokenAddress(
            usdcAddress,
            buyerPublicKey
        )

        // Get the shop's $USDC token account address
        const shopUsdcAddress = await getAssociatedTokenAddress(
            usdcAddress,
            shopPublicKey
        )

        // ##
        // Lines 167-176 are getting the associated TOKEN ACCOUNTS for the buyer and the shop
        // When we transfer an SPL token (like USDC-dev) ⬇⬇
        // We don't do it between the buyer and shop public keys, the way we do with $SOL

        // NB: this is different to other blockchains
        // Where the smart contract will often map data directly to the address

        // In Solana, the contract itself is stateless
        // And it generates accounts that hold the data
        // In this instance: the contract is the token Program which allows exchanging tokens like $USDC

        // So when we call 'getAssociatedTokenAddress(usdcAddress, buyerPublicKey)' ⬇
        // We're getting the address of the buyer's USDC account

        // Get a recent blockhash to include in the transaction
        // A transaction should only be valid for a short time (contd. below)
        // Thus, we include the latest block seen on the network so far
        // And the transaction can be rejected if that is too old
        const { blockhash } = await (connection.getLatestBlockhash('finalized'))

        // Here, we're creating a new solana transaction
        const transaction = new Transaction({
            // We're setting 'recentBlockhash' to that block we just fetched
            recentBlockhash: blockhash,
            // We're also setting our buyer as the fee payer for the transaction
            // The buyer pays the transaction fee
            // Meaning, the buyer must sign the transaction before it's processed by the network ⬇
            // Thus giving their authority for it to go ahead
            feePayer: buyerPublicKey,
        })

        /* ## {{ DEFUNCT }}
        // Create the instruction to send $SOL from the buyer to the shop
        // A solana transaction can contain a sequence of instructions ⬇
        // And it's atomic: they either all success, or the transaction fails with no changes
        // In this case, our transaction just has one instruction: send $SOL form buyer to shop
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: buyerPublicKey,
            // Note that our store is priced in $SOL
            // But the transfer instruction expects to be given the number in lamports
            // There are 1 billion (10^9) lamports in 1 $SOL
            // But it's best to always use the constant 'LAMPORTS_PER_SOL' when converting between them
            lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
            toPubkey: shopPublicKey,
        })
        */

        // If the buyer has the coupon discount, divide the amount in $USDC by 2
        /* ##
		    // The question mark operator ? takes three operands (contd. below):
			// 1) some condition 2) a value if that condition is TRUE 3) and a value if that condition is FALSE
			// It is used in JavaScript + TypeScript to shorten an if else statement to fewer lines of code.
        */
        const amountToPay = buyerGetsCouponDiscount ? amount.dividedBy(2) : amount

        // Create the instruction to send $USDC from the buyer to the shop
        const transferInstruction = createTransferCheckedInstruction(
            // Source
            buyerUsdcAddress,

            // Mint (token address)
            usdcAddress,

            // Destination
            shopUsdcAddress,

            // Owner of source address
            // This will be the signer key ⬇
            // Because we need their authority to transfer $USDC from their USDC account
            buyerPublicKey,

            // Amount to transfer (in units of the $USDC token)
            // Instead os using lamports (the smallest unit of $SOL) like before ⬇
            // We need to use the units for the token
            // Tokens can have any number of decimals, so the safest approach is to multiple by (10 * decimals)
            // We get the number of decimals from the mint metadata that we fetched
            // amount.toNumber() * (10 ** (await usdcMint).decimals), {{ DEFUNCT }}
            // amount.toNumber() * (10 ** usdcMint.decimals),
            amountToPay.toNumber() * (10 ** usdcMint.decimals),

            // Decimals of the $USDC token
            usdcMint.decimals,

            // ## Notes
            // The amount we charge the user in the 'transferInstruction' (see above: Line 235) ⬇
            // It is now based on the 'buyerGetsCouponDiscount' (see above: Line 232)
            // If they have the coupon discount, then we charge them half as much
        )

        // Add the reference to the instruction as a key
        // This will mean this transaction is returned when we query for the reference
        transferInstruction.keys.push({
            // Each instruction has a set of keys associated with it ⬇
            // The transaction can be looked up by any of these keys
            pubkey: new PublicKey(reference),
            // Each key can be a signer (or not)
            isSigner: false,
            // And also be writeable (or not)
            isWritable: false,

            // ##
            // In our case, the 'transfer' function is creating an instruction with some default keys
            // 1) Buyer public key: is a SIGNER, because they're transferring their $SOL ⬇
            // And must give their authority.
            // Is writeable because their $SOL balance will change

            // 2) Shop public key: is WRITEABLE, because their $SOL balance will change ⬇
            // It it not a signer however, since they don't need to give authority to receive $SOL

            // ##
            // In the code above (ref. Line 273), we're adding an additional key: the 'reference'
            // Remember that this is a public key passed as input to our API ⬇
            // And is unique to the specific checkout session
            // It doesn't need to be a signer or writeable ⬇
            // And this is because it is not involved in the actual transfer of any $SOL
            // However, by adding it to our instruction, we're able to look up the transaction using that ref.
            // This will allow our checkout page to detect that a payment has been made!

            // Once we've added the extra key, we add the transfer instruction to the transaction
            // Thus out transaction now has one instruction
        })

        // Create the instruction to send the coupon from the shop to the buyer
        /* ##
		    // The question mark operator ? takes three operands (contd. below):
			// 1) some condition 2) a value if that condition is TRUE 3) and a value if that condition is FALSE
			// It is used in JavaScript + TypeScript to shorten an if else statement to fewer lines of code.
        */
        const couponInstruction = buyerGetsCouponDiscount ?
            // The coupon instruction is to send 5 coupons from the buyer to the shop
            createTransferCheckedInstruction(
                // Source account (coupons)
                buyerCouponAccount.address,

                // Token address (coupons)
                couponAddress,

                // Destination account (coupons)
                shopCouponAddress,

                // Owner of source account
                buyerPublicKey,

                // Amount to transfer
                5,

                // Decimals of the token - we know this is 0
                0,
            ) :
            // The coupon instruction is to send 1 coupon from the shop to the buyer
            createTransferCheckedInstruction(
                // Source account (coupon)
                shopCouponAddress,

                // Token address (coupon)
                couponAddress,

                // Destination account (coupon)
                buyerCouponAccount.address,

                // Owner of source account
                shopPublicKey,

                // Amount to transfer
                1,

                // Decimals of the token - we know this is 0
                0,

                // ## Notes
                // The code above (Lines 307-346) is significant ⬇⬇
                // It says: if we're applying the coupon discount, then the direction of the coupon exchange swaps
                // As such: the buyer must send us 5 coupons in exchange for the 50% discount
                // If they do not yet have enough coupons for the discount..
                // Then the shop continues to send them a single (1) coupon with each transaction

                // The code above (see: Lines 329-346) is very similar to the instruction we use ⬇
                // To send $USDC from the buyer to the shop (see: Lines 235-260)
                // But in this instance, it sends exactly 1 coupon from the shop to the buyer
                // We then add both instructions to the transaction (see: Line 372)
            )

        // Add the shop as a signer to the coupon instruction
        // If the shop is sending a coupon, it already will be signer
        // But if the buyer is sending the coupons, the shop won't be a signer automatically
        // It's useful security to have the shop sign the transaction
        couponInstruction.keys.push({
            pubkey: shopPublicKey,
            isSigner: true,
            isWritable: false,
        })

        // Add both instruction to the transaction
        transaction.add(transferInstruction, couponInstruction)

        // Sign the transaction as the shop, which is required to transfer the coupon
        // We must partial sign because the transfer instruction still requires the user
        // Since the shop is now sending a token to the user, it must sign this transaction ⬇
        // For it to be allowed to take place..
        // But this is only a partial signing, as the user will still need to sign it afterwards
        transaction.partialSign(shopKeypair)

        // We serialize the transaction and then convert to base64 to return it
        // This will allow us to return it from the API, and consume it on the /checkout page
        const serializedTransaction = transaction.serialize({
            // We weill need the buyer to sign this transaction after it's returned to them
            // Thus we must pass {requireAllSignatures} false' in (Line 388) below, when we serialize it ⬇
            // Because our transaction requires the buyer's signature, and we don't have that yet
            // We'll request it from their connected wallet on the /checkout page
            requireAllSignatures: false

            // ## Sidebar ##
            // In reality, you'd want to record this transaction in a database, as part of the API call
            // This would allow us to later validate that the paid transaction is correct
            // But for the purpose of this project, which focuses on the solana structures ⬇
            // We skip over those things in this project
        })
        const base64 = serializedTransaction.toString('base64')

        // Insert into database: reference, amount

        /* ##
		    // The question mark operator ? takes three operands (contd. below):
			// 1) some condition 2) a value if that condition is TRUE 3) and a value if that condition is FALSE
			// It is used in JvaScript + TypeScript to shorten an if else statement to fewer lines of code.
        */
        const message = buyerGetsCouponDiscount ? "50% Discount 🎉" : "Thanks for your order! 🛒"

        // Return the serialized transaction
        // The API takes as input a JSON object ( {"account": "public-key"} ) and returns ⬇
        /* ## Ref. Lines: 411 + 412
        {
            "transaction": "base-64 encoded transaction",
            "message": "Thanks for your order! 🛒"
        }
        */
        res.status(200).json({
            transaction: base64,
            message, // "Thanks for your order! 🛒",
        })
    } catch (err) {
        console.error(err);

        res.status(500).json({ error: 'error creating transaction', })
        return
    }
}

// Our 'handler' function checks the request method ⬇⬇
// And calls either GET (Line 433) or POST (Line 435)
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<MakeTransactionGetResponse | MakeTransactionOutputData | ErrorOutput>
) {
    if (req.method === "GET") {
        return get(res)
    } else if (req.method === "POST") {
        return await post(req, res)
    } else {
        return res.status(405).json({ error: "Method not allowed" })
    }
}