/* =========================================================
   DOUBLE PENDULUM VIRTUAL LAB
   charts.js

   Purpose:
   - Create real-time simulation charts
   - Store simulation data
   - Update charts during simulation
   - Clear/reset charts
   - Provide data for CSV export

   Required library:
   Chart.js

   Chart.js is loaded in index.html using CDN.
   ========================================================= */


/* =========================================================
   GLOBAL CHART VARIABLES
   ========================================================= */

let theta1Chart = null;
let theta2Chart = null;
let omega1Chart = null;
let omega2Chart = null;
let energyChart = null;


/* =========================================================
   SIMULATION DATA STORAGE
   ========================================================= */

let simulationData = {

    time: [],

    theta1: [],

    theta2: [],

    omega1: [],

    omega2: [],

    alpha1: [],

    alpha2: [],

    kineticEnergy: [],

    potentialEnergy: [],

    totalEnergy: []

};


/* =========================================================
   CHART CONFIGURATION
   ========================================================= */

/*
   Maximum number of points displayed on the charts.

   This prevents the browser from becoming slow during
   long simulations.

   The complete data is still stored separately.
*/

const MAX_CHART_POINTS = 1500;


/*
   Chart update frequency.

   For example:

   Simulation may calculate every 0.005 s

   But charts don't need to redraw every 0.005 s.

   We can update them every few simulation steps.
*/

let chartUpdateCounter = 0;

const CHART_UPDATE_INTERVAL = 3;


/* =========================================================
   COMMON CHART OPTIONS
   ========================================================= */

function getCommonChartOptions(yAxisTitle) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {

            legend: {
                display: true,

                position: "top",

                labels: {
                    font: {
                        size: 11
                    }
                }
            },

            tooltip: {

                enabled: true,

                callbacks: {

                    label: function(context) {

                        const value =
                            context.parsed.y;

                        if (
                            typeof value === "number"
                        ) {

                            return (
                                context.dataset.label +
                                ": " +
                                value.toFixed(4)
                            );

                        }

                        return (
                            context.dataset.label +
                            ": " +
                            value
                        );

                    }

                }

            }

        },

        scales: {

            x: {

                type: "linear",

                title: {

                    display: true,

                    text: "Time (s)",

                    font: {
                        size: 12,
                        weight: "bold"
                    }

                },

                ticks: {

                    maxTicksLimit: 10,

                    font: {
                        size: 10
                    }

                },

                grid: {
                    display: true
                }

            },

            y: {

                title: {

                    display: true,

                    text: yAxisTitle,

                    font: {
                        size: 12,
                        weight: "bold"
                    }

                },

                ticks: {

                    font: {
                        size: 10
                    }

                },

                grid: {
                    display: true
                }

            }

        }

    };

}


/* =========================================================
   CREATE DATASET
   ========================================================= */

function createDataset(label) {

    return {

        label: label,

        data: [],

        tension: 0.15,

        pointRadius: 0,

        pointHoverRadius: 4,

        borderWidth: 2,

        fill: false

    };

}


/* =========================================================
   INITIALIZE ALL CHARTS
   ========================================================= */

function initializeCharts() {

    console.log(
        "Initializing Double Pendulum charts..."
    );


    /* -----------------------------------------------------
       Find canvas elements
       ----------------------------------------------------- */

    const theta1Canvas =
        document.getElementById("theta1Chart");

    const theta2Canvas =
        document.getElementById("theta2Chart");

    const omega1Canvas =
        document.getElementById("omega1Chart");

    const omega2Canvas =
        document.getElementById("omega2Chart");

    const energyCanvas =
        document.getElementById("energyChart");


    /*
       Make sure the canvases exist.
    */

    if (!theta1Canvas) {

        console.error(
            "theta1Chart canvas not found."
        );

        return;

    }


    if (!theta2Canvas) {

        console.error(
            "theta2Chart canvas not found."
        );

        return;

    }


    if (!omega1Canvas) {

        console.error(
            "omega1Chart canvas not found."
        );

        return;

    }


    if (!omega2Canvas) {

        console.error(
            "omega2Chart canvas not found."
        );

        return;

    }


    if (!energyCanvas) {

        console.error(
            "energyChart canvas not found."
        );

        return;

    }


    /* =====================================================
       DESTROY EXISTING CHARTS
       ===================================================== */

    destroyCharts();


    /* =====================================================
       θ₁ CHART
       ===================================================== */

    theta1Chart =
        new Chart(

            theta1Canvas.getContext("2d"),

            {

                type: "line",

                data: {

                    datasets: [

                        createDataset(
                            "θ₁ (degrees)"
                        )

                    ]

                },

                options:
                    getCommonChartOptions(
                        "Angular Displacement θ₁ (°)"
                    )

            }

        );


    /* =====================================================
       θ₂ CHART
       ===================================================== */

    theta2Chart =
        new Chart(

            theta2Canvas.getContext("2d"),

            {

                type: "line",

                data: {

                    datasets: [

                        createDataset(
                            "θ₂ (degrees)"
                        )

                    ]

                },

                options:
                    getCommonChartOptions(
                        "Angular Displacement θ₂ (°)"
                    )

            }

        );


    /* =====================================================
       ω₁ CHART
       ===================================================== */

    omega1Chart =
        new Chart(

            omega1Canvas.getContext("2d"),

            {

                type: "line",

                data: {

                    datasets: [

                        createDataset(
                            "ω₁ (rad/s)"
                        )

                    ]

                },

                options:
                    getCommonChartOptions(
                        "Angular Velocity ω₁ (rad/s)"
                    )

            }

        );


    /* =====================================================
       ω₂ CHART
       ===================================================== */

    omega2Chart =
        new Chart(

            omega2Canvas.getContext("2d"),

            {

                type: "line",

                data: {

                    datasets: [

                        createDataset(
                            "ω₂ (rad/s)"
                        )

                    ]

                },

                options:
                    getCommonChartOptions(
                        "Angular Velocity ω₂ (rad/s)"
                    )

            }

        );


    /* =====================================================
       ENERGY CHART
       ===================================================== */

    energyChart =
        new Chart(

            energyCanvas.getContext("2d"),

            {

                type: "line",

                data: {

                    datasets: [

                        createDataset(
                            "Total Mechanical Energy (J)"
                        )

                    ]

                },

                options:
                    getCommonChartOptions(
                        "Total Mechanical Energy (J)"
                    )

            }

        );


    console.log(
        "All charts initialized successfully."
    );

}


/* =========================================================
   ADD A SINGLE SIMULATION DATA POINT
   ========================================================= */

/*
   This function will be called by simulation.js.

   Example:

   addSimulationData(
       time,
       theta1,
       theta2,
       omega1,
       omega2,
       alpha1,
       alpha2,
       kineticEnergy,
       potentialEnergy,
       totalEnergy
   );
*/

function addSimulationData(

    time,

    theta1,

    theta2,

    omega1,

    omega2,

    alpha1,

    alpha2,

    kineticEnergy,

    potentialEnergy,

    totalEnergy

) {


    /* =====================================================
       STORE DATA
       ===================================================== */

    simulationData.time.push(time);

    simulationData.theta1.push(theta1);

    simulationData.theta2.push(theta2);

    simulationData.omega1.push(omega1);

    simulationData.omega2.push(omega2);

    simulationData.alpha1.push(alpha1);

    simulationData.alpha2.push(alpha2);

    simulationData.kineticEnergy.push(
        kineticEnergy
    );

    simulationData.potentialEnergy.push(
        potentialEnergy
    );

    simulationData.totalEnergy.push(
        totalEnergy
    );


    /* =====================================================
       UPDATE COUNTER
       ===================================================== */

    chartUpdateCounter++;


    /*
       Don't redraw charts at every single physics
       calculation.

       This greatly improves performance.
    */

    if (
        chartUpdateCounter >=
        CHART_UPDATE_INTERVAL
    ) {

        updateCharts();

        chartUpdateCounter = 0;

    }

}


/* =========================================================
   UPDATE ALL CHARTS
   ========================================================= */

function updateCharts() {

    if (!theta1Chart) {
        return;
    }


    /* =====================================================
       DETERMINE START INDEX
       ===================================================== */

    const totalPoints =
        simulationData.time.length;


    let startIndex = 0;


    if (
        totalPoints >
        MAX_CHART_POINTS
    ) {

        startIndex =
            totalPoints -
            MAX_CHART_POINTS;

    }


    /* =====================================================
       CREATE CHART DATA
       ===================================================== */

    const timeData =
        simulationData.time
            .slice(startIndex);


    const theta1Data =
        simulationData.theta1
            .slice(startIndex);


    const theta2Data =
        simulationData.theta2
            .slice(startIndex);


    const omega1Data =
        simulationData.omega1
            .slice(startIndex);


    const omega2Data =
        simulationData.omega2
            .slice(startIndex);


    const energyData =
        simulationData.totalEnergy
            .slice(startIndex);


    /* =====================================================
       θ₁ DATA
       ===================================================== */

    theta1Chart.data.datasets[0].data =
        timeData.map(

            (time, index) => ({

                x: time,

                y: theta1Data[index]

            })

        );


    /* =====================================================
       θ₂ DATA
       ===================================================== */

    theta2Chart.data.datasets[0].data =
        timeData.map(

            (time, index) => ({

                x: time,

                y: theta2Data[index]

            })

        );


    /* =====================================================
       ω₁ DATA
       ===================================================== */

    omega1Chart.data.datasets[0].data =
        timeData.map(

            (time, index) => ({

                x: time,

                y: omega1Data[index]

            })

        );


    /* =====================================================
       ω₂ DATA
       ===================================================== */

    omega2Chart.data.datasets[0].data =
        timeData.map(

            (time, index) => ({

                x: time,

                y: omega2Data[index]

            })

        );


    /* =====================================================
       ENERGY DATA
       ===================================================== */

    energyChart.data.datasets[0].data =
        timeData.map(

            (time, index) => ({

                x: time,

                y: energyData[index]

            })

        );


    /* =====================================================
       REDRAW
       ===================================================== */

    theta1Chart.update("none");

    theta2Chart.update("none");

    omega1Chart.update("none");

    omega2Chart.update("none");

    energyChart.update("none");

}


/* =========================================================
   CLEAR SIMULATION DATA
   ========================================================= */

function clearChartData() {


    /* =====================================================
       CLEAR DATA ARRAYS
       ===================================================== */

    simulationData.time = [];

    simulationData.theta1 = [];

    simulationData.theta2 = [];

    simulationData.omega1 = [];

    simulationData.omega2 = [];

    simulationData.alpha1 = [];

    simulationData.alpha2 = [];

    simulationData.kineticEnergy = [];

    simulationData.potentialEnergy = [];

    simulationData.totalEnergy = [];


    /* =====================================================
       RESET COUNTER
       ===================================================== */

    chartUpdateCounter = 0;


    /* =====================================================
       CLEAR CHARTS
       ===================================================== */

    if (theta1Chart) {

        theta1Chart.data.datasets[0].data =
            [];

        theta1Chart.update("none");

    }


    if (theta2Chart) {

        theta2Chart.data.datasets[0].data =
            [];

        theta2Chart.update("none");

    }


    if (omega1Chart) {

        omega1Chart.data.datasets[0].data =
            [];

        omega1Chart.update("none");

    }


    if (omega2Chart) {

        omega2Chart.data.datasets[0].data =
            [];

        omega2Chart.update("none");

    }


    if (energyChart) {

        energyChart.data.datasets[0].data =
            [];

        energyChart.update("none");

    }


    console.log(
        "Chart data cleared."
    );

}


/* =========================================================
   RESET CHARTS
   ========================================================= */

function resetCharts() {

    clearChartData();

}


/* =========================================================
   DESTROY CHARTS
   ========================================================= */

function destroyCharts() {


    if (theta1Chart) {

        theta1Chart.destroy();

        theta1Chart = null;

    }


    if (theta2Chart) {

        theta2Chart.destroy();

        theta2Chart = null;

    }


    if (omega1Chart) {

        omega1Chart.destroy();

        omega1Chart = null;

    }


    if (omega2Chart) {

        omega2Chart.destroy();

        omega2Chart = null;

    }


    if (energyChart) {

        energyChart.destroy();

        energyChart = null;

    }

}


/* =========================================================
   GET STORED SIMULATION DATA
   ========================================================= */

/*
   This function will later be used by the CSV export
   function in controls.js.
*/

function getSimulationData() {

    return simulationData;

}


/* =========================================================
   GET NUMBER OF DATA POINTS
   ========================================================= */

function getSimulationDataLength() {

    return simulationData.time.length;

}


/* =========================================================
   GET LAST DATA POINT
   ========================================================= */

function getLatestSimulationData() {

    const n =
        simulationData.time.length - 1;


    if (n < 0) {

        return null;

    }


    return {

        time:
            simulationData.time[n],

        theta1:
            simulationData.theta1[n],

        theta2:
            simulationData.theta2[n],

        omega1:
            simulationData.omega1[n],

        omega2:
            simulationData.omega2[n],

        alpha1:
            simulationData.alpha1[n],

        alpha2:
            simulationData.alpha2[n],

        kineticEnergy:
            simulationData.kineticEnergy[n],

        potentialEnergy:
            simulationData.potentialEnergy[n],

        totalEnergy:
            simulationData.totalEnergy[n]

    };

}


/* =========================================================
   CALCULATE ENERGY ERROR
   ========================================================= */

function calculateEnergyError() {

    const n =
        simulationData.totalEnergy.length;


    if (n < 2) {

        return 0;

    }


    const initialEnergy =
        simulationData.totalEnergy[0];


    const currentEnergy =
        simulationData.totalEnergy[n - 1];


    if (
        Math.abs(initialEnergy) <
        1e-12
    ) {

        return 0;

    }


    const error =
        Math.abs(
            currentEnergy -
            initialEnergy
        )
        /
        Math.abs(initialEnergy)
        *
        100;


    return error;

}


/* =========================================================
   UPDATE ENERGY VALIDATION PANEL
   ========================================================= */

function updateEnergyValidation() {

    const data =
        getLatestSimulationData();


    if (!data) {

        return;

    }


    const initialEnergy =
        simulationData.totalEnergy[0];


    const currentEnergy =
        data.totalEnergy;


    const error =
        calculateEnergyError();


    /* =====================================================
       FIND HTML ELEMENTS
       ===================================================== */

    const initialEnergyElement =
        document.getElementById(
            "initialEnergy"
        );


    const currentEnergyElement =
        document.getElementById(
            "currentEnergy"
        );


    const energyErrorElement =
        document.getElementById(
            "energyError"
        );


    const energyStatusElement =
        document.getElementById(
            "energyStatus"
        );


    const energyStatusText =
        document.getElementById(
            "energyStatusText"
        );


    /* =====================================================
       UPDATE VALUES
       ===================================================== */

    if (initialEnergyElement) {

        initialEnergyElement.textContent =
            initialEnergy.toFixed(4) +
            " J";

    }


    if (currentEnergyElement) {

        currentEnergyElement.textContent =
            currentEnergy.toFixed(4) +
            " J";

    }


    if (energyErrorElement) {

        energyErrorElement.textContent =
            error.toFixed(4) +
            " %";

    }


    /* =====================================================
       ENERGY STATUS
       ===================================================== */

    if (energyStatusElement) {

        energyStatusElement.classList.remove(
            "good",
            "warning",
            "error"
        );


        if (error < 0.1) {

            energyStatusElement.classList.add(
                "good"
            );

        }

        else if (error < 1.0) {

            energyStatusElement.classList.add(
                "warning"
            );

        }

        else {

            energyStatusElement.classList.add(
                "error"
            );

        }

    }


    if (energyStatusText) {

        if (error < 0.1) {

            energyStatusText.textContent =
                "Excellent numerical energy conservation";

        }

        else if (error < 1.0) {

            energyStatusText.textContent =
                "Acceptable numerical error";

        }

        else {

            energyStatusText.textContent =
                "High numerical error — reduce timestep";

        }

    }

}


/* =========================================================
   FORCE CHART UPDATE
   ========================================================= */

/*
   Used when the simulation is paused or stopped.

   This ensures the latest data point is visible even if
   the normal update interval hasn't been reached.
*/

function forceChartUpdate() {

    updateCharts();

    updateEnergyValidation();

}


/* =========================================================
   EXPORT DATA AS CSV
   ========================================================= */

/*
   This function can also be called directly from the
   Download CSV button in index.html.
*/

function exportChartsDataCSV() {


    const data =
        simulationData;


    if (
        data.time.length === 0
    ) {

        alert(
            "No simulation data available."
        );

        return;

    }


    /* =====================================================
       CSV HEADER
       ===================================================== */

    let csv =
        "Time (s)," +
        "Theta1 (deg)," +
        "Theta2 (deg)," +
        "Omega1 (rad/s)," +
        "Omega2 (rad/s)," +
        "Alpha1 (rad/s²)," +
        "Alpha2 (rad/s²)," +
        "Kinetic Energy (J)," +
        "Potential Energy (J)," +
        "Total Energy (J)\n";


    /* =====================================================
       CSV ROWS
       ===================================================== */

    for (
        let i = 0;
        i < data.time.length;
        i++
    ) {

        csv +=

            data.time[i].toFixed(6)
            + "," +

            data.theta1[i].toFixed(6)
            + "," +

            data.theta2[i].toFixed(6)
            + "," +

            data.omega1[i].toFixed(6)
            + "," +

            data.omega2[i].toFixed(6)
            + "," +

            data.alpha1[i].toFixed(6)
            + "," +

            data.alpha2[i].toFixed(6)
            + "," +

            data.kineticEnergy[i].toFixed(6)
            + "," +

            data.potentialEnergy[i].toFixed(6)
            + "," +

            data.totalEnergy[i].toFixed(6)

            + "\n";

    }


    /* =====================================================
       CREATE BLOB
       ===================================================== */

    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    /* =====================================================
       CREATE DOWNLOAD LINK
       ===================================================== */

    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "double_pendulum_simulation_data.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    console.log(
        "Simulation CSV downloaded."
    );

}


/* =========================================================
   AUTOMATIC INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Chart.js should already be loaded by index.html.

           Initialize after the page has loaded.
        */

        if (
            typeof Chart === "undefined"
        ) {

            console.error(
                "Chart.js is not loaded."
            );

            return;

        }


        initializeCharts();

    }
);


/* =========================================================
   END OF charts.js
   ========================================================= */
