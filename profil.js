const userDetails = document.getElementById("user-details");
const logoutButton = document.getElementById("logout-button");
const graph1 = document.getElementById("graph1");
const graph2 = document.getElementById("graph2");

// Check if the user is authenticated
function redirectToLoginIfNotAuthenticated() {
    if (!localStorage.getItem("JWT")) {
        window.location.href = "index.html";
    }
}

redirectToLoginIfNotAuthenticated();

// Fetch user data
async function fetchUserData() {
    const jwtToken = localStorage.getItem("JWT");
    try {
        const response = await fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
                query: `
                {
                    user {
                      campus,
                      login
                    }
                  
                  }`
            })
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('API response:', jsonResponse);
            const { data } = jsonResponse;

            if (data && data.user && data.user[0]) {
                const user = data.user[0];

                userDetails.innerHTML = `
                    <p>Campus : ${user.campus}</p>
                    <p>Pseudo : ${user.login}</p>
                `;

                // Fetch and display additional information and graphs
                //displayAdditionalInfo();
                //generateGraphs();
            } else {
                console.log('Unexpected data:', data);
                userDetails.textContent = "Failed to fetch user data";
            }
        } else {
            console.log('API response status:', response.status);
            console.log('API response body:', await response.text());
            userDetails.textContent = "Failed to fetch user data";
        }
    } catch (error) {
        console.log('Error:', error);
        userDetails.textContent = "An error occurred while fetching user data";
    }
}

// Fetch user data on page load
fetchUserData();

//Recuperation audit

// Fetch audits data
async function fetchAuditsData() {
    const query = `
    {
        user {
          id
          lastName
          login
          audits(order_by: {createdAt: asc}, where: {grade: {_is_null: false}}) {
            id
            grade
            createdAt
          }
        }
      }
    `;
  
    const jwtToken = localStorage.getItem("JWT");
    const response = await fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ query }),
    });
  
    const data = await response.json();
    return data;
  }
  


  async function createChart() {
    const data = await fetchAuditsData();
    
    if (!data.data || !data.data.user || data.data.user.length === 0) {
      console.error('No user data found');
      return;
    }
  
    const audits = data.data.user[0].audits;
const labels = audits.map(audit => new Date(audit.createdAt).toLocaleDateString());
const grades = audits.map(audit => audit.grade);
const customLabels = grades.map(ratio => {
  if (ratio < 1) {
    return 'red';
  } else if (ratio >= 1 && ratio < 2) {
    return 'Évolution ratio audits (Jaune)';
  } else if (ratio >= 2) {
    return 'Évolution ratio audits (Vert)';
  }
});

const ctx = document.getElementById('gradeChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels /*: ['red','yellow','green'] */,
    datasets: [
      {
        label:'RATIO EVOLUTION',
        data: grades,
        backgroundColor: function(context) {
          const ratio = context.dataset.data[context.dataIndex];
          if (ratio < 1) {
            return 'red';
          } else if (ratio >= 1 && ratio < 1.5) {
            return 'yellow';
          } else if (ratio >= 1.5) {
            return 'green';
          }
        },
        /* borderColor: 'rgba(75, 192, 192, 1)', */
        borderWidth: 1,
        tension: 0.4,
        pointRadius: 8,
        pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointBorderColor: 'rgba(75, 192, 192, 1)',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
      
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        
      },
    },
  },
});

}
  
  createChart();


  async function fetchTransactionData() {
    const query = `
      {
        transaction(where: {type: {_eq: xp}, path: {_ilike: "%div-01%"}}) {
          type
          path
          amount
          createdAt
          id
          object {
            name
          }
        }
      }
    `;
  
    const jwtToken = localStorage.getItem("JWT");
    const response = await fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ query }),
    });
  
    const data = await response.json();
    return data;
  }
  
  async function createTransactionChart() {
    const data = await fetchTransactionData();
  
    if (!data.data || !data.data.transaction || data.data.transaction.length === 0) {
      console.error('No transaction data found');
      return;
    }
  
    const transactions = data.data.transaction.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    let accumulatedXP = 0;
  
    const labels = transactions.map(transaction =>
      new Date(transaction.createdAt).toLocaleDateString()
    );
    const amounts = transactions.map(transaction => {
      accumulatedXP += transaction.amount;
      return accumulatedXP;
    });
  
    const ctx = document.getElementById('transactionChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'XP EVOLUTION',
            data: amounts,
            backgroundColor: 'dodgerblue',
            borderColor: 'dodgerblue',
            borderWidth: 1,
            tension: 0.4, 
            pointRadius: 4,
            pointBackgroundColor: 'rgba(255, 255, 255, 1)', 
            pointBorderColor: 'rgba(153, 102, 255, 1)',
            pointHoverRadius: 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
             pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
          
        },
        plugins: {
          legend: {
            labels: {
               color: 'rgba(255, 255, 255, 0.8)', 
            },
            labels: {
              color: 'rgba(255, 255, 255, 67)',
            
            },
          },
        },
      },
    });
  }
  
  createTransactionChart();
  
  


// Logout functionality
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("jwt");
    window.location.href = "connexion.html";
});
