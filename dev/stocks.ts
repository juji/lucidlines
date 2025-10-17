/**
 * Stock Ticker Simulator
 * Generates simulated stock price data and outputs at regular intervals
 */

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

class StockSimulator {
  private stocks: StockData[] = [];
  private tickInterval: number;
  
  constructor(tickIntervalMs: number = 1000) {
    this.tickInterval = tickIntervalMs;
    
    // Initialize with some popular tech stocks
    this.stocks = [
      { symbol: "AAPL", name: "Apple Inc.", price: 178.25, change: 0, changePercent: 0, volume: 0 },
      { symbol: "MSFT", name: "Microsoft Corp.", price: 405.15, change: 0, changePercent: 0, volume: 0 },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 145.70, change: 0, changePercent: 0, volume: 0 },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: 175.30, change: 0, changePercent: 0, volume: 0 },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: 114.18, change: 0, changePercent: 0, volume: 0 },
      { symbol: "META", name: "Meta Platforms Inc.", price: 491.35, change: 0, changePercent: 0, volume: 0 },
      { symbol: "TSLA", name: "Tesla Inc.", price: 242.70, change: 0, changePercent: 0, volume: 0 },
      { symbol: "BRK.A", name: "Berkshire Hathaway", price: 658242.00, change: 0, changePercent: 0, volume: 0 },
      { symbol: "TSM", name: "Taiwan Semiconductor", price: 150.50, change: 0, changePercent: 0, volume: 0 },
      { symbol: "V", name: "Visa Inc.", price: 275.30, change: 0, changePercent: 0, volume: 0 }
    ];
  }
  
  /**
   * Start the stock ticker simulation
   */
  start(): void {
    console.log("Stock ticker simulation started. Press Ctrl+C to stop.\n");
    
    // Initial update
    this.updateStocks();
    this.displayStocks();
    
    // Set interval for regular updates
    setInterval(() => {
      this.updateStocks();
      this.displayStocks();
    }, this.tickInterval);
  }
  
  /**
   * Update stock prices with random movements
   */
  private updateStocks(): void {
    this.stocks.forEach(stock => {
      const previousPrice = stock.price;
      
      // Generate random price movement (-2% to +2%)
      const maxMovement = previousPrice * 0.02;
      const movement = (Math.random() * maxMovement * 2) - maxMovement;
      
      // Update price with movement
      stock.price = parseFloat((previousPrice + movement).toFixed(2));
      
      // Calculate change and percent
      stock.change = parseFloat((stock.price - previousPrice).toFixed(2));
      stock.changePercent = parseFloat(((stock.change / previousPrice) * 100).toFixed(2));
      
      // Simulate volume (100 to 50,000 shares)
      stock.volume = Math.floor(Math.random() * 49900) + 100;
    });
  }
  
  /**
   * Display current stock information
   */
  private displayStocks(): void {
    // Clear console for cleaner output
    console.clear();
    
    const now = new Date().toLocaleTimeString();
    console.log(`\n===== STOCK TICKER SIMULATOR - ${now} =====\n`);
    
    // Display header
    console.log('SYMBOL\tPRICE\t\tCHANGE\t\t%CHANGE\t\tVOLUME');
    console.log('------\t-----\t\t------\t\t-------\t\t------');
    
    // Display each stock with color coding
    this.stocks.forEach(stock => {
      const priceString = stock.price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      const changeString = stock.change > 0 ? 
        `+${stock.change.toFixed(2)}` : 
        stock.change.toFixed(2);
      
      const changePercentString = stock.changePercent > 0 ? 
        `+${stock.changePercent.toFixed(2)}%` : 
        `${stock.changePercent.toFixed(2)}%`;
      
      const volumeString = stock.volume.toLocaleString();
      
      // Log the stock data
      console.log(
        `${stock.symbol}\t${priceString}\t\t${changeString}\t\t${changePercentString}\t\t${volumeString}`
      );
    });
    
    console.log('\n===========================================\n');
  }
}

// Create and start the simulator with 5 second update interval
const stockSimulator = new StockSimulator(2000);
stockSimulator.start();