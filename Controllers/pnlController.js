// controllers/pnlController.js
const User = require('../Models/userModel');
const Watchlist1 = require('../Models/watchList1Model');
const Watchlist2 = require('../Models/watchList2Model');

// Fetch the user's purchased stock data
exports.getPnLData = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.stocks); // Assuming 'stocks' field holds purchased stocks
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Fetch stock price based on watchlistType
exports.getStockPrice = async (req, res) => {
  const { watchlistType, stockName } = req.params;
  try {
    let stock;
    if (watchlistType === '1') {
      stock = await Watchlist1.findOne({ name: stockName });
    } else if (watchlistType === '2') {
      stock = await Watchlist2.findOne({ name: stockName });
    }

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json({ price: stock.price });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Sell a stock and update the user's balance
exports.sellStock = async (req, res) => {
  const { userId, stockName, quantity, sellPrice } = req.body;

  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the stock in the user's stocks array
    const stockIndex = user.stocks.findIndex(stock => stock.stockName === stockName);
    if (stockIndex === -1) {
      return res.status(404).json({ message: 'Stock not found in user portfolio' });
    }

    const stock = user.stocks[stockIndex];

    // Check if the user is selling the correct or valid quantity
    if (stock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock quantity to sell' });
    }

    // Calculate invested balance for the quantity sold
    const investedBalance = stock.buyPrice * quantity;

    // Calculate the profit or loss based on the sell price
    const profitLoss = (sellPrice - stock.buyPrice) * quantity;

    // Update the user's balance with the profit or loss from selling the stock
    const updatedBalance = user.balance + profitLoss;

    // Update the stock's sellPrice before removing it (optional, in case you want to track it)
    stock.sellPrice = sellPrice;

    // Remove the stock if the entire quantity is sold, otherwise update quantity
    if (stock.quantity === quantity) {
      // Remove the stock from the user's stocks array
      user.stocks.splice(stockIndex, 1);
    } else {
      // Subtract the sold quantity from the stock's total quantity
      stock.quantity -= quantity;
      stock.investedAmount -= investedBalance; // Adjust investedAmount as well
    }

    // Update the user's balance
    user.balance = updatedBalance;

    // Save the updated user data to the database
    await user.save();

    // Respond with the updated balance
    res.json({ updatedBalance });
  } catch (error) {
    console.error('Error selling stock:', error);
    res.status(500).json({ message: 'Error selling stock', error });
  }
};


// Withdraw user's balance
exports.withdraw = async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Withdraw the balance
    user.balance -= amount;
    await user.save();

    res.json({ message: 'Withdrawal successful', remainingBalance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Error during withdrawal', error });
  }
};

// Update user's balance
exports.updateUserBalance = async (req, res) => {
  const { userId } = req.params;
  const { balance } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's balance
    user.balance = balance;
    await user.save();

    res.status(200).json({ message: 'Balance updated successfully', balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};