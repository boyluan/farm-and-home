import {
    createQR,
    encodeURL,
    EncodeURLComponents,
    findTransactionSignature,
    FindTransactionSignatureError,
    validateTransactionSignature,
    ValidateTransactionSignatureError
} from "@solana/pay"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import {
    clusterApiUrl,
    Connection,
    Keypair
} from "@solana/web3.js";

import BigNumber from "bignumber.js";
import { time } from "console";

import { useRouter } from "next/router";

// ## These are hooks
// useEffect: is a hook that allows you to invoke a function when the component loads
// useMemo: allows you to memoize expensive functions so that you can avoid calling them on every render <https://en.wikipedia.org/wiki/Memoization>
// useRef: a built-in React hook that accepts one argument as the initial value and returns a reference (aka ref) ⬇⬇
// See: <https://blog.logrocket.com/usestate-vs-useref/>
import {
    useEffect,
    useMemo,
    useRef
} from "react";

import BackLink from "../../components/BackLink";
import PageHeading from "../../components/PageHeading";

import {
    shopAddress,
    usdcAddress
} from "../../lib/addresses";

import calculatePrice from "../../lib/calculatePrice";

export default function Checkout() {
    const router = useRouter()

    // Reference to a <div> where we'll show the QR code
    const qrRef = useRef<HTMLDivElement>(null)

    const amount = useMemo(() => calculatePrice(router.query), [router.query])

    // Unique address that we can listen for payments to
    // The reference is exactly the same as what we saw on the e-commerce checkout page
    // We'll use it for our Shop, as it serves the same purpose: to listen for our transaction
    const reference = useMemo(() => Keypair.generate().publicKey, [])

    // Get a connection to Solana devnet
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)

    // Solana Pay transfer params
    // At a high level, we generate a QR code that encodes a URL (see below: Lines 67-84)
    // The url starts 'solana: ...' and that's followed by the recipient's public key (our shop)
    // 'EncodeURLComponents' is provided by Solana Pay, and gives us a type to define the parameters
    const urlParams: EncodeURLComponents = {
        recipient: shopAddress,
        // Then there are optional params
        // These parameters define the transaction we want to create ⬇
        // The buyer should pay x-amount of $USDC to the shop
        splToken: usdcAddress,
        amount,
        reference,
        // It also includes some display parameters, like 'label' and 'message'
        // Which the buyer's mobile wallet should display, to help them understand the transaction
        label: "Farm+Home",
        message: "Thanks for your order! 🛒",
    }

    // Encode the params into the format shown
    // 'encodeURL' encodes these parameters into the 'solana: ...' URL format
    const url = encodeURL(urlParams)
    console.log({ url })

    // ## Note
    // If you want to charge in $SOL with Solana Pay (contd. below)
    // Just remove 'splToken' from 'EncodeURLComponents'
    // It's an optional field, and if its missing then everything will use $SOL


    // Show the QR code
    // We then convert that URL into a QR code
    // To display it, we have to append the QR code to an element
    // We use a React.js 'ref' to hold that element (see also: Line 194 below)
    useEffect(() => {
        const qr = createQR(url, 512, 'transparent')
        if (qrRef.current && amount.isGreaterThan(0)) {
            qrRef.current.innerHTML = ''
            qr.append(qrRef.current)
        }
    })

    // Here, we'll add an interval that checks every 0.5s to see if the transaction is completed
    // Specifically, if there is any transaction using our reference (see: 'pages/shop/confirmed.tsx')
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Check if there is any transaction for the reference
                const signatureInfo = await findTransactionSignature(
                    connection,
                    reference,
                    {},
                    // Solana transactions are very quickly confirmed ⬇
                    // But take a little longer (up to a few seconds) to get finalized
                    // So if you're dealing with really big transactions, you might prefer to use 'finalized'
                    // But 'confirmed' us usually enough
                    'confirmed'
                )

                // Validate that the transaction has the expected recipient, amount, and SPL token
                // 'validateTransactionSignature' will fetch the transactions that 'findTransactionSignature' identified
                // And it will check that it matches the parameters we expect
                // If it did not pay us, or it paid us the incorrect amount ⬇
                // Then it won't validate, and will not display the confirmed page
                await validateTransactionSignature(
                    connection,
                    signatureInfo.signature,
                    shopAddress,
                    amount,
                    usdcAddress,
                    reference,
                    // Ref. to notes above, in lines: 114-117
                    'confirmed'
                )
                router.push('/shop/confirmed')
            } catch (e) {
                if (e instanceof FindTransactionSignatureError) {
                    // No transaction found yet, ignore this error
                    return;
                }
                if (e instanceof ValidateTransactionSignatureError) {
                    // Transaction is invalid
                    console.error('Transaction is invalid', e)
                    return;
                }
                console.error('Unknown error', e)
            }
        }, 500)
        return () => {
            clearInterval(interval)
        }
    }, [])

    // ## Notes ⬇⬇
    // The wallet makes 2 requests to our URL (contd. below)
    // i) In the first request, it sends a GET request, and we can return some data identifying ourselves.
    // The wallet can display this to the user, so they understand who they’re transacting with.
    // ii) In the second it sends a POST request with the public key of the buyer, and we return our transaction and message.
    // See: <https://i.imgur.com/fWVlKks.png>

    // ##
    // An important and powerful feature here, is that the 'account' is sent to our API when the transaction is requested
    // We can do things like ⬇
    // 1) Look at the user/buyer’s balances or tokens on the blockchain
    // 2) Or their transaction history, and return a different transaction depending on who the buyer is
    // 3) Maybe we want holders of a certain NFT to get a discount?
    // 4) Maybe we want to give new customers (who have shopped elsewhere previously) some coupons?

    // NB:
    // Knowing the buyer’s wallet address (public key) gives us a huge amount of flexibility!
    // And with transaction requests, we can do all of this for IRL payments, as well as on our dApp (site)

    // ##

    // Our API already does the most complicated part of transaction requests: returning a serialized transaction
    // But we need to extend it to handle the GET requests (Ref. to '/pages/api/makeTransaction.ts' file)
    // The specification expects us to to a GET request with ⬇⬇

/*
    {
        "label": "<some label>",
        "icon": "<url of some icon>"
    }
*/

    return (
        <div className="font-loader2 flex flex-col gap-8 items-center">
            <BackLink href='/shop'>Cancel</BackLink>

            <PageHeading>Checkout ${amount.toString()}</PageHeading>

            {/* div added to display the QR code */}
            <div ref={qrRef} />
        </div>
    )
}