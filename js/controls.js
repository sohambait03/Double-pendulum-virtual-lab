/* ============================================================
   DOUBLE PENDULUM VIRTUAL LAB
   controls.js
   Parameter controls, sliders, inputs, buttons and UI
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
   3. GET CURRENT PARAMETERS
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

    updateSimulationSpeed(simulationParameters.speed);

    setupControlListeners();

    setupKeyboardControls();

    console.log("Controls initialized successfully.");
}


/* ============================================================
   5. SYNCHRONIZE SLIDERS AND NUMBER INPUTS
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

    parameters.forEach(parameter => {
        syncInput(parameter);
    });
}


function syncInput(parameter) {

    const slider = document.getElementById(parameter + "Slider");
    const input = document.getElementById(parameter + "Input");

    const value = simulationParameters[parameter];

    if (slider) {
        slider.value = value;
    }

    if (input) {
        input.value = value;
    }
}


/* ============================================================
   6. MAIN PARAMETER UPDATE FUNCTION
   ============================================================ */

/*
   This is the most important function for the sliders.

   Example:
   oninput="updateSimulationParameter('l1')"
*/

function updateSimulationParameter(parameter) {

    const slider = document.getElementById(parameter + "Slider");
    const input = document.getElementById(parameter + "Input");

    if (!slider) {

        console.error(
            "Slider not found:",
            parameter + "Slider"
        );

        return;
    }

    const value = parseFloat(slider.value);

    if (!Number.isFinite(value)) {

        console.error(
            "Invalid slider value for:",
            parameter
        );

        return;
    }

    /*
       Store the new value
    */

    simulationParameters[parameter] = value;


    /*
       Synchronize number input
    */

    if (input) {
        input.value = value;
    }


    /*
       Update text displayed beside slider
    */

    updateParameterDisplay(parameter, value);


    /*
       Update simulation speed separately
    */

    if (parameter === "speed") {

        updateSimulationSpeed(value);

        return;
    }


    /*
       Tell simulation engine that a parameter changed
    */

    if (typeof updateStaticSimulation === "function") {

        updateStaticSimulation();

    } else {

        console.warn(
            "updateStaticSimulation() is not available yet."
        );
    }
}


/* ============================================================
   7. UPDATE PARAMETER DISPLAY
   ============================================================ */

function updateParameterDisplay(parameter, value) {

    const display =
        document.getElementById(parameter + "Value");

    if (!display) {

        console.error(
            "Display element not found:",
            parameter + "Value"
        );

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
   8. UPDATE ALL PARAMETER DISPLAYS
   ============================================================ */

function updateAllParameterDisplays() {

    Object.keys(simulationParameters).forEach(parameter => {

        updateParameterDisplay(
            parameter,
            simulationParameters[parameter]
        );

    });
}


/* ============================================================
   9. UPDATE PARAMETER FROM NUMBER INPUT
   ============================================================ */

function updateParameterFromInput(parameter) {

    const input =
        document.getElementById(parameter + "Input");

    const slider =
        document.getElementById(parameter + "Slider");

    if (!input) {

        console.error(
            "Input not found:",
            parameter + "Input"
        );

        return;
    }

    const value = parseFloat(input.value);

    if (!Number.isFinite(value)) {

        syncInput(parameter);

        return;
    }


    /*
       If slider exists, respect its minimum and maximum.
    */

    if (slider) {

        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        if (Number.isFinite(min) && value < min) {

            input.value = min;

            simulationParameters[parameter] = min;

        } else if (Number.isFinite(max) && value > max) {

            input.value = max;

            simulationParameters[parameter] = max;

        } else {

            simulationParameters[parameter] = value;
        }


        /*
           Synchronize slider
        */

        slider.value =
            simulationParameters[parameter];

    } else {

        simulationParameters[parameter] = value;
    }


    updateParameterDisplay(
        parameter,
        simulationParameters[parameter]
    );


    /*
       Update simulation
    */

    if (parameter === "speed") {

        updateSimulationSpeed(
            simulationParameters[parameter]
        );

    } else if (
        typeof updateStaticSimulation === "function"
    ) {

        updateStaticSimulation();
    }
}


/* ============================================================
   10. SIMULATION SPEED
   ============================================================ */

function updateSimulationSpeed(value) {

    const speed = parseFloat(value);

    if (!Number.isFinite(speed)) {
        return;
    }

    simulationParameters.speed = speed;


    /*
       Update slider
    */

    const slider =
        document.getElementById("speedSlider");

    if (slider) {
        slider.value = speed;
    }


    /*
       Update input
    */

    const input =
        document.getElementById("speedInput");

    if (input) {
        input.value = speed;
    }


    /*
       Update display
    */

    const display =
        document.getElementById("speedValue");

    if (display) {

        display.textContent =
            speed.toFixed(1) + "×";
    }


    /*
       Send speed to simulation engine
    */

    if (typeof setSimulationSpeed === "function") {

        setSimulationSpeed(speed);

    }
}


/*
   Compatibility wrapper.

   Your HTML may call:
   updateSpeed()
*/

function updateSpeed() {

    const slider =
        document.getElementById("speedSlider");

    if (!slider) {
        return;
    }

    updateSimulationParameter("speed");
}


/* ============================================================
   11. BUTTON FUNCTIONS
   ============================================================ */

/*
   START
*/

function startSimulation() {

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
            "Simulation engine is not loaded. " +
            "Please check js/simulation.js."
        );
    }
}


/*
   PAUSE
*/

function pauseSimulation() {

    if (
        typeof pauseSimulationEngineCore ===
        "function"
    ) {

        pauseSimulationEngineCore();

    } else {

        console.error(
            "Simulation engine is not loaded."
        );
    }
}


/*
   RESET
*/

function resetSimulation() {

    if (
        typeof resetSimulationEngineCore ===
        "function"
    ) {

        resetSimulationEngineCore();

    } else {

        console.error(
            "Simulation engine is not loaded."
        );
    }
}


/*
   STEP
*/

function stepSimulation() {

    if (
        typeof performSimulationStep ===
        "function"
    ) {

        performSimulationStep();

    } else {

        console.error(
            "Simulation engine is not loaded."
        );
    }
}


/* ============================================================
   12. TRAIL CONTROL
   ============================================================ */

function toggleTrail() {

    const checkbox =
        document.getElementById("trailToggle");

    let enabled = true;

    if (checkbox) {

        enabled = checkbox.checked;

    } else if (
        typeof trailEnabled !== "undefined"
    ) {

        enabled = !trailEnabled;
    }


    if (typeof setTrailEnabled === "function") {

        setTrailEnabled(enabled);

    }
}


/* ============================================================
   13. SIMULATION STATUS
   ============================================================ */

function updateSimulationStatus(status, text) {

    const statusElement =
        document.getElementById("simulationStatus");

    const statusText =
        document.getElementById("statusText");


    if (statusElement) {

        statusElement.className =
            "simulation-status " + status;
    }


    if (statusText && text) {

        statusText.textContent = text;
    }
}


/* ============================================================
   14. TIME DISPLAY
   ============================================================ */

function updateTimeDisplay(time) {

    const element =
        document.getElementById("timeDisplay");

    if (!element) {
        return;
    }

    const t = parseFloat(time);

    if (!Number.isFinite(t)) {
        return;
    }

    element.textContent =
        "Time: " + t.toFixed(2) + " s";
}


/* ============================================================
   15. RESULT DISPLAY
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
        formatNumber(results.omega1, 3) + " rad/s"
    );

    updateElement(
        "resultOmega2",
        formatNumber(results.omega2, 3) + " rad/s"
    );

    updateElement(
        "resultAlpha1",
        formatNumber(results.alpha1, 3) + " rad/s²"
    );

    updateElement(
        "resultAlpha2",
        formatNumber(results.alpha2, 3) + " rad/s²"
    );

    updateElement(
        "resultKE",
        formatNumber(results.kineticEnergy, 4) + " J"
    );

    updateElement(
        "resultPE",
        formatNumber(results.potentialEnergy, 4) + " J"
    );

    updateElement(
        "resultTotalEnergy",
        formatNumber(results.totalEnergy, 4) + " J"
    );
}


/* ============================================================
   16. SAFE DOM UPDATE
   ============================================================ */

function updateElement(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;
    }
}


/* ============================================================
   17. NUMBER FORMATTING
   ============================================================ */

function formatNumber(value, decimals = 2) {

    const number = parseFloat(value);

    if (!Number.isFinite(number)) {

        return "0";
    }

    return number.toFixed(decimals);
}


/* ============================================================
   18. CLEAR DATA
   ============================================================ */

function clearData() {

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

    console.log("Simulation data cleared.");
}


/* ============================================================
   19. DOWNLOAD CSV
   ============================================================ */

function downloadCSV() {

    if (
        typeof exportChartsDataCSV ===
        "function"
    ) {

        exportChartsDataCSV();

    } else {

        console.error(
            "Chart export function is not available."
        );

        alert(
            "CSV export is not available."
        );
    }
}


/* ============================================================
   20. SET DEFAULT PARAMETERS
   ============================================================ */

function resetParameterValues() {

    Object.keys(DEFAULT_PARAMETERS).forEach(parameter => {

        simulationParameters[parameter] =
            DEFAULT_PARAMETERS[parameter];

    });


    syncAllInputs();

    updateAllParameterDisplays();

    updateSimulationSpeed(
        simulationParameters.speed
    );


    if (
        typeof updateStaticSimulation ===
        "function"
    ) {

        updateStaticSimulation();
    }
}


/* ============================================================
   21. CONTROL EVENT LISTENERS
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


    /*
       Slider listeners
    */

    parameters.forEach(parameter => {

        const slider =
            document.getElementById(
                parameter + "Slider"
            );

        if (slider) {

            slider.addEventListener(
                "input",
                function () {

                    updateSimulationParameter(
                        parameter
                    );

                }
            );
        }


        /*
           Number input listeners
        */

        const input =
            document.getElementById(
                parameter + "Input"
            );

        if (input) {

            input.addEventListener(
                "change",
                function () {

                    updateParameterFromInput(
                        parameter
                    );

                }
            );

            input.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

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
       Speed slider
    */

    const speedSlider =
        document.getElementById("speedSlider");

    if (speedSlider) {

        speedSlider.addEventListener(
            "input",
            function () {

                updateSimulationParameter(
                    "speed"
                );

            }
        );
    }


    /*
       Speed input
    */

    const speedInput =
        document.getElementById("speedInput");

    if (speedInput) {

        speedInput.addEventListener(
            "change",
            function () {

                updateParameterFromInput(
                    "speed"
                );

            }
        );
    }
}


/* ============================================================
   22. KEYBOARD CONTROLS
   ============================================================ */

function setupKeyboardControls() {

    document.addEventListener(
        "keydown",
        function (event) {

            /*
               Ignore keyboard shortcuts when typing
            */

            const target =
                event.target;

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


            switch (event.key.toLowerCase()) {

                case " ":

                    event.preventDefault();

                    /*
                       Check simulation state
                    */

                    if (
                        typeof simulationRunning !==
                        "undefined"
                    ) {

                        if (simulationRunning) {

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
   23. PAGE VISIBILITY
   ============================================================ */

function setupVisibilityHandler() {

    document.addEventListener(
        "visibilitychange",
        function () {

            /*
               Pause automatically when the tab
               becomes hidden.
            */

            if (
                document.hidden &&
                typeof simulationRunning !==
                "undefined" &&
                simulationRunning
            ) {

                pauseSimulation();
            }

        }
    );
}


/* ============================================================
   24. INITIALIZE WHEN PAGE LOADS
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "controls.js loaded successfully."
        );

        initializeControls();

        setupVisibilityHandler();

    }
);


/* ============================================================
   25. DEBUG FUNCTION
   ============================================================ */

function debugControls() {

    console.log(
        "=============================="
    );

    console.log(
        "DOUBLE PENDULUM CONTROLS"
    );

    console.log(
        "=============================="
    );

    console.log(
        "Current Parameters:",
        simulationParameters
    );


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


    parameters.forEach(parameter => {

        const slider =
            document.getElementById(
                parameter + "Slider"
            );

        const input =
            document.getElementById(
                parameter + "Input"
            );

        const display =
            document.getElementById(
                parameter + "Value"
            );


        console.log(parameter, {

            sliderExists: !!slider,

            sliderValue:
                slider ? slider.value : null,

            inputExists: !!input,

            inputValue:
                input ? input.value : null,

            displayExists: !!display,

            displayValue:
                display ? display.textContent : null

        });

    });

    console.log(
        "=============================="
    );
}


/* ============================================================
   26. EXPORT GLOBAL FUNCTIONS
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

window.updateSpeed =
    updateSpeed;

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
   END OF controls.js
   ============================================================ */

console.log(
    "Double Pendulum Controls Engine Loaded"
);
