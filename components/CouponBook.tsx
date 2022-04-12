import {
    getAssociatedTokenAddress,
    getAccount,
    TokenAccountNotFoundError
} from "@solana/spl-token"

import {
    useConnection,
    useWallet
} from "@solana/wallet-adapter-react"

// ## These are hooks
// useState: allows you to keep up with local states - i.e. updates data and causes a UI update
// useEffect: is a hook that allows you to invoke a function when the component loads
import {
    useState,
    useEffect
} from "react"

import { couponAddress } from "../lib/addresses"

export default function CouponBook() {
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const [couponBalance, setCouponBalance] = useState(0)

    // The premise here, is to fetch the account belonging to the connected user for our coupon
    async function getCouponBalance() {
        // They might not have one yet, if they haven't received any coupons
        if (!publicKey) {
            // In that case, we set their balance to 0
            setCouponBalance(0)
            return
        }

        try {
            const userCouponAddress = await getAssociatedTokenAddress(couponAddress, publicKey)
            const userCouponAccount = await getAccount(connection, userCouponAddress)
            const coupons = userCouponAccount.amount > 5 ? 5 : Number(userCouponAccount.amount)

            // If the user does have an account, then we can get its balance and display it
            console.log("balance is", coupons)
            setCouponBalance(coupons)
        } catch (e) {
            if (e instanceof TokenAccountNotFoundError) {
                // This is ok, the API will create one when they make a payment
                console.log(`User ${publicKey} doesn't have a coupon account yet!`)
                setCouponBalance(0)
            } else {
                console.error('Error getting coupon balance', e)
            }
        }
    }

    useEffect(() => {
        getCouponBalance()
    }, [publicKey])

    const notCollected = 5 - couponBalance

    return (
        <>
            <div className="font-loader flex flex-col bg-red-300 text-white rounded-md p-1 items-center">
                <p>Complete 5 orders to receive a 50% discount on your next purchase</p>

                {/*
                    The render code below, displays the coupon balance and total length as emojis
                    So if a balance is 2, then we display: 🛒 🛒 ⚪️ ⚪️ ⚪️
                */}
                <p className="flex flex-row gap-1 place-self-center">
                    {[...Array(couponBalance)].map((_, i) => <span key={i}>🛒 </span>)}
                    {[...Array(notCollected)].map((_, i) => <span key={i}>⚪️ </span>)}
                </p>
            </div>
        </>
    )
}