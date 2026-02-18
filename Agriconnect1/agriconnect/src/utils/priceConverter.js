import axios from 'axios';

export const getEthPriceInINR = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr'
    );
    return response.data.ethereum.inr;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return null; // Fallback or handle error
  }
};