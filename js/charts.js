/* ============================================================
   DOUBLE PENDULUM VIRTUAL LAB
   charts.js
   ============================================================ */


/* ============================================================
   1. GLOBAL CHART VARIABLES
   ============================================================ */

let theta1Chart = null;
let theta2Chart = null;

let omega1Chart = null;
let omega2Chart = null;

let energyChart = null;


/* ============================================================
   2. SIMULATION DATA
   ============================================================ */

let simulationData = {

    time: [],

    theta1: [],
    theta2: [],

    omega1: [],
    omega2: [],

    kineticEnergy: [],
    potentialEnergy: [],
    totalEnergy: []
};


/* ============================================================
   3. SETTINGS
   ============================================================ */

const MAX_CHART_POINTS = 1500;

const CHART_UPDATE_INTERVAL = 3;

let chartUpdateCounter = 0;


/* ============================================================
   4. CHECK CHART.JS
   ============================================================ */

function isChartJSAvailable() {

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded."
        );

        return false;
    }

    return true;
}


/* ============================================================
   5. CREATE COMMON OPTIONS
   ============================================================ */

function getCommonChartOptions(
    xTitle,
    yTitle
) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        interaction: {

            intersect: false,

            mode: "index"
        },

        plugins: {

            legend: {

                display: true,

                position: "top",

                labels: {

                    boxWidth: 10,

                    font: {

                        size: 9
                    }
                }
            },

            tooltip: {

                enabled: true
            }
        },

        scales: {

            x: {

                type: "linear",

                title: {

                    display: true,

                    text: xTitle,

                    font: {

                        size: 9
                    }
                },

                ticks: {

                    font: {

                        size: 8
                    },

                    maxTicksLimit: 6
                },

                grid: {

                    display: true
                }
            },

            y: {

                title: {

                    display: true,

                    text: yTitle,

                    font: {

                        size: 9
                    }
                },

                ticks: {

                    font: {

                        size: 8
                    },

                    maxTicksLimit: 6
                },

                grid: {

                    display: true
                }
            }
        }
    };
}


/* ============================================================
   6. CREATE LINE DATA
   ============================================================ */

function makeLineData(
    values,
    label
) {

    return {

        label: label,

        data: simulationData.time.map(
            function(time, index) {

                return {

                    x: time,

                    y: values[index]
                };
            }
        ),

        borderWidth: 1.8,

        pointRadius: 0,

        pointHoverRadius: 3,

        tension: 0.15,

        fill: false
    };
}


/* ============================================================
   7. INITIALIZE CHARTS
   ============================================================ */

function initializeCharts() {

    console.log(
        "Initializing charts..."
    );


    if (!isChartJSAvailable()) {

        return false;
    }


    /*
       Destroy existing charts first
    */

    destroyCharts();


    /*
       Get canvas elements
    */

    const theta1Canvas =
        document.getElementById(
            "theta1Chart"
        );


    const theta2Canvas =
        document.getElementById(
            "theta2Chart"
        );


    const omega1Canvas =
        document.getElementById(
            "omega1Chart"
        );


    const omega2Canvas =
        document.getElementById(
            "omega2Chart"
        );


    const energyCanvas =
        document.getElementById(
            "energyChart"
        );


    if (
        !theta1Canvas ||
        !theta2Canvas ||
        !omega1Canvas ||
        !omega2Canvas ||
        !energyCanvas
    ) {

        console.error(
            "One or more chart canvas elements are missing."
        );

        return false;
    }


    /* ========================================================
       THETA 1
       ======================================================== */

    theta1Chart =
        new Chart(
            theta1Canvas.getContext("2d"),
            {

                type: "line",

                data: {

                    datasets: [
                        makeLineData(
                            simulationData.theta1,
                            "θ₁"
                        )
                    ]
                },

                options:
                    getCommonChartOptions(
                        "Time (s)",
                        "θ₁ (°)"
                    )
            }
        );


    /* ========================================================
       THETA 2
       ======================================================== */

    theta2Chart =
        new Chart(
            theta2Canvas.getContext("2d"),
            {

                type: "line",

                data: {

                    datasets: [
                        makeLineData(
                            simulationData.theta2,
                            "θ₂"
                        )
                    ]
                },

                options:
                    getCommonChartOptions(
                        "Time (s)",
                        "θ₂ (°)"
                    )
            }
        );


    /* ========================================================
       OMEGA 1
       ======================================================== */

    omega1Chart =
        new Chart(
            omega1Canvas.getContext("2d"),
            {

                type: "line",

                data: {

                    datasets: [
                        makeLineData(
                            simulationData.omega1,
                            "ω₁"
                        )
                    ]
                },

                options:
                    getCommonChartOptions(
                        "Time (s)",
                        "ω₁ (rad/s)"
                    )
            }
        );


    /* ========================================================
       OMEGA 2
       ======================================================== */

    omega2Chart =
        new Chart(
            omega2Canvas.getContext("2d"),
            {

                type: "line",

                data: {

                    datasets: [
                        makeLineData(
                            simulationData.omega2,
                            "ω₂"
                        )
                    ]
                },

                options:
                    getCommonChartOptions(
                        "Time (s)",
                        "ω₂ (rad/s)"
                    )
            }
        );


    /* ========================================================
       ENERGY
       ======================================================== */

    energyChart =
        new Chart(
            energyCanvas.getContext("2d"),
            {

                type: "line",

                data: {

                    datasets: [

                        makeLineData(
                            simulationData.kineticEnergy,
                            "Kinetic"
                        ),

                        makeLineData(
                            simulationData.potentialEnergy,
                            "Potential"
                        ),

                        makeLineData(
                            simulationData.totalEnergy,
                            "Total"
                        )
                    ]
                },

                options:
                    getCommonChartOptions(
                        "Time (s)",
                        "Energy (J)"
                    )
            }
        );


    console.log(
        "All charts initialized successfully."
    );


    return true;
}


/* ============================================================
   8. ADD SIMULATION DATA
   ============================================================ */

function addSimulationData(
    time,
    theta1,
    theta2,
    omega1,
    omega2,
    kineticEnergy,
    potentialEnergy,
    totalEnergy
) {

    /*
       Validate values
    */

    if (
        !Number.isFinite(time) ||
        !Number.isFinite(theta1) ||
        !Number.isFinite(theta2) ||
        !Number.isFinite(omega1) ||
        !Number.isFinite(omega2)
    ) {

        return;
    }


    /*
       Add values
    */

    simulationData.time.push(time);

    simulationData.theta1.push(theta1);

    simulationData.theta2.push(theta2);

    simulationData.omega1.push(omega1);

    simulationData.omega2.push(omega2);

    simulationData.kineticEnergy.push(
        Number.isFinite(kineticEnergy)
            ? kineticEnergy
            : 0
    );

    simulationData.potentialEnergy.push(
        Number.isFinite(potentialEnergy)
            ? potentialEnergy
            : 0
    );

    simulationData.totalEnergy.push(
        Number.isFinite(totalEnergy)
            ? totalEnergy
            : 0
    );


    /*
       Limit stored points
    */

    if (
        simulationData.time.length >
        MAX_CHART_POINTS
    ) {

        simulationData.time.shift();

        simulationData.theta1.shift();

        simulationData.theta2.shift();

        simulationData.omega1.shift();

        simulationData.omega2.shift();

        simulationData.kineticEnergy.shift();

        simulationData.potentialEnergy.shift();

        simulationData.totalEnergy.shift();
    }


    chartUpdateCounter++;


    /*
       Update chart periodically
    */

    if (
        chartUpdateCounter >=
        CHART_UPDATE_INTERVAL
    ) {

        chartUpdateCounter = 0;

        updateCharts();
    }
}


/* ============================================================
   9. UPDATE CHARTS
   ============================================================ */

function updateCharts() {

    if (!theta1Chart) {

        return;
    }


    /*
       Update θ1
    */

    theta1Chart.data.datasets[0].data =
        simulationData.time.map(
            function(time, index) {

                return {
                    x: time,
                    y: simulationData.theta1[index]
                };

            }
        );


    /*
       Update θ2
    */

    theta2Chart.data.datasets[0].data =
        simulationData.time.map(
            function(time, index) {

                return {
                    x: time,
                    y: simulationData.theta2[index]
                };

            }
        );


    /*
       Update ω1
    */

    omega1Chart.data.datasets[0].data =
        simulationData.time.map(
            function(time, index) {

                return {
                    x: time,
                    y: simulationData.omega1[index]
                };

            }
        );


    /*
       Update ω2
    */

    omega2Chart.data.datasets[0].data =
        simulationData.time.map(
            function(time, index) {

                return {
                    x: time,
                    y: simulationData.omega2[index]
                };

            }
        );


    /*
       Update energy
    */

    energyChart.data.datasets[0].data =
        simulationData.time.map(
            function(time, index) {

                return {
                    x: time,
                    y:
                        simulationData
                            .kineticEnergy[index]
                };

            }
        );


    energyChart.data.datasets[1].data =
        simulationData.time.map(
            function(time, index) {

                return {
                    x: time,
                    y:
                        simulationData
                            .potentialEnergy[index]
                };

            }
        );


    energyChart.data.datasets[2].data =
        simulationData.time.map(
            function(time, index) {

                return {
                    x: time,
                    y:
                        simulationData
                            .totalEnergy[index]
                };

            }
        );


    /*
       Render
    */

    theta1Chart.update("none");

    theta2Chart.update("none");

    omega1Chart.update("none");

    omega2Chart.update("none");

    energyChart.update("none");
}


/* ============================================================
   10. FORCE CHART UPDATE
   ============================================================ */

function forceChartUpdate() {

    chartUpdateCounter = 0;

    updateCharts();
}


/* ============================================================
   11. CLEAR CHART DATA
   ============================================================ */

function clearChartData() {

    simulationData = {

        time: [],

        theta1: [],
        theta2: [],

        omega1: [],
        omega2: [],

        kineticEnergy: [],
        potentialEnergy: [],
        totalEnergy: []
    };


    chartUpdateCounter = 0;


    updateCharts();
}


/* ============================================================
   12. RESET CHARTS
   ============================================================ */

function resetCharts() {

    clearChartData();

    forceChartUpdate();
}


/* ============================================================
   13. DESTROY CHARTS
   ============================================================ */

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


/* ============================================================
   14. GET DATA
   ============================================================ */

function getSimulationChartData() {

    return simulationData;
}


/* ============================================================
   15. GET CHART STATUS
   ============================================================ */

function getChartStatus() {

    return {

        chartJS:
            typeof Chart !== "undefined",

        theta1:
            theta1Chart !== null,

        theta2:
            theta2Chart !== null,

        omega1:
            omega1Chart !== null,

        omega2:
            omega2Chart !== null,

        energy:
            energyChart !== null,

        dataPoints:
            simulationData.time.length
    };
}


/* ============================================================
   16. ENERGY VALIDATION
   ============================================================ */

function updateEnergyValidation(
    initialEnergy,
    currentEnergy
) {

    const initialElement =
        document.getElementById(
            "initialEnergy"
        );


    const currentElement =
        document.getElementById(
            "currentEnergy"
        );


    const errorElement =
        document.getElementById(
            "energyError"
        );


    const statusElement =
        document.getElementById(
            "energyStatus"
        );


    const statusTextElement =
        document.getElementById(
            "energyStatusText"
        );


    if (initialElement) {

        initialElement.textContent =
            Number(initialEnergy).toFixed(4) +
            " J";
    }


    if (currentElement) {

        currentElement.textContent =
            Number(currentEnergy).toFixed(4) +
            " J";
    }


    let error = 0;


    if (
        Math.abs(initialEnergy) >
        1e-12
    ) {

        error =
            Math.abs(
                (
                    currentEnergy -
                    initialEnergy
                ) /
                initialEnergy
            ) * 100;
    }


    if (errorElement) {

        errorElement.textContent =
            error.toFixed(4) +
            " %";
    }


    if (
        statusElement &&
        statusTextElement
    ) {

        if (error < 0.1) {

            statusTextElement.textContent =
                "Energy conserved — excellent numerical stability.";

        } else if (error < 1.0) {

            statusTextElement.textContent =
                "Energy conservation within acceptable limits.";

        } else {

            statusTextElement.textContent =
                "Energy error is increasing — check numerical stability.";
        }
    }
}


/* ============================================================
   17. EXPORT CSV
   ============================================================ */

function exportChartsDataCSV() {

    if (
        simulationData.time.length ===
        0
    ) {

        alert(
            "No simulation data available."
        );

        return;
    }


    let csv =
        "Time (s)," +
        "Theta1 (deg)," +
        "Theta2 (deg)," +
        "Omega1 (rad/s)," +
        "Omega2 (rad/s)," +
        "Kinetic Energy (J)," +
        "Potential Energy (J)," +
        "Total Energy (J)\n";


    for (
        let i = 0;
        i < simulationData.time.length;
        i++
    ) {

        csv +=

            simulationData.time[i] + "," +

            simulationData.theta1[i] + "," +

            simulationData.theta2[i] + "," +

            simulationData.omega1[i] + "," +

            simulationData.omega2[i] + "," +

            simulationData.kineticEnergy[i] + "," +

            simulationData.potentialEnergy[i] + "," +

            simulationData.totalEnergy[i] +

            "\n";
    }


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "double-pendulum-data.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}


/* ============================================================
   18. DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "charts.js loaded."
        );


        /*
           Small delay ensures Chart.js
           and all canvas elements exist.
        */

        setTimeout(
            function() {

                initializeCharts();

            },
            100
        );

    }
);


/* ============================================================
   19. GLOBAL EXPORTS
   ============================================================ */

window.initializeCharts =
    initializeCharts;

window.addSimulationData =
    addSimulationData;

window.updateCharts =
    updateCharts;

window.forceChartUpdate =
    forceChartUpdate;

window.clearChartData =
    clearChartData;

window.resetCharts =
    resetCharts;

window.destroyCharts =
    destroyCharts;

window.getSimulationChartData =
    getSimulationChartData;

window.getChartStatus =
    getChartStatus;

window.updateEnergyValidation =
    updateEnergyValidation;

window.exportChartsDataCSV =
    exportChartsDataCSV;


/* ============================================================
   20. LOADED MESSAGE
   ============================================================ */

console.log(
    "Double Pendulum Chart Engine Loaded"
);
