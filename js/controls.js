/* =========================================================
   DOUBLE PENDULUM VIRTUAL LAB
   controls.js

   Purpose:
   - Control simulation
   - Handle user inputs
   - Synchronize sliders and number inputs
   - Update result display
   - Control simulation status
   - Handle speed and trail
   - Connect UI with physics/simulation engine
   ========================================================= */


/* =========================================================
   GLOBAL SIMULATION PARAMETERS
   ========================================================= */

let simulationParameters = {

    m1: 1.00,

    m2: 1.00,

    l1: 0.80,

    l2: 0.80,

    theta1: 30.00,

    theta2: 40.00,

    g: 9.81,

    speed: 1.00

};


/* =========================================================
   SIMULATION CONTROL STATE
   ========================================================= */

let simulationRunning = false;

let trailEnabled = false;


/* =========================================================
   DEFAULT PARAMETERS
   ========================================================= */

const DEFAULT_PARAMETERS = {

    m1: 1.00,

    m2: 1.00,

    l1: 0.80,

    l2: 0.80,

    theta1: 30.00,

    theta2: 40.00,

    g: 9.81,

    speed: 1.00

};


/* =========================================================
   INITIALIZE CONTROLS
   ========================================================= */

function initializeControls() {

    console.log(
        "Initializing simulation controls..."
    );


    /*
       Synchronize all inputs with the parameter object.
    */

    syncAllInputs();


    /*
       Update displayed values.
    */

    updateAllParameterDisplays();


    /*
       Set initial status.
    */

    updateSimulationStatus(
        "stopped",
        "Ready"
    );


    /*
       Update initial results.
    */

    updateResultDisplay({

        theta1:
            simulationParameters.theta1,

        theta2:
            simulationParameters.theta2,

        omega1: 0,

        omega2: 0,

        alpha1: 0,

        alpha2: 0,

        kineticEnergy: 0,

        potentialEnergy: 0,

        totalEnergy: 0

    });


    console.log(
        "Controls initialized successfully."
    );

}


/* =========================================================
   GET PARAMETER
   ========================================================= */

function getSimulationParameters() {

    return {

        m1:
            simulationParameters.m1,

        m2:
            simulationParameters.m2,

        l1:
            simulationParameters.l1,

        l2:
            simulationParameters.l2,

        theta1:
            simulationParameters.theta1,

        theta2:
            simulationParameters.theta2,

        g:
            simulationParameters.g,

        speed:
            simulationParameters.speed

    };

}


/* =========================================================
   UPDATE PARAMETER
   ========================================================= */

/*
   Called from index.html:

   updateParameter("m1")
   updateParameter("theta1")
   etc.
*/

function updateSimulationParameter(parameter) {

    if (
        !simulationParameters.hasOwnProperty(
            parameter
        )
    ) {

        console.error(
            "Unknown simulation parameter:",
            parameter
        );

        return;

    }


    /* =====================================================
       FIND INPUT ELEMENTS
       ===================================================== */

    const slider =
        document.getElementById(
            parameter + "Slider"
        );


    const input =
        document.getElementById(
            parameter + "Input"
        );


    let value;


    /*
       Prefer slider value when slider is used.
    */

    if (
        slider &&
        document.activeElement === slider
    ) {

        value =
            parseFloat(slider.value);

    }

    else if (input) {

        value =
            parseFloat(input.value);

    }

    else if (slider) {

        value =
            parseFloat(slider.value);

    }


    /*
       Validate number.
    */

    if (
        Number.isNaN(value)
    ) {

        console.warn(
            "Invalid value for:",
            parameter
        );

        return;

    }


    /* =====================================================
       GET LIMITS
       ===================================================== */

    let min = -Infinity;

    let max = Infinity;


    if (slider) {

        min =
            parseFloat(slider.min);

        max =
            parseFloat(slider.max);

    }


    if (input) {

        const inputMin =
            parseFloat(input.min);

        const inputMax =
            parseFloat(input.max);


        if (
            !Number.isNaN(inputMin)
        ) {

            min =
                Math.max(
                    min,
                    inputMin
                );

        }


        if (
            !Number.isNaN(inputMax)
        ) {

            max =
                Math.min(
                    max,
                    inputMax
                );

        }

    }


    /*
       Clamp the value to valid range.
    */

    value =
        Math.max(
            min,
            Math.min(
                max,
                value
            )
        );


    /* =====================================================
       UPDATE PARAMETER
       ===================================================== */

    simulationParameters[parameter] =
        value;


    /* =====================================================
       SYNCHRONIZE INPUTS
       ===================================================== */

    if (slider) {

        slider.value =
            value;

    }


    if (input) {

        input.value =
            value;

    }


    /* =====================================================
       UPDATE DISPLAY
       ===================================================== */

    updateParameterDisplay(
        parameter,
        value
    );


    /*
       Tell simulation engine that a parameter changed.
    */

    if (
        typeof onSimulationParameterChanged ===
        "function"
    ) {

        onSimulationParameterChanged(
            parameter,
            value
        );

    }

}


/* =========================================================
   UPDATE PARAMETER DISPLAY
   ========================================================= */

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
                value.toFixed(2) +
                "×";

            break;


        default:

            display.textContent =
                value;

    }

}


/* =========================================================
   UPDATE ALL PARAMETER DISPLAYS
   ========================================================= */

function updateAllParameterDisplays() {

    Object.keys(
        simulationParameters
    ).forEach(

        function(parameter) {

            updateParameterDisplay(

                parameter,

                simulationParameters[
                    parameter
                ]

            );

        }

    );

}


/* =========================================================
   SYNCHRONIZE ALL INPUTS
   ========================================================= */

function syncAllInputs() {

    Object.keys(
        simulationParameters
    ).forEach(

        function(parameter) {

            const slider =
                document.getElementById(
                    parameter + "Slider"
                );


            const input =
                document.getElementById(
                    parameter + "Input"
                );


            const value =
                simulationParameters[
                    parameter
                ];


            if (slider) {

                slider.value =
                    value;

            }


            if (input) {

                input.value =
                    value;

            }

        }

    );

}


/* =========================================================
   UPDATE SIMULATION SPEED
   ========================================================= */

function updateSimulationSpeed() {

    const slider =
        document.getElementById(
            "speedSlider"
        );


    const input =
        document.getElementById(
            "speedInput"
        );


    let value;


    if (
        slider &&
        document.activeElement === slider
    ) {

        value =
            parseFloat(slider.value);

    }

    else if (input) {

        value =
            parseFloat(input.value);

    }

    else {

        return;

    }


    if (
        Number.isNaN(value)
    ) {

        return;

    }


    /*
       Keep speed within valid limits.
    */

    value =
        Math.max(
            0.10,
            Math.min(
                3.00,
                value
            )
        );


    simulationParameters.speed =
        value;


    if (slider) {

        slider.value =
            value;

    }


    if (input) {

        input.value =
            value;

    }


    updateParameterDisplay(
        "speed",
        value
    );


    /*
       Inform simulation engine.
    */

    if (
        typeof setSimulationSpeed ===
        "function"
    ) {

        setSimulationSpeed(
            value
        );

    }

}


/* =========================================================
   START SIMULATION
   ========================================================= */

function startSimulationEngine() {

    simulationRunning = true;


    updateSimulationStatus(
        "running",
        "Running"
    );


    /*
       Call actual simulation engine.
    */

    if (
        typeof startSimulationEngineCore ===
        "function"
    ) {

        startSimulationEngineCore();

    }

    else if (
        typeof startSimulationLoop ===
        "function"
    ) {

        startSimulationLoop();

    }

    else {

        console.log(
            "Simulation engine is not connected yet."
        );

    }

}


/* =========================================================
   PAUSE SIMULATION
   ========================================================= */

function pauseSimulationEngine() {

    simulationRunning = false;


    updateSimulationStatus(
        "paused",
        "Paused"
    );


    if (
        typeof pauseSimulationEngineCore ===
        "function"
    ) {

        pauseSimulationEngineCore();

    }

    else if (
        typeof pauseSimulationLoop ===
        "function"
    ) {

        pauseSimulationLoop();

    }

    else {

        console.log(
            "Simulation engine is not connected yet."
        );

    }


    /*
       Force latest chart update.
    */

    if (
        typeof forceChartUpdate ===
        "function"
    ) {

        forceChartUpdate();

    }

}


/* =========================================================
   RESET SIMULATION
   ========================================================= */

function resetSimulationEngine() {

    simulationRunning = false;


    updateSimulationStatus(
        "stopped",
        "Ready"
    );


    /*
       Reset parameters to default values.
    */

    simulationParameters = {

        m1:
            DEFAULT_PARAMETERS.m1,

        m2:
            DEFAULT_PARAMETERS.m2,

        l1:
            DEFAULT_PARAMETERS.l1,

        l2:
            DEFAULT_PARAMETERS.l2,

        theta1:
            DEFAULT_PARAMETERS.theta1,

        theta2:
            DEFAULT_PARAMETERS.theta2,

        g:
            DEFAULT_PARAMETERS.g,

        speed:
            DEFAULT_PARAMETERS.speed

    };


    /*
       Update HTML inputs.
    */

    syncAllInputs();


    updateAllParameterDisplays();


    /*
       Reset actual simulation.
    */

    if (
        typeof resetSimulationEngineCore ===
        "function"
    ) {

        resetSimulationEngineCore();

    }


    /*
       Clear chart data.
    */

    if (
        typeof resetCharts ===
        "function"
    ) {

        resetCharts();

    }


    /*
       Reset result display.
    */

    updateResultDisplay({

        theta1:
            simulationParameters.theta1,

        theta2:
            simulationParameters.theta2,

        omega1: 0,

        omega2: 0,

        alpha1: 0,

        alpha2: 0,

        kineticEnergy: 0,

        potentialEnergy: 0,

        totalEnergy: 0

    });


    /*
       Reset time.
    */

    updateTimeDisplay(0);


    console.log(
        "Simulation reset."
    );

}


/* =========================================================
   STEP SIMULATION
   ========================================================= */

function stepSimulationEngine() {

    /*
       Step should not continuously run the simulation.
    */

    simulationRunning = false;


    updateSimulationStatus(
        "paused",
        "Step"
    );


    if (
        typeof performSimulationStep ===
        "function"
    ) {

        performSimulationStep();

    }

    else if (
        typeof simulationStep ===
        "function"
    ) {

        simulationStep();

    }

    else {

        console.log(
            "Simulation step function is not connected yet."
        );

    }


    /*
       Update graphs after step.
    */

    if (
        typeof forceChartUpdate ===
        "function"
    ) {

        forceChartUpdate();

    }

}


/* =========================================================
   TRAIL TOGGLE
   ========================================================= */

function toggleSimulationTrail() {

    trailEnabled =
        !trailEnabled;


    const buttons =
        document.querySelectorAll(
            ".btn"
        );


    /*
       Update actual simulation engine.
    */

    if (
        typeof setTrailEnabled ===
        "function"
    ) {

        setTrailEnabled(
            trailEnabled
        );

    }


    /*
       Update button appearance.
    */

    buttons.forEach(

        function(button) {

            if (
                button.textContent
                    .includes("Trail")
            ) {

                if (trailEnabled) {

                    button.classList.add(
                        "active"
                    );

                    button.textContent =
                        "◉ Trail ON";

                }

                else {

                    button.classList.remove(
                        "active"
                    );

                    button.textContent =
                        "◌ Trail";

                }

            }

        }

    );

}


/* =========================================================
   UPDATE SIMULATION STATUS
   ========================================================= */

function updateSimulationStatus(
    status,
    text
) {

    const statusContainer =
        document.getElementById(
            "simulationStatus"
        );


    const statusText =
        document.getElementById(
            "statusText"
        );


    if (statusContainer) {

        statusContainer.classList.remove(

            "status-running",

            "status-paused",

            "status-stopped"

        );


        switch (status) {

            case "running":

                statusContainer.classList.add(
                    "status-running"
                );

                break;


            case "paused":

                statusContainer.classList.add(
                    "status-paused"
                );

                break;


            default:

                statusContainer.classList.add(
                    "status-stopped"
                );

        }

    }


    if (statusText) {

        statusText.textContent =
            text;

    }

}


/* =========================================================
   UPDATE TIME DISPLAY
   ========================================================= */

function updateTimeDisplay(time) {

    const element =
        document.getElementById(
            "timeDisplay"
        );


    if (!element) {

        return;

    }


    element.textContent =
        Number(time).toFixed(3) +
        " s";

}


/* =========================================================
   UPDATE RESULT DISPLAY
   ========================================================= */

function updateResultDisplay(data) {


    if (!data) {

        return;

    }


    /*
       Angular displacement
    */

    updateElement(
        "resultTheta1",
        formatNumber(
            data.theta1,
            2
        )
    );


    updateElement(
        "resultTheta2",
        formatNumber(
            data.theta2,
            2
        )
    );


    /*
       Angular velocity
    */

    updateElement(
        "resultOmega1",
        formatNumber(
            data.omega1,
            3
        )
    );


    updateElement(
        "resultOmega2",
        formatNumber(
            data.omega2,
            3
        )
    );


    /*
       Angular acceleration
    */

    updateElement(
        "resultAlpha1",
        formatNumber(
            data.alpha1,
            3
        )
    );


    updateElement(
        "resultAlpha2",
        formatNumber(
            data.alpha2,
            3
        )
    );


    /*
       Energy
    */

    updateElement(
        "resultKE",
        formatNumber(
            data.kineticEnergy,
            3
        )
    );


    updateElement(
        "resultPE",
        formatNumber(
            data.potentialEnergy,
            3
        )
    );


    updateElement(
        "resultTotalEnergy",
        formatNumber(
            data.totalEnergy,
            3
        )
    );


    /*
       Update energy validation.
    */

    if (
        typeof updateEnergyValidation ===
        "function"
    ) {

        updateEnergyValidation();

    }

}


/* =========================================================
   GENERIC HTML ELEMENT UPDATE
   ========================================================= */

function updateElement(
    elementID,
    value
) {

    const element =
        document.getElementById(
            elementID
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   NUMBER FORMATTER
   ========================================================= */

function formatNumber(
    value,
    decimals
) {

    if (
        value === undefined ||
        value === null ||
        Number.isNaN(value)
    ) {

        return "0.000";

    }


    return Number(value)
        .toFixed(decimals);

}


/* =========================================================
   CLEAR SIMULATION DATA
   ========================================================= */

function clearSimulationData() {

    if (
        typeof clearChartData ===
        "function"
    ) {

        clearChartData();

    }


    updateEnergyValidationAfterClear();


    console.log(
        "Simulation data cleared."
    );

}


/* =========================================================
   RESET ENERGY DISPLAY
   ========================================================= */

function updateEnergyValidationAfterClear() {

    updateElement(
        "initialEnergy",
        "0.000 J"
    );


    updateElement(
        "currentEnergy",
        "0.000 J"
    );


    updateElement(
        "energyError",
        "0.000 %"
    );


    updateElement(
        "energyStatusText",
        "Ready"
    );


    const status =
        document.getElementById(
            "energyStatus"
        );


    if (status) {

        status.classList.remove(
            "warning",
            "error"
        );

        status.classList.add(
            "good"
        );

    }

}


/* =========================================================
   CSV EXPORT
   ========================================================= */

function exportSimulationCSV() {

    /*
       Use the CSV function from charts.js.
    */

    if (
        typeof exportChartsDataCSV ===
        "function"
    ) {

        exportChartsDataCSV();

        return;

    }


    /*
       Backup implementation.
    */

    if (
        typeof getSimulationData !==
        "function"
    ) {

        alert(
            "Simulation data is not available."
        );

        return;

    }


    const data =
        getSimulationData();


    if (
        !data ||
        !data.time ||
        data.time.length === 0
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
        "Alpha1 (rad/s²)," +
        "Alpha2 (rad/s²)," +
        "Kinetic Energy (J)," +
        "Potential Energy (J)," +
        "Total Energy (J)\n";


    for (
        let i = 0;
        i < data.time.length;
        i++
    ) {

        csv +=

            data.time[i].toFixed(6) +
            "," +

            data.theta1[i].toFixed(6) +
            "," +

            data.theta2[i].toFixed(6) +
            "," +

            data.omega1[i].toFixed(6) +
            "," +

            data.omega2[i].toFixed(6) +
            "," +

            data.alpha1[i].toFixed(6) +
            "," +

            data.alpha2[i].toFixed(6) +
            "," +

            data.kineticEnergy[i].toFixed(6) +
            "," +

            data.potentialEnergy[i].toFixed(6) +
            "," +

            data.totalEnergy[i].toFixed(6) +

            "\n";

    }


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "double_pendulum_simulation_data.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   PARAMETER CHANGE CALLBACK
   ========================================================= */

/*
   This function is called whenever the user changes:

   m1
   m2
   l1
   l2
   theta1
   theta2
   g
*/

function onSimulationParameterChanged(
    parameter,
    value
) {

    console.log(
        "Parameter changed:",
        parameter,
        value
    );


    /*
       If the simulation is currently stopped,
       immediately update the displayed model.

       The actual physics update will be handled
       by simulation.js.
    */

    if (
        !simulationRunning
    ) {

        if (
            typeof updateStaticSimulation ===
            "function"
        ) {

            updateStaticSimulation();

        }

    }

}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {


        /*
           Avoid keyboard controls when typing
           inside an input field.
        */

        const activeElement =
            document.activeElement;


        if (
            activeElement &&
            (
                activeElement.tagName ===
                "INPUT" ||

                activeElement.tagName ===
                "TEXTAREA"
            )
        ) {

            return;

        }


        /* Space = Start / Pause */

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();


            if (
                simulationRunning
            ) {

                pauseSimulationEngine();

            }

            else {

                startSimulationEngine();

            }

        }


        /* R = Reset */

        if (
            event.key.toLowerCase() ===
            "r"
        ) {

            resetSimulationEngine();

        }


        /* S = Step */

        if (
            event.key.toLowerCase() ===
            "s"
        ) {

            stepSimulationEngine();

        }

    }

);


/* =========================================================
   HANDLE PAGE VISIBILITY
   ========================================================= */

/*
   Automatically pause the simulation if the user
   changes browser tabs.

   This prevents the simulation from running unnecessarily
   in the background.
*/

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.hidden &&
            simulationRunning
        ) {

            pauseSimulationEngine();

        }

    }
);


/* =========================================================
   INITIALIZE CONTROLS AFTER PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeControls();

    }
);


/* =========================================================
   END OF controls.js
   ========================================================= */
