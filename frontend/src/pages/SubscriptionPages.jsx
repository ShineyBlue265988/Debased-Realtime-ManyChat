import { useState, useEffect } from 'react';
import { ethers } from "ethers";  // Use ethers for contract interaction
import { Check, LockKeyhole } from 'lucide-react';
import { useDynamicContext, DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { getWeb3Provider, getSigner } from '@dynamic-labs/ethers-v6';
import { useDispatch } from 'react-redux';
import { setSubscriptionEndDate } from '../store/authSlice';

// Add this helper function at the top of your component
const formatSubscriptionDate = (timestamp) => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

};

const SubscriptionPages = (address) => {
  const { primaryWallet } = useDynamicContext();
  const [selectedDuration, setSelectedDuration] = useState('1 Month');
  const CONTRACT_ADDRESS = "0xb557Fa65aF0f482E34799eFA76176B269Cd88c40";
  const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"}],"name":"FeePaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"feeType","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Withdraw","type":"event"},{"inputs":[],"name":"ONE_MONTH_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getETHPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"isHavingSubscription","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_feeType","type":"uint256"}],"name":"payFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"subscriptionEndDate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_feeType","type":"uint256"},{"internalType":"uint256","name":"_target","type":"uint256"}],"name":"updateFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFee","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const dispatch = useDispatch();

  const durationPrices = {
    '1 Month': '2',
    '3 Months': '5',
    '6 Months': '10',
    'Yearly': '20'
  };
  const originalPrices = {
    '1 Month': '2',
    '3 Months': '6',
    '6 Months': '12',
    'Yearly': '24'
  };
  const durationPremiumPrices = {
    '1 Month': '4',
    '3 Months': '10',
    '6 Months': '20',
    'Yearly': '40'
  };
  const originalPremiumPrices = {
    '1 Month': '4',
    '3 Months': '12',
    '6 Months': '24',
    'Yearly': '48'
  };
  const calculateDiscount = (original, discounted) => {
    const discount = ((original - discounted) / original) * 100;
    return Math.round(discount);
  };
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const checkSubscription = async () => {
      if (primaryWallet) {
        const provider = await getWeb3Provider(primaryWallet);
        const signer = await getSigner(primaryWallet);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const endDate = await contract.subscriptionEndDate(address);
        if (endDate > 0) {
          setSubscriptionEndDate(formatSubscriptionDate(endDate));
        }
      }
    };
    checkSubscription();
  }, [primaryWallet]);

  const standardFeatures = [
    "Access to chat",
    "Basic support",
    "ENS Support",
    "500 history messages",
  ];

  const premiumFeatures = [
    "Everything in Standard",
    "Priority support",
    "Custom features",
    "Early access features"
  ];
  // Define the handleSubscribe function
  const handleSubscribe = async (plan) => {
    setIsLoading(true);
    try {
      // Map plan durations to contract fee types
      const feeTypeMap = {
        "1 Month": 1,
        "3 Months": 3,
        "6 Months": 6,
        "Yearly": 12,
      };

      // Check if the wallet is connected
      if (!primaryWallet) {
        alert("Please connect your wallet.");
        return;
      }

      // Get dynamic provider and signer for the connected wallet
      const provider = await getWeb3Provider(primaryWallet);
      const signer = await getSigner(primaryWallet);
      // Create a contract instance with the signer
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // console.log("Contract instance created:", contract);

      // Fetch ETH price from the contract
      const ethPrice = await contract.getETHPrice();
      // console.log("ETH price:", ethPrice.toString());

      // Calculate the required ETH based on the plan fee
      const feeType = feeTypeMap[plan.duration];
      const planFee = await contract.fee(feeType);
      const requiredEth = ethPrice * planFee;
      // Add this before the contract call
      const balance = ethers.getBigInt(await provider.getBalance(primaryWallet.address))
      const requiredAmount = ethers.getBigInt(planFee);
      if (balance < requiredAmount) {
        alert("Insufficient funds for subscription");
        return;
      }
      // Execute the payFee function
      const tx = await contract.payFee(
        primaryWallet.address,
        feeType,
        {
          value: BigInt(requiredEth), // Add the required ETH value
          gasLimit: 700000 // Add explicit gas limit
        }
      );
      // console.log("Transaction sent:", tx.hash);

      // Wait for the transaction to be mined
      await tx.wait();
      // console.log("Transaction confirmed:", tx.hash);

      // Verify if the subscription was successful
      const isSubscribed = await contract.isHavingSubscription(primaryWallet.address);

      if (isSubscribed) {
        const endDate = await contract.subscriptionEndDate(primaryWallet.address);
        const formattedDate = formatSubscriptionDate(endDate);
        setSubscriptionEndDate(formattedDate);
        alert(`Successfully subscribed! Your subscription ends on: ${formattedDate}`);
      } else {
        alert("Subscription was not successful. Please try again.");
      }


    } catch (error) {
      console.error("Subscription error:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-[92vh] bg-gray-50 w-full">
      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {subscriptionEndDate && (
          <div className="rounded-lg flex justify-end mb-2">
            <span className="text-green-700 font-medium bg-green-50 px-4 py-2">Active Until: </span>
            <span className="text-green-600 bg-green-50 px-4 py-2">{subscriptionEndDate}</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          {/* Duration Selector */}
          <div className="mb-12 flex flex-wrap gap-3 bg-gray-100 p-3 rounded-lg w-full max-w-md">
            {Object.keys(durationPrices).map((duration) => (
              <button
                key={duration}
                className={`flex-1 min-w-[45%] md:min-w-[80px] px-3 py-3 rounded-md transition-colors ${selectedDuration === duration
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                onClick={() => setSelectedDuration(duration)}
              >
                {duration}
              </button>
            ))}
          </div>

          {/* Subscription Cards */}
          <div className="flex justify-center">
            {/* Standard Card */}
            <div className="w-full lg:w-[500px] sm:w-[400px] md:max-w-[400px] p-8 rounded-xl relative group bg-white hover:scale-105 hover:border-2 hover:border-blue-200 transition-all duration-300 text-black shadow-sm">
              <h2 className="text-3xl font-bold text-black">Standard</h2>
              <div className="mt-6">
                {selectedDuration !== '1 Month' && (
                  <>
                    <span className="text-xl line-through text-black mr-2">
                      ${originalPrices[selectedDuration]}
                    </span>
                    <div className="absolute -top-3 -right-3 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold transform rotate-12 shadow-lg">
                      {`${calculateDiscount(originalPrices[selectedDuration], durationPrices[selectedDuration])}% OFF`}
                    </div>
                  </>
                )}
                <span className="text-5xl font-bold">${durationPrices[selectedDuration]}</span>
                <span className="text-black text-xl ml-2">/{selectedDuration.toLowerCase()}</span>
              </div>
              <ul className="mt-8 space-y-4">
                {standardFeatures.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-6 w-6 text-green-500 mr-3" />
                    <span className="text-black text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full mt-10 px-6 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => handleSubscribe({
                  duration: selectedDuration,
                  price: durationPrices[selectedDuration]
                })}
              >
                Subscribe Now
              </button>
            </div>
            {/* Premium Card */}
            {/* Add your Premium card code here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPages;