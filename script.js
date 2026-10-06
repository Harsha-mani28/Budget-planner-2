```javascript
document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // VARIABLES
    // =========================================

    let transactions =
        JSON.parse(localStorage.getItem("transactions")) || [];

    let monthlyBudget =
        Number(localStorage.getItem("monthlyBudget")) || 0;

    let totalIncome = 0;

    let totalExpense = 0;

    let expenseChart = null;


    // =========================================
    // EXPENSE CATEGORIES
    // =========================================

    let expenses = {
        Food: 0,
        Transport: 0,
        Shopping: 0,
        Education: 0,
        Entertainment: 0,
        Other: 0
    };


    // =========================================
    // HTML ELEMENTS
    // =========================================

    const description =
        document.getElementById("description");

    const amount =
        document.getElementById("amount");

    const type =
        document.getElementById("type");

    const category =
        document.getElementById("category");

    const addButton =
        document.getElementById("addButton");

    const saveBudget =
        document.getElementById("saveBudget");

    const budgetAmount =
        document.getElementById("budgetAmount");

    const totalIncomeElement =
        document.getElementById("totalIncome");

    const totalExpenseElement =
        document.getElementById("totalExpense");

    const totalBalanceElement =
        document.getElementById("totalBalance");

    const transactionList =
        document.getElementById("transactionList");

    const progressBar =
        document.getElementById("progressBar");

    const budgetMessage =
        document.getElementById("budgetMessage");

    const expenseChartCanvas =
        document.getElementById("expenseChart");


    // =========================================
    // CALCULATE TOTALS
    // =========================================

    function calculateTotals() {

        totalIncome = 0;
        totalExpense = 0;

        expenses = {
            Food: 0,
            Transport: 0,
            Shopping: 0,
            Education: 0,
            Entertainment: 0,
            Other: 0
        };


        transactions.forEach(function (transaction) {

            let money =
                Number(transaction.amount);


            if (transaction.type === "income") {

                totalIncome += money;

            } else {

                totalExpense += money;


                if (
                    expenses[transaction.category] !== undefined
                ) {

                    expenses[transaction.category] += money;
                }
            }

        });
    }


    // =========================================
    // UPDATE DASHBOARD
    // =========================================

    function updateDashboard() {

        let balance =
            totalIncome - totalExpense;


        totalIncomeElement.textContent =
            "₹" + totalIncome;


        totalExpenseElement.textContent =
            "₹" + totalExpense;


        totalBalanceElement.textContent =
            "₹" + balance;
    }


    // =========================================
    // DISPLAY TRANSACTIONS
    // =========================================

    function displayTransactions() {

        transactionList.innerHTML = "";


        if (transactions.length === 0) {

            let message =
                document.createElement("p");

            message.textContent =
                "No transactions yet.";

            transactionList.appendChild(message);

            return;
        }


        transactions.forEach(function (transaction, index) {

            let box =
                document.createElement("div");

            box.className =
                "transaction";


            // LEFT SIDE

            let left =
                document.createElement("div");


            let title =
                document.createElement("strong");

            title.textContent =
                transaction.description;


            let categoryText =
                document.createElement("small");

            categoryText.textContent =
                transaction.category;


            left.appendChild(title);

            left.appendChild(
                document.createElement("br")
            );

            left.appendChild(categoryText);


            // RIGHT SIDE

            let right =
                document.createElement("div");


            let money =
                document.createElement("strong");


            if (transaction.type === "income") {

                money.textContent =
                    "+₹" + transaction.amount;

            } else {

                money.textContent =
                    "-₹" + transaction.amount;
            }


            let deleteButton =
                document.createElement("button");


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteTransaction(index);
                }
            );


            right.appendChild(money);

            right.appendChild(
                document.createElement("br")
            );

            right.appendChild(deleteButton);


            // ADD TO TRANSACTION BOX

            box.appendChild(left);

            box.appendChild(right);


            transactionList.appendChild(box);

        });
    }


    // =========================================
    // ADD TRANSACTION
    // =========================================

    addButton.addEventListener(
        "click",
        function () {

            let descriptionValue =
                description.value.trim();


            let amountValue =
                Number(amount.value);


            let typeValue =
                type.value;


            let categoryValue =
                category.value;


            // CHECK DESCRIPTION

            if (descriptionValue === "") {

                alert(
                    "Please enter a description."
                );

                return;
            }


            // CHECK AMOUNT

            if (amountValue <= 0) {

                alert(
                    "Please enter a valid amount."
                );

                return;
            }


            // CREATE TRANSACTION

            let newTransaction = {

                description:
                    descriptionValue,

                amount:
                    amountValue,

                type:
                    typeValue,

                category:
                    categoryValue
            };


            // ADD TRANSACTION

            transactions.push(
                newTransaction
            );


            // SAVE TRANSACTIONS

            localStorage.setItem(
                "transactions",
                JSON.stringify(transactions)
            );


            // CLEAR INPUTS

            description.value = "";

            amount.value = "";


            // UPDATE PAGE

            refresh();
        }
    );


    // =========================================
    // DELETE TRANSACTION
    // =========================================

    function deleteTransaction(index) {

        transactions.splice(index, 1);


        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );


        refresh();
    }


    // =========================================
    // SAVE BUDGET
    // =========================================

    saveBudget.addEventListener(
        "click",
        function () {

            let budget =
                Number(budgetAmount.value);


            if (budget <= 0) {

                alert(
                    "Please enter a valid budget."
                );

                return;
            }


            monthlyBudget =
                budget;


            localStorage.setItem(
                "monthlyBudget",
                monthlyBudget
            );


            budgetAmount.value = "";


            updateBudget();
        }
    );


    // =========================================
    // UPDATE BUDGET
    // =========================================

    function updateBudget() {

        if (monthlyBudget <= 0) {

            progressBar.style.width =
                "0%";

            budgetMessage.textContent =
                "No budget set.";

            return;
        }


        let percentage =
            (totalExpense / monthlyBudget) * 100;


        if (percentage > 100) {

            percentage = 100;
        }


        progressBar.style.width =
            percentage + "%";


        let remaining =
            monthlyBudget - totalExpense;


        if (remaining >= 0) {

            budgetMessage.textContent =
                "₹" +
                remaining +
                " remaining from your budget.";

        } else {

            budgetMessage.textContent =
                "Budget exceeded by ₹" +
                Math.abs(remaining) +
                ".";
        }
    }


    // =========================================
    // UPDATE CHART
    // =========================================

    function updateChart() {

        if (typeof Chart === "undefined") {

            return;
        }


        if (expenseChart !== null) {

            expenseChart.destroy();
        }


        expenseChart =
            new Chart(
                expenseChartCanvas,
                {
                    type: "pie",

                    data: {

                        labels:
                            Object.keys(expenses),

                        datasets: [
                            {
                                data:
                                    Object.values(expenses)
                            }
                        ]
                    },

                    options: {
                        responsive: true
                    }
                }
            );
    }


    // =========================================
    // REFRESH EVERYTHING
    // =========================================

    function refresh() {

        calculateTotals();

        updateDashboard();

        displayTransactions();

        updateBudget();

        updateChart();
    }


    // =========================================
    // START PROJECT
    // =========================================

    refresh();

});
```
