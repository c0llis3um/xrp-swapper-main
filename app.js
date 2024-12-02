const API_URL = 'https://s.altnet.rippletest.net:51234'; // Replace with appropriate API
let transactions = [];
let currentPage = 1;
const pageSize = 10;

// DOM elements
const tableBody = document.querySelector("#transactions-table tbody");
const pageInfo = document.querySelector("#page-info");
const prevPageBtn = document.querySelector("#prev-page");
const nextPageBtn = document.querySelector("#next-page");

async function fetchTransactions() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    transactions = data.transactions; // Adjust based on API response
    renderTable();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    tableBody.innerHTML = `<tr><td colspan="4">Error loading data.</td></tr>`;
  }
}

function renderTable() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageTransactions = transactions.slice(start, end);

  tableBody.innerHTML = pageTransactions
    .map(tx => `
      <tr>
        <td>${tx.hash}</td>
        <td>${tx.account}</td>
        <td>${(tx.amount / 1_000_000).toFixed(6)}</td> <!-- Assuming drops -->
        <td>${new Date(tx.date).toLocaleString()}</td>
      </tr>
    `)
    .join('');

  pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(transactions.length / pageSize)}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === Math.ceil(transactions.length / pageSize);
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < Math.ceil(transactions.length / pageSize)) {
    currentPage++;
    renderTable();
  }
});

// Refresh data every minute
setInterval(fetchTransactions, 60 * 1000);

// Initial fetch
fetchTransactions();
