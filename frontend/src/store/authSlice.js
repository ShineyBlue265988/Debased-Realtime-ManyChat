import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { getWeb3Provider, getSigner } from '@dynamic-labs/ethers-v6';
import { Identity, getName } from '@coinbase/onchainkit/identity';
import { base, baseSepolia } from 'viem/chains';
const CONTRACT_ADDRESS = "0xb557Fa65aF0f482E34799eFA76176B269Cd88c40";
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"}],"name":"FeePaid","type":"event"},
{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"feeType","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"FeeUpdated","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
{"anonymous":false,"inputs":[],"name":"Withdraw","type":"event"},
{"inputs":[],"name":"ONE_MONTH_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"getETHPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"isHavingSubscription","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_feeType","type":"uint256"}],"name":"payFee","outputs":[],"stateMutability":"payable","type":"function"},
{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"subscriptionEndDate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"uint256","name":"_feeType","type":"uint256"},{"internalType":"uint256","name":"_target","type":"uint256"}],"name":"updateFee","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[],"name":"withdrawFee","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]

export const getSubscriptionState = createAsyncThunk(
  'auth/getSubscriptionState',
  async (wallet) => {
    if (!wallet) return null;

    const provider = await getWeb3Provider(wallet);
    const signer = await getSigner(wallet);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    try {
      const isSubscribed = await contract.isHavingSubscription(wallet.address);
      if (!isSubscribed) {
        return {
          isSubscribed: false,
          endDate: null
        };
      }
      const endDate = await contract.subscriptionEndDate(wallet.address);

      return {
        isSubscribed,
        endDate: endDate > 0 ? new Date(Number(endDate) * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : null
      };
    } catch (error) {
      console.error('Error fetching subscription state:', error);
      throw error;
    }
  }
);
export const fetchUserName = createAsyncThunk(
  'auth/fetchUserName',
  async (wallet) => {
    if (!wallet) return null;
    const address = wallet.address;
    try {
      const username = await getName({ address, chain: base });
      // console.log("username", username);
      if (username) {
        return username;
      } else {
        return address.slice(0, 7);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      return address.slice(0, 7);
    }
  }
);
export const fetchPublicKey = createAsyncThunk(
  'auth/fetchPublicKey',
  async (wallet) => {
    if (!wallet) return null;

    const provider = await getWeb3Provider(wallet);
    const publicKey = wallet.publicKey;

    // console.log("publicKey", publicKey)
    return publicKey;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    walletAddress: null,
    username: null,
    subscriptionEndDate: null,
    isSubscribed: false,
    loading: false,
    error: null,
    publicKey: null
  },
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = true;
      state.walletAddress = action.payload.address;
    },
    setPublicKey: (state, action) => {
      state.publicKey = action.payload;
    },
    setUserName: (state, action) => {
      state.username = action.payload;
    },
    setSubscriptionEndDate: (state, action) => {
      state.subscriptionEndDate = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.walletAddress = null;
      state.username = null;
      state.subscriptionEndDate = null;
      state.isSubscribed = false;
      state.publicKey = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptionState.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionState.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isSubscribed = action.payload.isSubscribed;
          state.subscriptionEndDate = action.payload.endDate;
        }
      })
      .addCase(getSubscriptionState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserName.fulfilled, (state, action) => {
        state.username = action.payload;
      });
  }
});

export const { setAuth, setUserName, setSubscriptionEndDate, logout } = authSlice.actions;
export default authSlice.reducer;
