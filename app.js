import xrpl from 'xrpl';

let wallet = null;

// Connect Wallet
document.getElementById('connect-wallet').addEventListener('click', async () => {
  const secret = prompt("Enter your XRP wallet secret:");
  if (!secret) return alert("No secret provided.");

  try {
    wallet = xrpl.Wallet.fromSeed(secret);
    updateWalletDetails();
  } catch (error) {
    alert("Invalid wallet secret.");
  }
});

// Create Wallet
document.getElementById('create-wallet').addEventListener('click', async () => {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  wallet = xrpl.Wallet.generate();
  updateWalletDetails();

  alert(`New wallet created!\nAddress: ${wallet.address}\nSecret: ${wallet.seed}`);
  client.disconnect();
});

// Fetch Balance
async function fetchBalance() {
  if (!wallet) return;

  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const response = await client.request({
    command: "account_info",
    account: wallet.address,
    ledger_index: "validated"
  });

  document.getElementById('balance').innerText = `Balance: ${xrpl.dropsToXrp(response.result.account_data.Balance)} XRP`;
  client.disconnect();
}

// Fetch Transactions
async function fetchTransactions() {
  if (!wallet) return;

  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const response = await client.request({
    command: "account_tx",
    account: wallet.address,
    ledger_index_min: -1,
    ledger_index_max: -1,
    limit: 10
  });

  const transactions = response.result.transactions;
  const transactionList = document.getElementById('transaction-list');
  transactionList.innerHTML = transactions.map(tx => `
    <tr>
      <td>${tx.tx.hash}</td>
      <td>${tx.tx.TransactionType}</td>
      <td>${xrpl.dropsToXrp(tx.tx.Amount || 0)}</td>
      <td><a href="https://xrpscan.com/tx/${tx.tx.hash}" target="_blank">View</a></td>
    </tr>
  `).join('');

  client.disconnect();
}

// Swap XRP
document.getElementById('swap-button').addEventListener('click', async () => {
  const tokenAddress = document.getElementById('token-address').value;
  const swapAmount = document.getElementById('swap-amount').value;

  if (!tokenAddress || !swapAmount) {
    return alert("Please provide token address and amount.");
  }

  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: tokenAddress,
    Amount: xrpl.xrpToDrops(swapAmount)
  });

  const signed = wallet.sign(prepared);
  const response = await client.submitAndWait(signed.tx_blob);

  document.getElementById('swap-status').innerText = `Swap ${response.resultCode === "tesSUCCESS" ? "successful" : "failed"}.`;
  client.disconnect();
});

// Update Wallet Details
function updateWalletDetails() {
  document.getElementById('wallet-details').innerText = `Address: ${wallet.address}`;
  fetchBalance();
  fetchTransactions();
}
