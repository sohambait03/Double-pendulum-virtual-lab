/* =========================================================
   DOUBLE PENDULUM VIRTUAL LAB
   controls.js
   ========================================================= */

let simulationParameters = {
    m1: 1.0,
    m2: 1.0,

    l1: 0.8,
    l2: 0.8,

    theta1: 30,
    theta2: 40,

    g: 9.81,

    speed: 1.0
};


/* =========================================================
   DEFAULT PARAMETERS
   ========================================================= */

const DEFAULT_PARAMETERS = {
    m1: 1.0,
    m2: 1.0,

    l1: 0.8,
    l2: 0.8,

    theta1: 30,
    theta2: 40,

    g: 9.81,

    speed: 1.0
};


/* =========================================================
   GET PARAMETERS
   ========================================================= */

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


/* =========================================================
   INITIALIZE CONTROLS
   ========================================================= */

function initializeControls() {

    console.log("Controls.js loaded");

    updateAllParameterDisplays();

    syncAllInputs();

    updateSimulationStatus(
        "ready",
        "Ready"
    );

    updateTimeDisplay(0);

    /*
       Initialize result cards
    */

    updateElement("resultTheta1", "30.00");
    updateElement("resultTheta2", "40.00");

    updateElement("resultOmega1", "0.000");
    updateElement("resultOmega2", "0.000");

    updateElement("resultAlpha1", "0.000");
    updateElement("resultAlpha2", "0.000");

    updateElement("resultKE", "0.000");
    updateElement("resultPE", "0.000");
    updateElement("resultTotalEnergy", "0.000");
}


/* =========================================================
   SYNC ALL INPUTS
   ========================================================= */

function syncAllInputs() {

    syncInput(
        "l1Slider",
        "l1Input",
        simulationParameters.l1
    );

    syncInput(
        "l2Slider",
        "l2Input",
        simulationParameters.l2
    );

    syncInput(
        "m1Slider",
        "m1Input",
        simulationParameters.m1
    );

    syncInput(
        "m2Slider",
        "m2Input",
        simulationParameters.m2
    );

    syncInput(
        "theta1Slider",
        "theta1Input",
        simulationParameters.theta1
    );

    syncInput(
        "theta2Slider",
        "theta2Input",
        simulationParameters.theta2
    );

    syncInput(
        "gSlider",
        "gInput",
        simulationParameters.g
    );

    syncInput(
        "speedSlider",
        "speedInput",
        simulationParameters.speed
    );
}


/* =========================================================
   SYNC INDIVIDUAL INPUT
   ========================================================= */

function syncInput(
    sliderId,
    inputId,
    value
) {

    const slider =
        document.getElementById(sliderId);

    const input =
        document.getElementById(inputId);


    if (slider) {

        slider.value = value;
    }


    if (input) {

        input.value = value;
    }
}


/* =========================================================
   UPDATE PARAMETER
   ========================================================= */

function updateSimulationParameter(parameter) {

    console.log(
        "Updating parameter:",
        parameter
    );


    const slider =
        document.getElementById(
            parameter + "Slider"
        );


    const input =
        document.getElementById(
            parameter + "Input"
        );


    /*
       Determine which element triggered
       the update.
    */

    let value;


    if (
        document.activeElement === input
    ) {

        value =
            parseFloat(input.value);

    } else if (slider) {

        value =
            parseFloat(slider.value);

    } else {

        value =
            parseFloat(input?.value);
    }


    /*
       Safety check
    */

    if (!Number.isFinite(value)) {

        console.warn(
            "Invalid value for:",
            parameter
        );

        return;
    }


    /*
       Parameter limits
    */

    const limits = {

        l1: {
            min: 0.2,
            max: 2.0
        },

        l2: {
            min: 0.2,
            max: 2.0
        },

        m1: {
            min: 0.1,
            max: 5.0
        },

        m2: {
            min: 0.1,
            max: 5.0
        },

        theta1: {
            min: -180,
            max: 180
        },

        theta2: {
            min: -180,
            max: 180
        },

        g: {
            min: 0,
            max: 20
        },

        speed: {
            min: 0.1,
            max: 5.0
        }
    };


    /*
       Clamp value
    */

    if (limits[parameter]) {

        value =
            Math.max(
                limits[parameter].min,
                Math.min(
                    limits[parameter].max,
                    value
                )
            );
    }


    /*
       Save value
    */

    simulationParameters[parameter] =
        value;


    /*
       Synchronize both controls
    */

    if (slider) {

        slider.value = value;
    }


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
       Update simulation if available
    */

    if (
        typeof onSimulationParameterChanged ===
        "function"
    ) {

        onSimulationParameterChanged();
    }


    console.log(
        parameter,
        "=",
        value
    );
}


/* =========================================================
   UPDATE DISPLAY VALUE
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

        console.warn(
            "Display element not found:",
            parameter + "Value"
        );

        return;
    }


    let text;


    switch (parameter) {

        case "l1":
        case "l2":

            text =
                Number(value).toFixed(2) +
                " m";

            break;


        case "m1":
        case "m2":

            text =
                Number(value).toFixed(2) +
                " kg";

            break;


        case "theta1":
        case "theta2":

            text =
                Number(value).toFixed(1) +
                "°";

            break;


        case "g":

            text =
                Number(value).toFixed(2) +
                " m/s²";

            break;


        case "speed":

            text =
                Number(value).toFixed(1) +
                "×";

            break;


        default:

            text =
                Number(value).toFixed(2);
    }


    display.textContent = text;
}


/* =========================================================
   UPDATE ALL DISPLAY VALUES
   ========================================================= */

function updateAllParameterDisplays() {

    updateParameterDisplay(
        "l1",
        simulationParameters.l1
    );

    updateParameterDisplay(
        "l2",
        simulationParameters.l2
    );

    updateParameterDisplay(
        "m1",
        simulationParameters.m1
    );

    updateParameterDisplay(
        "m2",
        simulationParameters.m2
    );

    updateParameterDisplay(
        "theta1",
        simulationParameters.theta1
    );

    updateParameterDisplay(
        "theta2",
        simulationParameters.theta2
    );

    updateParameterDisplay(
        "g",
        simulationParameters.g
    );

    updateParameterDisplay(
        "speed",
        simulationParameters.speed
    );
}


/* =========================================================
   SPEED
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
        document.activeElement === input
    ) {

        value =
            parseFloat(input.value);

    } else {

        value =
            parseFloat(slider.value);
    }


    if (!Number.isFinite(value)) {
        return;
    }


    value =
        Math.max(
            0.1,
            Math.min(
                5.0,
                value
            )
        );


    simulationParameters.speed =
        value;


    slider.value = value;

    input.value = value;


    updateParameterDisplay(
        "speed",
        value
    );


    if (
        typeof setSimulationSpeed ===
        "function"
    ) {

        setSimulationSpeed(value);
    }
}


/* =========================================================
   STATUS
   ========================================================= */

function updateSimulationStatus(
    status,
    text
) {

    const statusElement =
        document.getElementById(
            "simulationStatus"
        );

    const textElement =
        document.getElementById(
            "statusText"
        );


    if (statusElement) {

        statusElement.className =
            "simulation-status " +
            status;
    }


    if (textElement) {

        textElement.textContent =
            text;
    }
}


/* =========================================================
   TIME
   ========================================================= */

function updateTimeDisplay(time) {

    const element =
        document.getElementById(
            "timeDisplay"
        );


    if (element) {

        element.textContent =
            Number(time).toFixed(2) +
            " s";
    }
}


/* =========================================================
   RESULT DISPLAY
   ========================================================= */

function updateResultDisplay(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        Number(value).toFixed(3);
}


/* =========================================================
   GENERIC ELEMENT UPDATE
   ========================================================= */

function updateElement(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;
    }
}


/* =========================================================
   START
   ========================================================= */

function startSimulationEngine() {

    console.log(
        "Start button pressed"
    );


    if (
        typeof startSimulationEngineCore ===
        "function"
    ) {

        startSimulationEngineCore();

    } else {

        console.error(
            "startSimulationEngineCore() not found"
        );
    }
}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseSimulationEngine() {

    console.log(
        "Pause button pressed"
    );


    if (
        typeof pauseSimulationEngineCore ===
        "function"
    ) {

        pauseSimulationEngineCore();

    } else {

        console.error(
            "pauseSimulationEngineCore() not found"
        );
    }
}


/* =========================================================
   RESET
   ========================================================= */

function resetSimulationEngine() {

    console.log(
        "Reset button pressed"
    );


    if (
        typeof resetSimulationEngineCore ===
        "function"
    ) {

        resetSimulationEngineCore();

    } else {

        console.error(
            "resetSimulationEngineCore() not found"
        );
    }
}


/* =========================================================
   STEP
   ========================================================= */

function stepSimulationEngine() {

    console.log(
        "Step button pressed"
    );


    if (
        typeof performSimulationStep ===
        "function"
    ) {

        performSimulationStep();

    } else {

        console.error(
            "performSimulationStep() not found"
        );
    }
}


/* =========================================================
   TRAIL
   ========================================================= */

let trailEnabled = false;


function toggleSimulationTrail() {

    trailEnabled =
        !trailEnabled;


    if (
        typeof setTrailEnabled ===
        "function"
    ) {

        setTrailEnabled(
            trailEnabled
        );
    }


    const button =
        document.getElementById(
            "trailButton"
        );


    if (button) {

        button.textContent =
            trailEnabled
                ? "◉ Trail ON"
                : "◌ Trail";
    }
}


/* =========================================================
   CLEAR DATA
   ========================================================= */

function clearSimulationData() {

    if (
        typeof clearChartData ===
        "function"
    ) {

        clearChartData();
    }
}


/* =========================================================
   EXPORT CSV
   ========================================================= */

function exportSimulationCSV() {

    if (
        typeof exportChartsDataCSV ===
        "function"
    ) {

        exportChartsDataCSV();

    } else {

        console.error(
            "CSV export function not found."
        );
    }
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const tag =
            event.target.tagName.toLowerCase();


        if (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select"
        ) {

            return;
        }


        if (event.code === "Space") {

            event.preventDefault();


            if (
                typeof isSimulationRunning ===
                "function" &&
                isSimulationRunning()
            ) {

                pauseSimulationEngine();

            } else {

                startSimulationEngine();
            }
        }


        if (
            event.key.toLowerCase() === "r"
        ) {

            resetSimulationEngine();
        }


        if (
            event.key.toLowerCase() === "s"
        ) {

            stepSimulationEngine();
        }
    }
);


/* =========================================================
   VISIBILITY
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.hidden &&
            typeof isSimulationRunning ===
            "function" &&
            isSimulationRunning()
        ) {

            pauseSimulationEngine();
        }
    }
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeControls();

    }
);
