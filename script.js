document.addEventListener("DOMContentLoaded", function () {


    // GET SAVED TRANSACTIONS

    let transactions =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];


    // GET SAVED BUDGET

    let monthlyBudget =
        Number(
            localStorage.getItem("monthlyBudget")
        ) || 0;


    // HTML ELEMENTS

    const descriptionInput =
        document.getElementById("description");

    const amountInput =
        document.getElementById("amount");

    const typeInput =
        document.getElementById("type");

    const categoryInput =
        document.getElementById("category");

    const addButton =
        document.getElementById("addButton");

    const saveBudgetButton =
        document.getElementById("saveBudget");

    const budgetAmountInput =
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


    // CHART

    let expenseChart = null;


    // CALCULATE TOTALS

    function calculateTotals() {

        let income = 0;

        let expense = 0;


        transactions.forEach(function (transaction) {

            if (transaction.type === "income") {

                income += transaction.amount;

            } else {

                expense += transaction.amount;

            }

        });


        return {

            income: income,

            expense: expense,

            balance: income - expense

        };

    }


    // UPDATE DASHBOARD

    function updateDashboard() {

        const totals =
            calculateTotals();


        totalIncomeElement.textContent =
            "₹" + totals.income.toFixed(2);


        totalExpenseElement.textContent =
            "₹" + totals.expense.toFixed(2);


        totalBalanceElement.textContent =
            "₹" + totals.balance.toFixed(2);

    }


    // DISPLAY TRANSACTIONS

    function displayTransactions() {

        transactionList.innerHTML = "";


        if (transactions.length === 0) {

            transactionList.innerHTML =
                "<p>No transactions yet.</p>";

            return;

        }


        transactions.forEach(
            function (transaction, index) {


                const transactionDiv =
                    document.createElement("div");


                transactionDiv.className =
                    "transaction";


                const infoDiv =
                    document.createElement("div");


                infoDiv.className =
                    "transaction-info";


                const description =
                    document.createElement("strong");


                description.textContent =
                    transaction.description;


                const details =
                    document.createElement("small");


                details.textContent =
                    transaction.category +
                    " | " +
                    transaction.type;


                infoDiv.appendChild(description);

                infoDiv.appendChild(details);


                const amount =
                    document.createElement("span");


                if (transaction.type === "income") {

                    amount.textContent =
                        "+₹" +
                        transaction.amount.toFixed(2);

                    amount.className =
                        "income";

                } else {

                    amount.textContent =
                        "-₹" +
                        transaction.amount.toFixed(2);

                    amount.className =
                        "expense";

                }


                const deleteButton =
                    document.createElement("button");


                deleteButton.textContent =
                    "Delete";


                deleteButton.className =
                    "delete-button";


                deleteButton.addEventListener(
                    "click",
                    function () {

                        transactions.splice(index, 1);

                        saveData();

                        refresh();

                    }
                );


                transactionDiv.appendChild(infoDiv);

                transactionDiv.appendChild(amount);

                transactionDiv.appendChild(deleteButton);


                transactionList.appendChild(
                    transactionDiv
                );

            }
        );

    }


    // ADD TRANSACTION

    addButton.addEventListener(
        "click",
        function () {


            const description =
                descriptionInput.value.trim();


            const amount =
                Number(amountInput.value);


            const type =
                typeInput.value;


            const category =
                categoryInput.value;


            // VALIDATION

            if (description === "") {

                alert(
                    "Please enter a description."
                );

                return;

            }


            if (
                isNaN(amount) ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid amount."
                );

                return;

            }


            // CREATE TRANSACTION

            const transaction = {

                description: description,

                amount: amount,

                type: type,

                category: category

            };


            transactions.push(
                transaction
            );


            // SAVE DATA

            saveData();


            // CLEAR INPUTS

            descriptionInput.value = "";

            amountInput.value = "";


            // UPDATE

            refresh();

        }
    );


    // SAVE BUDGET

    saveBudgetButton.addEventListener(
        "click",
        function () {


            const budget =
                Number(
                    budgetAmountInput.value
                );


            if (
                isNaN(budget) ||
                budget <= 0
            ) {

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


            budgetAmountInput.value = "";


            updateBudget();

        }
    );


    // UPDATE BUDGET

    function updateBudget() {


        if (monthlyBudget <= 0) {

            progressBar.style.width =
                "0%";


            budgetMessage.textContent =
                "No budget set.";


            return;

        }


        const totals =
            calculateTotals();


        const expense =
            totals.expense;


        let percentage =
            (expense / monthlyBudget) * 100;


        if (percentage > 100) {

            percentage = 100;

        }


        progressBar.style.width =
            percentage + "%";


        const remaining =
            monthlyBudget - expense;


        if (remaining >= 0) {

            budgetMessage.textContent =
                "Remaining Budget: ₹" +
                remaining.toFixed(2);

        } else {

            budgetMessage.textContent =
                "Budget Exceeded by ₹" +
                Math.abs(remaining).toFixed(2);

        }

    }


    // SAVE DATA

    function saveData() {


        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );


        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );

    }


    // UPDATE CHART

    function updateChart() {


        const categoryTotals = {

            Food: 0,

            Transport: 0,

            Shopping: 0,

            Education: 0,

            Entertainment: 0,

            Other: 0

        };


        transactions.forEach(
            function (transaction) {


                if (
                    transaction.type === "expense"
                ) {

                    categoryTotals[
                        transaction.category
                    ] += transaction.amount;

                }

            }
        );


        const labels =
            Object.keys(categoryTotals);


        const data =
            Object.values(categoryTotals);


        const canvas =
            document.getElementById(
                "expenseChart"
            );


        const ctx =
            canvas.getContext("2d");


        if (expenseChart !== null) {

            expenseChart.destroy();

        }


        expenseChart =
            new Chart(
                ctx,
                {

                    type: "pie",

                    data: {

                        labels: labels,

                        datasets: [

                            {

                                label:
                                    "Expenses",

                                data: data

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        plugins: {

                            legend: {

                                position:
                                    "bottom"

                            }

                        }

                    }

                }
            );

    }


    // REFRESH EVERYTHING

    function refresh() {

        updateDashboard();

        displayTransactions();

        updateBudget();

        updateChart();

    }


    // INITIAL LOAD

    refresh();

});