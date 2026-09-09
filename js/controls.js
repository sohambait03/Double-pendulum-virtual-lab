/* ============================================================
   DOUBLE PENDULUM VIRTUAL LAB
   controls.js

   Handles:
   - Sliders
   - Number inputs
   - Parameter displays
   - Start / Pause / Reset / Step
   - Simulation speed
   - Trail
   - CSV controls
   - Keyboard shortcuts
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
   3. GET SIMULATION PARAMETERS
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

    console.log(
        "Initializing controls..."
    );


    /*
       Synchronize HTML controls
    */

    syncAllInputs();


    /*
       Update displayed values
    */

    updateAllParameterDisplays();


    /*
       Set simulation speed
    */

    updateSimulationSpeed(
        simulationParameters.speed
    );


    /*
       Add event listeners
    */

    setupControlListeners();


    /*
       Keyboard shortcuts
    */

    setupKeyboardControls();


    console.log(
        "Controls initialized successfully."
    );
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


    parameters.forEach(
        parameter => {

            syncInput(parameter);

        }
    );
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
   7. UPDATE SIMULATION PARAMETER
   ============================================================

   This function is called by the HTML sliders.

   Example:

   oninput="updateSimulationParameter('l1')"

   ============================================================ */

function updateSimulationParameter(
    parameter
) {

    const slider =
        document.getElementById(
            parameter + "Slider"
        );


    const input =
        document.getElementById(
            parameter + "Input"
        );


    /*
       Check slider
    */

    if (!slider) {

        console.error(
            "Slider not found:",
            parameter + "Slider"
        );

        return;
    }


    /*
       Read slider value
    */

    const value =
        parseFloat(
            slider.value
        );


    /*
       Validate
    */

    if (!Number.isFinite(value)) {

        console.error(
            "Invalid value for:",
            parameter
        );

        return;
    }


    /*
       Store parameter
    */

    simulationParameters[parameter] =
        value;


    /*
       Synchronize number input
    */

    if (input) {

        input.value = value;
    }


    /*
       Update visible value
    */

    updateParameterDisplay(
        parameter,
        value
    );


    /*
       Speed requires special handling
    */

    if (parameter === "speed") {

        updateSimulationSpeed(
            value
        );

        return;
    }


    /*
       Update stopped simulation
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

function updateParameterFromInput(
    parameter
) {

    const input =
        document.getElementById(
            parameter + "Input"
        );


    const slider =
        document.getElementById(
            parameter + "Slider"
        );


    if (!input) {

        console.error(
            "Input not found:",
            parameter + "Input"
        );

        return;
    }


    let value =
        parseFloat(
            input.value
        );


    /*
       Validate
    */

    if (!Number.isFinite(value)) {

        syncInput(parameter);

        updateParameterDisplay(
            parameter,
            simulationParameters[parameter]
        );

        return;
    }


    /*
       Respect slider minimum
       and maximum
    */

    if (slider) {

        const min =
            parseFloat(
                slider.min
            );


        const max =
            parseFloat(
                slider.max
            );


        if (
            Number.isFinite(min) &&
            value < min
        ) {

            value = min;
        }


        if (
            Number.isFinite(max) &&
            value > max
        ) {

            value = max;
        }


        /*
           Update slider
        */

        slider.value = value;
    }


    /*
       Store value
    */

    simulationParameters[parameter] =
        value;


    /*
       Update input
    */

    input.value = value;


    /*
       Update display
    */

    updateParameterDisplay(
        parameter,
        value
    );


    /*
       Update speed
    */

    if (parameter === "speed") {

        updateSimulationSpeed(
            value
        );

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
   9. UPDATE PARAMETER DISPLAY
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
                value.toFixed(2) +
                " m";

            break;


        case "m1":

        case "m2":

            display.textContent =
                value.toFixed(2) +
                " kg";

            break;


        case "theta1":

        case "theta2":

            display.textContent =
                value.toFixed(1) +
                "°";

            break;


        case "g":

            display.textContent =
                value.toFixed(2) +
                " m/s²";

            break;


        case "speed":

            display.textContent =
                value.toFixed(1) +
                "×";

            break;


        default:

            display.textContent =
                value;
    }
}


/* ============================================================
   10. UPDATE ALL PARAMETER DISPLAYS
   ============================================================ */

function updateAllParameterDisplays() {

    Object.keys(
        simulationParameters
    ).forEach(
        parameter => {

            updateParameterDisplay(
                parameter,
                simulationParameters[parameter]
            );

        }
    );
}


/* ============================================================
   11. UPDATE SIMULATION SPEED
   ============================================================ */

function updateSimulationSpeed(
    value
) {

    const speed =
        parseFloat(value);


    if (!Number.isFinite(speed)) {

        return;
    }


    simulationParameters.speed =
        speed;


    /*
       Update slider
    */

    const slider =
        document.getElementById(
            "speedSlider"
        );


    if (slider) {

        slider.value =
            speed;
    }


    /*
       Update number input
    */

    const input =
        document.getElementById(
            "speedInput"
        );


    if (input) {

        input.value =
            speed;
    }


    /*
       Update display
    */

    const display =
        document.getElementById(
            "speedValue"
        );


    if (display) {

        display.textContent =
            speed.toFixed(1) +
            "×";
    }


    /*
       Tell simulation engine
    */

    if (
        typeof setSimulationSpeed ===
        "function"
    ) {

        setSimulationSpeed(
            speed
        );
    }
}


/* ============================================================
   12. SPEED COMPATIBILITY FUNCTION
   ============================================================ */

function updateSpeed() {

    updateSimulationParameter(
        "speed"
    );
}


/* ============================================================
   13. START SIMULATION
   ============================================================ */

function startSimulation() {

    console.log(
        "Start button pressed."
    );


    if (
        typeof startSimulationEngineCore ===
        "function"
    ) {

        startSimulationEngineCore();

    } else {

        console.error(
            "startSimulationEngineCore() is not available."
        );

        alert(
            "Simulation engine is not loaded.\n\n" +
            "Please check js/simulation.js."
        );
    }
}


/* ============================================================
   14. PAUSE SIMULATION
   ============================================================ */

function pauseSimulation() {

    console.log(
        "Pause button pressed."
    );


    if (
        typeof pauseSimulationEngineCore ===
        "function"
    ) {

        pauseSimulationEngineCore();

    } else {

        console.error(
            "pauseSimulationEngineCore() is not available."
        );
    }
}


/* ============================================================
   15. RESET SIMULATION
   ============================================================ */

function resetSimulation() {

    console.log(
        "Reset button pressed."
    );


    if (
        typeof resetSimulationEngineCore ===
        "function"
    ) {

        resetSimulationEngineCore();

    } else {

        console.error(
            "resetSimulationEngineCore() is not available."
        );
    }
}


/* ============================================================
   16. STEP SIMULATION
   ============================================================ */

function stepSimulation() {

    console.log(
        "Step button pressed."
    );


    if (
        typeof performSimulationStep ===
        "function"
    ) {

        performSimulationStep();

    } else {

        console.error(
            "performSimulationStep() is not available."
        );
    }
}


/* ============================================================
   17. TRAIL TOGGLE
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

        setTrailEnabled(
            enabled
        );

    } else {

        console.error(
            "setTrailEnabled() is not available."
        );
    }
}


/* ============================================================
   18. SIMULATION STATUS
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
   19. UPDATE TIME DISPLAY
   ============================================================ */

function updateTimeDisplay(
    time
) {

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
   20. UPDATE RESULT DISPLAY
   ============================================================ */

function updateResultDisplay(
    results
) {

    if (!results) {

        return;
    }


    updateElement(
        "resultTheta1",
        formatNumber(
            results.theta1,
            2
        ) + "°"
    );


    updateElement(
        "resultTheta2",
        formatNumber(
            results.theta2,
            2
        ) + "°"
    );


    updateElement(
        "resultOmega1",
        formatNumber(
            results.omega1,
            3
        ) + " rad/s"
    );


    updateElement(
        "resultOmega2",
        formatNumber(
            results.omega2,
            3
        ) + " rad/s"
    );


    updateElement(
        "resultAlpha1",
        formatNumber(
            results.alpha1,
            3
        ) + " rad/s²"
    );


    updateElement(
        "resultAlpha2",
        formatNumber(
            results.alpha2,
            3
        ) + " rad/s²"
    );


    updateElement(
        "resultKE",
        formatNumber(
            results.kineticEnergy,
            4
        ) + " J"
    );


    updateElement(
        "resultPE",
        formatNumber(
            results.potentialEnergy,
            4
        ) + " J"
    );


    updateElement(
        "resultTotalEnergy",
        formatNumber(
            results.totalEnergy,
            4
        ) + " J"
    );
}


/* ============================================================
   21. SAFE ELEMENT UPDATE
   ============================================================ */

function updateElement(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


/* ============================================================
   22. NUMBER FORMATTING
   ============================================================ */

function formatNumber(
    value,
    decimals = 2
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
   23. CLEAR DATA
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


    /*
       Clear observation table
    */

    const tableBody =
        document.getElementById(
            "observationTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = "";
    }


    console.log(
        "Simulation data cleared."
    );
}


/* ============================================================
   24. DOWNLOAD CSV
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

        console.error(
            "exportChartsDataCSV() is not available."
        );

        alert(
            "CSV export is not available."
        );
    }
}


/* ============================================================
   25. RESET PARAMETER VALUES
   ============================================================ */

function resetParameterValues() {

    Object.keys(
        DEFAULT_PARAMETERS
    ).forEach(
        parameter => {

            simulationParameters[parameter] =
                DEFAULT_PARAMETERS[parameter];

        }
    );


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
   26. SETUP CONTROL LISTENERS
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
       Sliders
    */

    parameters.forEach(
        parameter => {

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
               Number input
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

        }
    );


    /*
       Speed slider
    */

    const speedSlider =
        document.getElementById(
            "speedSlider"
        );


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
       Speed number input
    */

    const speedInput =
        document.getElementById(
            "speedInput"
        );


    if (speedInput) {

        speedInput.addEventListener(
            "change",
            function () {

                updateParameterFromInput(
                    "speed"
                );

            }
        );


        speedInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    updateParameterFromInput(
                        "speed"
                    );
                }

            }
        );
    }
}


/* ============================================================
   27. KEYBOARD SHORTCUTS
   ============================================================ */

function setupKeyboardControls() {

    document.addEventListener(
        "keydown",
        function (event) {

            /*
               Ignore shortcuts when typing.
            */

            const target =
                event.target;


            if (
                target &&
                (
                    target.tagName ===
                    "INPUT" ||

                    target.tagName ===
                    "TEXTAREA" ||

                    target.tagName ===
                    "SELECT"
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
   28. PAGE VISIBILITY
   ============================================================ */

function setupVisibilityHandler() {

    document.addEventListener(
        "visibilitychange",
        function () {

            /*
               Pause simulation if browser tab
               becomes hidden.
            */

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
   29. DEBUG CONTROLS
   ============================================================ */

function debugControls() {

    console.log(
        "===================================="
    );

    console.log(
        "DOUBLE PENDULUM CONTROLS DEBUG"
    );

    console.log(
        "===================================="
    );


    console.log(
        "Parameters:",
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


    parameters.forEach(
        parameter => {

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


            console.log(
                parameter,
                {

                    sliderExists:
                        !!slider,

                    sliderValue:
                        slider
                            ? slider.value
                            : null,

                    inputExists:
                        !!input,

                    inputValue:
                        input
                            ? input.value
                            : null,

                    displayExists:
                        !!display,

                    displayValue:
                        display
                            ? display.textContent
                            : null
                }
            );
        }
    );


    console.log(
        "Simulation engine:",
        typeof startSimulationEngineCore
    );


    console.log(
        "Physics engine:",
        typeof calculatePhysics
    );


    console.log(
        "===================================="
    );
}


/* ============================================================
   30. VISIBILITY INITIALIZATION
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
   31. GLOBAL FUNCTIONS
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
   32. LOADED MESSAGE
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
