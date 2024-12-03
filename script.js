document.addEventListener("DOMContentLoaded", () => {
    const usdInput = document.getElementById("usdInput");
    const exchangeRateEl = document.getElementById("exchangeRate");
    const convertedAmountEl = document.getElementById("convertedAmount");

    // Fetch the exchange rate when the page loads
    let exchangeRate = 0;

    const fetchExchangeRate = async () => {
        try {
            const response = await fetch(
                "https://api.exchangerate-api.com/v4/latest/USD"
            );
            const data = await response.json();
            exchangeRate = data.rates.MXN;
            exchangeRateEl.textContent = `Exchange Rate: 1 USD = ${exchangeRate.toFixed(2)} MXN`;
        } catch (error) {
            exchangeRateEl.textContent = "Error fetching exchange rate.";
            console.error("Error fetching exchange rate:", error);
        }
    };

    // Convert USD to MXN dynamically
    usdInput.addEventListener("input", () => {
        const usdAmount = parseFloat(usdInput.value);
        if (!isNaN(usdAmount)) {
            const mxnAmount = (usdAmount * exchangeRate).toFixed(2);
            convertedAmountEl.textContent = `In MXN: ${mxnAmount}`;
        } else {
            convertedAmountEl.textContent = "In MXN: --";
        }
    });

    fetchExchangeRate();
});
