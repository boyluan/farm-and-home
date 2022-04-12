import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair, Transaction } from "@solana/web3.js";
import { findTransactionSignature, FindTransactionSignatureError } from "@solana/pay";

import { useRouter } from "next/router";

// ## These are hooks
// useState: allows you to keep up with local states - i.e. updates data and causes a UI update
// useMemo: allows you to memoize expensive functions so that you can avoid calling them on every render <https://en.wikipedia.org/wiki/Memoization>
// useEffect: is a hook that allows you to invoke a function when the component loads
import { useEffect, useMemo, useState } from "react";

import BackLink from "../components/BackLink";
import Loading from "../components/Loading";
import { MakeTransactionInputData, MakeTransactionOutputData } from "./api/makeTransaction";
// import PageHeading from "../components/PageHeading";
// import calculatePrice from "../lib/calculatePrice";

export default function Checkout() {
  const router = useRouter();

  // (Ref. Line 1) above
  // We're getting the Solana connection ⬇
  const { connection } = useConnection();

  // And we're also getting 'sendTransaction' from the connected wallet (see below: Line 31)
  // That's a function that we can use to send a transaction, using the connected wallet
  // This reads the connected wallet from the home page
  // It will be 'null' if there is no connected wallet
  const { publicKey, sendTransaction } = useWallet();

  // React State to hold API response fields
  // Our API returns a transaction + a message, so we'll set these from the response when we get it
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Read the URL query (which includes our chosen products)
  // Just converting the query params to a 'URLSearchParams' object
  // This is easier to work with, than the type Next.js gives us for query params
  // Remember that the selected products are in the query params, and we need to pass them on to our API
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(router.query)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) {
          searchParams.append(key, v);
        }
      } else {
        searchParams.append(key, value);
      }
    }
  }

  // Generate the unique reference which will be used for this transaction
  // This is the reference mentioned in our API (see: Line 47 in our 'makeTransaction.ts' file)
  // We generate the reference on this page ⬇
  const reference = useMemo(() => Keypair.generate().publicKey, []);

  // And then we add it to the params that we're passing in to the API
  // We'll be able to use this to detect the transaction
  searchParams.append('reference', reference.toString());

  // Use our API to fetch the transaction for the selected items
  async function getTransaction() {
    if (!publicKey) {
      return;
    }

    const body: MakeTransactionInputData = {
      account: publicKey.toString(),
    }

    // Using the 'getTransaction()' function (see above: Line 65) ⬇
    // We're making an API call to '/api/makeTransaction'
    // And passing it our query params + the account body (see below: Line 82)
    const response = await fetch(`/api/makeTransaction?${searchParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    })

    const json = await response.json() as MakeTransactionOutputData

    if (response.status !== 200) {
      console.error(json);
      return;
    }

    // We then decode the response from base64
    // And de-serialize the transaction from the response ⬇
    // i.e. de-serialize it back into a 'Transaction' object (see below: Line 96)
    const transaction = Transaction.from(Buffer.from(json.transaction, 'base64'));
    setTransaction(transaction);
    setMessage(json.message);
    console.log(transaction);
  }

  useEffect(() => {
    getTransaction()
  }, [publicKey])

  // ## Notes
  // After the 'getTransaction' function and useEffect hook, we need to add another function and hook

  // Send the fetched transaction to the connected wallet
  async function trySendTransaction() {
    if (!transaction) {
      return;
    }
    try {
      await sendTransaction(transaction, connection)
    } catch (e) {
      console.error(e)
    }
  }

  // ##
  // When the 'transaction' state gets updated (which we do when we call 'setTransaction')
  // We send that transaction to the user's wallet using 'sendTransaction'

  // Send the transaction once it's fetched
  useEffect(() => {
    trySendTransaction()
  }, [transaction])


  // Here, we'll add an interval that checks every 0.5s to see if the transaction is completed
  // Specifically, if there is any transaction using our reference
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Check if there is any transaction for the reference
        const signatureInfo = await findTransactionSignature(connection, reference)
        router.push('/confirmed')
        // console.log('They paid!')
      } catch (e) {
        // If there isn't any transaction using our reference (contd. below)
        // Then 'findTransactionSignature' will throw a 'FindTransactionSignatureError'
        // Which we catch and ignore
        // So now our checkout page will just keep polling in the background, to if the user has paid
        if (e instanceof FindTransactionSignatureError) {
          // No transaction found yet, ignore this error
          return;
        }
        console.error('Unknown error', e)
      }
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  // ## Note ⬇⬇
  // The call to 'findTransactionSignature' will find ANY transaction using our reference
  // Which is not secret
  // It doesn't guarantee that the correct transaction has been made


  // First, we account for instances where there isn't a publicKey (contd. below)
  // Since we can't create a transaction without one -- we just show the wallet connect button
  // And let the site user that they'll need to connect
  if (!publicKey) {
    return (
      <div className='font-loader flex flex-col gap-8 items-center'>
        <div><BackLink href='/'>Cancel</BackLink></div>

        <WalletMultiButton />

        <p>Connect your wallet to make transactions ⚠️</p>
      </div>
    )
  }

  // const amount = calculatePrice(router.query)

  // Otherwise we show a little LOADING indicator while we fetch the transaction (see below: Line 193)
  // Once we have it, we show the message returned by the API
  return (
    <div className="font-loader flex flex-col gap-8 items-center">
      <BackLink href="/">Cancel</BackLink>

      <WalletMultiButton />

      {/* ##
			    // The question mark operator ? takes three operands (contd. below):
			    // 1) some condition 2) a value if that condition is TRUE 3) and a value if that condition is FALSE
			    // It is used in JavaScript to shorten an if else statement to one line of code. */}
      {message ?
        <p>{message} Please approve the transaction using your wallet</p> :
        <p>Creating transaction... <Loading /></p>
      }

      {/* <PageHeading>Checkout {amount.toString()} SOL</PageHeading> */}
    </div>
  )
}
