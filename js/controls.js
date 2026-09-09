/* ============================================================
   DOUBLE PENDULUM VIRTUAL LAB
   controls.js
   ============================================================ */


/* ============================================================
   1. SIMULATION PARAMETERS
   ============================================================ */

const simulationParameters = {

    m1: 1.0,
    m2: 1.0,

    l1: 0.8,
    l2: 0.8,

    theta1: 30.0,
    theta2: 40.0,

    g: 9.81,

    speed: 1.0
};


/* ============================================================
   2. DEFAULT PARAMETERS
   ============================================================ */

const DEFAULT_PARAMETERS = {

    m1: 1.0,
    m2: 1.0,

    l1: 0.8,
    l2: 0.8,

    theta1: 30.0,
    theta2: 40.0,

    g: 9.81,

    speed: 1.0
};


/* ============================================================
   3. GET PARAMETERS
   ============================================================ */

function getSimulationParameters() {

    return {

        m1: simulationParameters.m1,
        m2: simulationParameters.m2,

        l1: simulationParameters.l1,
        l2: simulationParameters.l2,

        theta1: simulationParameters.theta1,
        theta2: simulationParameters.theta2,

        g: simulationParameters.g,

        speed: simulationParameters.speed
    };
}


/* ============================================================
   4. INITIALIZE CONTROLS
   ============================================================ */

function initializeControls() {

    console.log("Initializing controls...");

    syncAllInputs();

    updateAllParameterDisplays();

    setupControlListeners();

    setupKeyboardControls();

    setupVisibilityHandler();

    console.log("Controls initialized successfully.");
}


/* ============================================================
   5. SYNCHRONIZE ALL INPUTS
   ============================================================ */

function syncAllInputs() {

    const parameters = [

        "l1",
        "l2",
        "m1",
        "m2",
        "theta1",
        "theta2",
        "g",
        "speed"

    ];


    parameters.forEach(function(parameter) {

        syncInput(parameter);

    });
}


/* ============================================================
   6. SYNCHRONIZE ONE INPUT
   ============================================================ */

function syncInput(parameter) {

    const slider =
        document.getElementById(
            parameter + "Slider"
        );


    const input =
        document.getElementById(
            parameter + "Input"
        );


    const value =
        simulationParameters[parameter];


    if (slider) {

        slider.value = value;
    }


    if (input) {

        input.value = value;
    }
}


/* ============================================================
   7. UPDATE PARAMETER FROM SLIDER
   ============================================================ */

function updateSimulationParameter(parameter) {

    const slider =
        document.getElementById(
            parameter + "Slider"
        );


    const input =
        document.getElementById(
            parameter + "Input"
        );


    if (!slider) {

        console.error(
            "Slider not found:",
            parameter + "Slider"
        );

        return;
    }


    let value =
        parseFloat(slider.value);


    if (!Number.isFinite(value)) {

        return;
    }


    /*
       Keep value inside slider limits
    */

    if (slider.min !== "") {

        value =
            Math.max(
                value,
                parseFloat(slider.min)
            );
    }


    if (slider.max !== "") {

        value =
            Math.min(
                value,
                parseFloat(slider.max)
            );
    }


    /*
       Save parameter
    */

    simulationParameters[parameter] =
        value;


    /*
       Update number box
    */

    if (input) {

        input.value = value;
    }


    /*
       Update displayed text
    */

    updateParameterDisplay(
        parameter,
        value
    );


    /*
       Speed
    */

    if (parameter === "speed") {

        if (
            typeof setSimulationSpeed ===
            "function"
        ) {

            setSimulationSpeed(value);
        }

        return;
    }


    /*
       Update simulation if available
    */

    if (
        typeof updateStaticSimulation ===
        "function"
    ) {

        updateStaticSimulation();
    }
}


/* ============================================================
   8. UPDATE PARAMETER FROM NUMBER INPUT
   ============================================================ */

function updateParameterFromInput(parameter) {

    const input =
        document.getElementById(
            parameter + "Input"
        );


    const slider =
        document.getElementById(
            parameter + "Slider"
        );


    if (!input) {

        return;
    }


    let value =
        parseFloat(input.value);


    if (!Number.isFinite(value)) {

        syncInput(parameter);

        updateParameterDisplay(
            parameter,
            simulationParameters[parameter]
        );

        return;
    }


    /*
       Respect min/max
    */

    if (slider) {

        if (slider.min !== "") {

            value =
                Math.max(
                    value,
                    parseFloat(slider.min)
                );
        }


        if (slider.max !== "") {

            value =
                Math.min(
                    value,
                    parseFloat(slider.max)
                );
        }


        slider.value = value;
    }


    /*
       Save
    */

    simulationParameters[parameter] =
        value;


    input.value = value;


    /*
       Display
    */

    updateParameterDisplay(
        parameter,
        value
    );


    /*
       Speed
    */

    if (parameter === "speed") {

        if (
            typeof setSimulationSpeed ===
            "function"
        ) {

            setSimulationSpeed(value);
        }

        return;
    }


    /*
       Update simulation
    */

    if (
        typeof updateStaticSimulation ===
        "function"
    ) {

        updateStaticSimulation();
    }
}


/* ============================================================
   9. DISPLAY PARAMETER VALUE
   ============================================================ */

function updateParameterDisplay(
    parameter,
    value
) {

    const display =
        document.getElementById(
            parameter + "Value"
        );


    if (!display) {

        return;
    }


    switch (parameter) {


        case "l1":

        case "l2":

            display.textContent =
                value.toFixed(2) + " m";

            break;


        case "m1":

        case "m2":

            display.textContent =
                value.toFixed(2) + " kg";

            break;


        case "theta1":

        case "theta2":

            display.textContent =
                value.toFixed(1) + "°";

            break;


        case "g":

            display.textContent =
                value.toFixed(2) + " m/s²";

            break;


        case "speed":

            display.textContent =
                value.toFixed(1) + "×";

            break;


        default:

            display.textContent =
                value;
    }
}


/* ============================================================
   10. UPDATE ALL DISPLAY VALUES
   ============================================================ */

function updateAllParameterDisplays() {

    Object.keys(
        simulationParameters
    ).forEach(function(parameter) {

        updateParameterDisplay(
            parameter,
            simulationParameters[parameter]
        );

    });
}


/* ============================================================
   11. UPDATE SPEED
   ============================================================ */

function updateSimulationSpeed(value) {

    value =
        parseFloat(value);


    if (!Number.isFinite(value)) {

        return;
    }


    simulationParameters.speed =
        value;


    const slider =
        document.getElementById(
            "speedSlider"
        );


    const input =
        document.getElementById(
            "speedInput"
        );


    const display =
        document.getElementById(
            "speedValue"
        );


    if (slider) {

        slider.value = value;
    }


    if (input) {

        input.value = value;
    }


    if (display) {

        display.textContent =
            value.toFixed(1) + "×";
    }


    if (
        typeof setSimulationSpeed ===
        "function"
    ) {

        setSimulationSpeed(value);
    }
}


/* ============================================================
   12. START
   ============================================================ */

function startSimulation() {

    console.log("Start button pressed.");


    if (
        typeof startSimulationEngineCore ===
        "function"
    ) {

        startSimulationEngineCore();

    } else {

        console.error(
            "Simulation engine is not loaded."
        );

        alert(
            "Simulation engine is not loaded.\n\n" +
            "Please check js/simulation.js."
        );
    }
}


/* ============================================================
   13. PAUSE
   ============================================================ */

function pauseSimulation() {

    console.log("Pause button pressed.");


    if (
        typeof pauseSimulationEngineCore ===
        "function"
    ) {

        pauseSimulationEngineCore();

    } else {

        console.error(
            "pauseSimulationEngineCore() not found."
        );
    }
}


/* ============================================================
   14. RESET
   ============================================================ */

function resetSimulation() {

    console.log("Reset button pressed.");


    if (
        typeof resetSimulationEngineCore ===
        "function"
    ) {

        resetSimulationEngineCore();

    } else {

        console.error(
            "resetSimulationEngineCore() not found."
        );
    }
}


/* ============================================================
   15. STEP
   ============================================================ */

function stepSimulation() {

    console.log("Step button pressed.");


    if (
        typeof performSimulationStep ===
        "function"
    ) {

        performSimulationStep();

    } else {

        console.error(
            "performSimulationStep() not found."
        );
    }
}


/* ============================================================
   16. TRAIL
   ============================================================ */

function toggleTrail() {

    const checkbox =
        document.getElementById(
            "trailToggle"
        );


    let enabled = true;


    if (checkbox) {

        enabled =
            checkbox.checked;
    }


    if (
        typeof setTrailEnabled ===
        "function"
    ) {

        setTrailEnabled(enabled);
    }
}


/* ============================================================
   17. SIMULATION STATUS
   ============================================================ */

function updateSimulationStatus(
    status,
    text
) {

    const statusElement =
        document.getElementById(
            "simulationStatus"
        );


    const statusText =
        document.getElementById(
            "statusText"
        );


    if (statusElement) {

        statusElement.className =
            "simulation-status " +
            status;
    }


    if (statusText) {

        statusText.textContent =
            text;
    }
}


/* ============================================================
   18. TIME DISPLAY
   ============================================================ */

function updateTimeDisplay(time) {

    const element =
        document.getElementById(
            "timeDisplay"
        );


    if (!element) {

        return;
    }


    const value =
        parseFloat(time);


    if (!Number.isFinite(value)) {

        return;
    }


    element.textContent =
        "Time: " +
        value.toFixed(2) +
        " s";
}


/* ============================================================
   19. UPDATE RESULTS
   ============================================================ */

function updateResultDisplay(results) {

    if (!results) {

        return;
    }


    updateElement(
        "resultTheta1",
        formatNumber(results.theta1, 2) + "°"
    );


    updateElement(
        "resultTheta2",
        formatNumber(results.theta2, 2) + "°"
    );


    updateElement(
        "resultOmega1",
        formatNumber(results.omega1, 3) +
        " rad/s"
    );


    updateElement(
        "resultOmega2",
        formatNumber(results.omega2, 3) +
        " rad/s"
    );


    updateElement(
        "resultAlpha1",
        formatNumber(results.alpha1, 3) +
        " rad/s²"
    );


    updateElement(
        "resultAlpha2",
        formatNumber(results.alpha2, 3) +
        " rad/s²"
    );


    updateElement(
        "resultKE",
        formatNumber(results.kineticEnergy, 4) +
        " J"
    );


    updateElement(
        "resultPE",
        formatNumber(results.potentialEnergy, 4) +
        " J"
    );


    updateElement(
        "resultTotalEnergy",
        formatNumber(results.totalEnergy, 4) +
        " J"
    );
}


/* ============================================================
   20. SAFE ELEMENT UPDATE
   ============================================================ */

function updateElement(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


/* ============================================================
   21. FORMAT NUMBER
   ============================================================ */

function formatNumber(
    value,
    decimals
) {

    const number =
        parseFloat(value);


    if (!Number.isFinite(number)) {

        return "0";
    }


    return number.toFixed(
        decimals
    );
}


/* ============================================================
   22. CLEAR DATA
   ============================================================ */

function clearData() {

    console.log(
        "Clearing simulation data..."
    );


    if (
        typeof clearChartData ===
        "function"
    ) {

        clearChartData();
    }


    if (
        typeof resetCharts ===
        "function"
    ) {

        resetCharts();
    }


    const tableBody =
        document.getElementById(
            "observationTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = "";
    }


    const emptyMessage =
        document.querySelector(
            ".empty-table-message"
        );


    if (emptyMessage) {

        emptyMessage.style.display =
            "block";
    }
}


/* ============================================================
   23. DOWNLOAD CSV
   ============================================================ */

function downloadCSV() {

    console.log(
        "Downloading simulation data..."
    );


    if (
        typeof exportChartsDataCSV ===
        "function"
    ) {

        exportChartsDataCSV();

    } else {

        alert(
            "CSV export is not available."
        );
    }
}


/* ============================================================
   24. RESET PARAMETERS
   ============================================================ */

function resetParameterValues() {

    Object.keys(
        DEFAULT_PARAMETERS
    ).forEach(function(parameter) {

        simulationParameters[parameter] =
            DEFAULT_PARAMETERS[parameter];

    });


    syncAllInputs();

    updateAllParameterDisplays();


    if (
        typeof setSimulationSpeed ===
        "function"
    ) {

        setSimulationSpeed(
            simulationParameters.speed
        );
    }


    if (
        typeof updateStaticSimulation ===
        "function"
    ) {

        updateStaticSimulation();
    }
}


/* ============================================================
   25. CONTROL LISTENERS
   ============================================================ */

function setupControlListeners() {

    const parameters = [

        "l1",
        "l2",
        "m1",
        "m2",
        "theta1",
        "theta2",
        "g"

    ];


    parameters.forEach(function(parameter) {

        const slider =
            document.getElementById(
                parameter + "Slider"
            );


        const input =
            document.getElementById(
                parameter + "Input"
            );


        /*
           Slider
        */

        if (slider) {

            slider.addEventListener(
                "input",
                function() {

                    updateSimulationParameter(
                        parameter
                    );

                }
            );
        }


        /*
           Number input
        */

        if (input) {

            input.addEventListener(
                "change",
                function() {

                    updateParameterFromInput(
                        parameter
                    );

                }
            );


            input.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        updateParameterFromInput(
                            parameter
                        );
                    }

                }
            );
        }

    });


    /*
       Speed
    */

    const speedSlider =
        document.getElementById(
            "speedSlider"
        );


    const speedInput =
        document.getElementById(
            "speedInput"
        );


    if (speedSlider) {

        speedSlider.addEventListener(
            "input",
            function() {

                updateSimulationParameter(
                    "speed"
                );

            }
        );
    }


    if (speedInput) {

        speedInput.addEventListener(
            "change",
            function() {

                updateParameterFromInput(
                    "speed"
                );

            }
        );
    }
}


/* ============================================================
   26. KEYBOARD CONTROLS
   ============================================================ */

function setupKeyboardControls() {

    document.addEventListener(
        "keydown",
        function(event) {

            const target =
                event.target;


            /*
               Do not activate shortcuts
               while typing into an input.
            */

            if (
                target &&
                (
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT"
                )
            ) {

                return;
            }


            switch (
                event.key.toLowerCase()
            ) {


                case " ":

                    event.preventDefault();


                    if (
                        typeof isSimulationRunning ===
                        "function"
                    ) {

                        if (
                            isSimulationRunning()
                        ) {

                            pauseSimulation();

                        } else {

                            startSimulation();
                        }

                    } else {

                        startSimulation();
                    }

                    break;


                case "r":

                    resetSimulation();

                    break;


                case "s":

                    stepSimulation();

                    break;


                case "t":

                    toggleTrail();

                    break;
            }

        }
    );
}


/* ============================================================
   27. PAGE VISIBILITY
   ============================================================ */

function setupVisibilityHandler() {

    document.addEventListener(
        "visibilitychange",
        function() {

            if (
                document.hidden &&
                typeof isSimulationRunning ===
                "function"
            ) {

                if (
                    isSimulationRunning()
                ) {

                    pauseSimulation();
                }
            }

        }
    );
}


/* ============================================================
   28. DEBUG FUNCTION
   ============================================================ */

function debugControls() {

    console.log(
        "===================================="
    );

    console.log(
        "DOUBLE PENDULUM CONTROL DEBUG"
    );

    console.log(
        "===================================="
    );


    console.log(
        "Parameters:",
        simulationParameters
    );


    console.log(
        "Physics engine:",
        typeof calculatePhysics
    );


    console.log(
        "Simulation engine:",
        typeof startSimulationEngineCore
    );


    console.log(
        "RK4 step:",
        typeof performSimulationStep
    );


    console.log(
        "Charts:",
        typeof initializeCharts
    );


    console.log(
        "===================================="
    );
}


/* ============================================================
   29. DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "controls.js loaded successfully."
        );


        initializeControls();

    }
);


/* ============================================================
   30. GLOBAL EXPORTS
   ============================================================ */

window.getSimulationParameters =
    getSimulationParameters;

window.updateSimulationParameter =
    updateSimulationParameter;

window.updateParameterFromInput =
    updateParameterFromInput;

window.updateParameterDisplay =
    updateParameterDisplay;

window.updateAllParameterDisplays =
    updateAllParameterDisplays;

window.updateSimulationSpeed =
    updateSimulationSpeed;

window.startSimulation =
    startSimulation;

window.pauseSimulation =
    pauseSimulation;

window.resetSimulation =
    resetSimulation;

window.stepSimulation =
    stepSimulation;

window.toggleTrail =
    toggleTrail;

window.clearData =
    clearData;

window.downloadCSV =
    downloadCSV;

window.resetParameterValues =
    resetParameterValues;

window.updateSimulationStatus =
    updateSimulationStatus;

window.updateTimeDisplay =
    updateTimeDisplay;

window.updateResultDisplay =
    updateResultDisplay;

window.debugControls =
    debugControls;


/* ============================================================
   31. LOADED MESSAGE
   ============================================================ */

console.log(
    "=========================================="
);

console.log(
    "Double Pendulum Controls Engine Loaded"
);

console.log(
    "=========================================="
);
