/* =========================================================
   DOUBLE PENDULUM VIRTUAL LAB
   File: simulation.js

   Responsibilities:
   - RK4 numerical integration
   - Simulation time management
   - Canvas rendering
   - Pendulum animation
   - Trail rendering
   - Start / Pause / Reset / Step
   - Result display
   - Chart data collection
   - Energy validation

   Depends on:
   - physics.js
   - controls.js
   - charts.js
   ========================================================= */


/* =========================================================
   CANVAS
   ========================================================= */

let pendulumCanvas = null;
let pendulumCtx = null;


/* =========================================================
   SIMULATION STATE
   ========================================================= */

let simulationState = {
    theta1: degreesToRadians(30),
    omega1: 0,

    theta2: degreesToRadians(40),
    omega2: 0
};


/* =========================================================
   SIMULATION SETTINGS
   ========================================================= */

const SIMULATION_CONFIG = {

    // Physics integration time step
    dt: 0.002,

    // Maximum number of physics steps in one animation frame
    maxSubSteps: 100,

    // Maximum time accumulated per frame
    maxFrameTime: 0.05,

    // Initial simulation speed
    speed: 1.0,

    // Trail maximum points
    maxTrailPoints: 1000,

    // Canvas drawing
    pivotRadius: 7,

    bob1Radius: 13,

    bob2Radius: 16,

    linkWidth: 5
};


/* =========================================================
   RUNTIME VARIABLES
   ========================================================= */

let simulationTime = 0;

let simulationRunning = false;

let animationFrameId = null;

let lastFrameTime = null;

let accumulatedTime = 0;

let simulationSpeed = 1.0;

let trailEnabled = false;

let trailPoints = [];

let initialEnergy = null;

let lastChartUpdateTime = 0;


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeSimulation() {

    pendulumCanvas =
        document.getElementById("pendulumCanvas");

    if (!pendulumCanvas) {

        console.error(
            "Canvas #pendulumCanvas was not found."
        );

        return;
    }


    pendulumCtx =
        pendulumCanvas.getContext("2d");


    /*
       Set canvas resolution according to
       its displayed size while preserving
       high-DPI rendering.
    */

    resizeCanvasForDPI();


    /*
       Get current parameters from controls.js
    */

    const params =
        getCurrentSimulationParameters();


    /*
       Initialize state
    */

    simulationState =
        createInitialState(params);


    /*
       Calculate initial energy
    */

    const energy =
        calculateEnergy(
            simulationState,
            params
        );


    initialEnergy =
        energy.totalEnergy;


    /*
       Draw initial configuration
    */

    drawPendulum();


    /*
       Update result cards
    */

    updateSimulationResults();


    /*
       Update time
    */

    updateTimeDisplay(
        simulationTime
    );


    console.log(
        "Double Pendulum Simulation Engine Loaded"
    );
}


/* =========================================================
   GET PARAMETERS
   ========================================================= */

function getCurrentSimulationParameters() {

    /*
       controls.js provides getSimulationParameters().
    */

    if (typeof getSimulationParameters === "function") {

        const p =
            getSimulationParameters();

        return {

            m1: Number(p.m1),
            m2: Number(p.m2),

            l1: Number(p.l1),
            l2: Number(p.l2),

            g: Number(p.g),

            speed:
                Number(p.speed || simulationSpeed)
        };
    }


    /*
       Fallback parameters
       in case controls.js is not ready.
    */

    return {

        m1: 1.0,
        m2: 1.0,

        l1: 0.8,
        l2: 0.8,

        g: 9.81,

        speed: simulationSpeed
    };
}


/* =========================================================
   CREATE INITIAL STATE
   ========================================================= */

function createInitialState(params) {

    return {

        theta1:
            degreesToRadians(
                Number(params.theta1 || 30)
            ),

        omega1: 0,

        theta2:
            degreesToRadians(
                Number(params.theta2 || 40)
            ),

        omega2: 0
    };
}


/* =========================================================
   STATE CLONING
   ========================================================= */

function cloneState(state) {

    return {

        theta1: state.theta1,

        omega1: state.omega1,

        theta2: state.theta2,

        omega2: state.omega2
    };
}


/* =========================================================
   STATE ADDITION
   ========================================================= */

function addState(
    state,
    derivative,
    scale
) {

    return {

        theta1:
            state.theta1 +
            derivative.theta1 * scale,

        omega1:
            state.omega1 +
            derivative.omega1 * scale,

        theta2:
            state.theta2 +
            derivative.theta2 * scale,

        omega2:
            state.omega2 +
            derivative.omega2 * scale
    };
}


/* =========================================================
   RK4 INTEGRATION
   ========================================================= */

/**
 * Fourth-order Runge-Kutta integration.
 *
 * State:
 *
 * x = [theta1, omega1, theta2, omega2]
 *
 * dx/dt =
 *
 * [omega1, alpha1, omega2, alpha2]
 *
 * RK4:
 *
 * k1 = f(x)
 * k2 = f(x + dt*k1/2)
 * k3 = f(x + dt*k2/2)
 * k4 = f(x + dt*k3)
 *
 * x_new =
 * x + dt/6*(k1 + 2k2 + 2k3 + k4)
 */

function rk4Step(
    state,
    params,
    dt
) {

    /*
       k1
    */

    const k1 =
        calculateDerivatives(
            state,
            params
        );


    /*
       k2
    */

    const state2 =
        addState(
            state,
            k1,
            dt / 2
        );

    const k2 =
        calculateDerivatives(
            state2,
            params
        );


    /*
       k3
    */

    const state3 =
        addState(
            state,
            k2,
            dt / 2
        );

    const k3 =
        calculateDerivatives(
            state3,
            params
        );


    /*
       k4
    */

    const state4 =
        addState(
            state,
            k3,
            dt
        );

    const k4 =
        calculateDerivatives(
            state4,
            params
        );


    /*
       Combine RK4 terms
    */

    const newState = {

        theta1:
            state.theta1 +
            (dt / 6) *
            (
                k1.theta1 +
                2 * k2.theta1 +
                2 * k3.theta1 +
                k4.theta1
            ),

        omega1:
            state.omega1 +
            (dt / 6) *
            (
                k1.omega1 +
                2 * k2.omega1 +
                2 * k3.omega1 +
                k4.omega1
            ),

        theta2:
            state.theta2 +
            (dt / 6) *
            (
                k1.theta2 +
                2 * k2.theta2 +
                2 * k3.theta2 +
                k4.theta2
            ),

        omega2:
            state.omega2 +
            (dt / 6) *
            (
                k1.omega2 +
                2 * k2.omega2 +
                2 * k3.omega2 +
                k4.omega2
            )
    };


    /*
       Keep angles numerically bounded.
    */

    newState.theta1 =
        normalizeAngle(
            newState.theta1
        );

    newState.theta2 =
        normalizeAngle(
            newState.theta2
        );


    return newState;
}


/* =========================================================
   START SIMULATION
   ========================================================= */

function startSimulationEngineCore() {

    if (simulationRunning) {
        return;
    }


    simulationRunning = true;

    lastFrameTime = performance.now();

    accumulatedTime = 0;


    /*
       Update status
    */

    updateSimulationCanvasStatus(
        "running",
        "Simulation Running"
    );


    /*
       Start animation loop
    */

    animationFrameId =
        requestAnimationFrame(
            simulationAnimationLoop
        );
}


/* =========================================================
   PAUSE SIMULATION
   ========================================================= */

function pauseSimulationEngineCore() {

    simulationRunning = false;


    if (animationFrameId !== null) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }


    lastFrameTime = null;

    accumulatedTime = 0;


    updateSimulationCanvasStatus(
        "paused",
        "Simulation Paused"
    );


    /*
       Draw the latest state
    */

    drawPendulum();


    /*
       Force chart update
    */

    if (
        typeof forceChartUpdate === "function"
    ) {

        forceChartUpdate();
    }
}


/* =========================================================
   RESET SIMULATION
   ========================================================= */

function resetSimulationEngineCore() {

    /*
       Stop simulation
    */

    simulationRunning = false;


    if (animationFrameId !== null) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }


    lastFrameTime = null;

    accumulatedTime = 0;


    /*
       Get current parameters.
    */

    const params =
        getCurrentSimulationParameters();


    /*
       Recreate initial state.
    */

    simulationState =
        createInitialState(
            params
        );


    /*
       Reset time.
    */

    simulationTime = 0;


    /*
       Clear trail.
    */

    trailPoints = [];


    /*
       Calculate initial energy.
    */

    const energy =
        calculateEnergy(
            simulationState,
            params
        );


    initialEnergy =
        energy.totalEnergy;


    /*
       Draw.
    */

    drawPendulum();


    /*
       Update UI.
    */

    updateSimulationResults();

    updateTimeDisplay(
        simulationTime
    );


    updateSimulationCanvasStatus(
        "ready",
        "Ready"
    );


    /*
       Force chart update.
    */

    if (
        typeof forceChartUpdate === "function"
    ) {

        forceChartUpdate();
    }
}


/* =========================================================
   SINGLE SIMULATION STEP
   ========================================================= */

function performSimulationStep() {

    const params =
        getCurrentSimulationParameters();


    /*
       Perform exactly one RK4 physics step.
    */

    simulationState =
        rk4Step(
            simulationState,
            params,
            SIMULATION_CONFIG.dt
        );


    simulationTime +=
        SIMULATION_CONFIG.dt;


    /*
       Update trail.
    */

    updateTrail();


    /*
       Update result cards.
    */

    updateSimulationResults();


    /*
       Add data to charts.
    */

    addCurrentDataToCharts();


    /*
       Draw.
    */

    drawPendulum();


    /*
       Update time.
    */

    updateTimeDisplay(
        simulationTime
    );
}


/* =========================================================
   ANIMATION LOOP
   ========================================================= */

function simulationAnimationLoop(
    currentTime
) {

    if (!simulationRunning) {
        return;
    }


    /*
       Calculate real elapsed time.
    */

    if (lastFrameTime === null) {

        lastFrameTime =
            currentTime;
    }


    let frameTime =
        (currentTime - lastFrameTime) /
        1000;


    lastFrameTime =
        currentTime;


    /*
       Protect simulation from
       huge time jumps.
    */

    frameTime =
        Math.min(
            frameTime,
            SIMULATION_CONFIG.maxFrameTime
        );


    /*
       Apply simulation speed.
    */

    accumulatedTime +=
        frameTime *
        simulationSpeed;


    /*
       Run fixed-size physics steps.
    */

    let subSteps = 0;


    while (
        accumulatedTime >=
            SIMULATION_CONFIG.dt &&

        subSteps <
            SIMULATION_CONFIG.maxSubSteps
    ) {

        performSimulationStep();

        accumulatedTime -=
            SIMULATION_CONFIG.dt;

        subSteps++;
    }


    /*
       Draw once per animation frame.
    */

    drawPendulum();


    /*
       Continue animation.
    */

    animationFrameId =
        requestAnimationFrame(
            simulationAnimationLoop
        );
}


/* =========================================================
   SPEED CONTROL
   ========================================================= */

function setSimulationSpeed(speed) {

    const value =
        Number(speed);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        simulationSpeed = 1.0;

    } else {

        simulationSpeed = value;
    }
}


/* =========================================================
   TRAIL CONTROL
   ========================================================= */

function setTrailEnabled(enabled) {

    trailEnabled =
        Boolean(enabled);


    if (!trailEnabled) {

        trailPoints = [];
    }


    drawPendulum();
}


/* =========================================================
   TRAIL UPDATE
   ========================================================= */

function updateTrail() {

    if (!trailEnabled) {
        return;
    }


    const params =
        getCurrentSimulationParameters();


    const positions =
        calculatePositions(
            simulationState,
            params
        );


    trailPoints.push({

        x: positions.x2,

        y: positions.y2
    });


    /*
       Prevent unlimited memory usage.
    */

    if (
        trailPoints.length >
        SIMULATION_CONFIG.maxTrailPoints
    ) {

        trailPoints.shift();
    }
}


/* =========================================================
   STATIC SIMULATION UPDATE
   ========================================================= */

/**
 * Called when the user changes parameters
 * while simulation is not running.
 */

function updateStaticSimulation() {

    if (simulationRunning) {
        return;
    }


    const params =
        getCurrentSimulationParameters();


    /*
       Update initial angles.
    */

    simulationState =
        createInitialState(
            params
        );


    simulationTime = 0;


    trailPoints = [];


    const energy =
        calculateEnergy(
            simulationState,
            params
        );


    initialEnergy =
        energy.totalEnergy;


    drawPendulum();

    updateSimulationResults();

    updateTimeDisplay(
        simulationTime
    );
}


/* =========================================================
   UPDATE RESULTS
   ========================================================= */

function updateSimulationResults() {

    const params =
        getCurrentSimulationParameters();


    const physics =
        calculatePhysics(
            simulationState,
            params
        );


    /*
       Angular positions
    */

    if (
        typeof updateResultDisplay === "function"
    ) {

        updateResultDisplay(
            "resultTheta1",
            radiansToDegrees(
                simulationState.theta1
            )
        );

        updateResultDisplay(
            "resultTheta2",
            radiansToDegrees(
                simulationState.theta2
            )
        );


        /*
           Angular velocities
        */

        updateResultDisplay(
            "resultOmega1",
            simulationState.omega1
        );

        updateResultDisplay(
            "resultOmega2",
            simulationState.omega2
        );


        /*
           Angular accelerations
        */

        updateResultDisplay(
            "resultAlpha1",
            physics.alpha1
        );

        updateResultDisplay(
            "resultAlpha2",
            physics.alpha2
        );


        /*
           Energy
        */

        updateResultDisplay(
            "resultKE",
            physics.kineticEnergy
        );

        updateResultDisplay(
            "resultPE",
            physics.potentialEnergy
        );

        updateResultDisplay(
            "resultTotalEnergy",
            physics.totalEnergy
        );
    }


    /*
       Energy validation
    */

    if (
        typeof updateEnergyValidation === "function"
    ) {

        updateEnergyValidation(
            initialEnergy,
            physics.totalEnergy
        );
    }
}


/* =========================================================
   ADD DATA TO CHARTS
   ========================================================= */

function addCurrentDataToCharts() {

    if (
        typeof addSimulationData !== "function"
    ) {

        return;
    }


    const params =
        getCurrentSimulationParameters();


    const physics =
        calculatePhysics(
            simulationState,
            params
        );


    addSimulationData(

        simulationTime,

        radiansToDegrees(
            simulationState.theta1
        ),

        radiansToDegrees(
            simulationState.theta2
        ),

        simulationState.omega1,

        simulationState.omega2,

        physics.alpha1,

        physics.alpha2,

        physics.kineticEnergy,

        physics.potentialEnergy,

        physics.totalEnergy
    );
}


/* =========================================================
   CANVAS DPI
   ========================================================= */

function resizeCanvasForDPI() {

    if (!pendulumCanvas) {
        return;
    }


    const rect =
        pendulumCanvas.getBoundingClientRect();


    if (
        rect.width === 0 ||
        rect.height === 0
    ) {

        return;
    }


    const dpr =
        window.devicePixelRatio || 1;


    pendulumCanvas.width =
        rect.width * dpr;

    pendulumCanvas.height =
        rect.height * dpr;


    pendulumCtx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}


/* =========================================================
   CANVAS CLEAR
   ========================================================= */

function clearCanvas() {

    if (
        !pendulumCtx ||
        !pendulumCanvas
    ) {

        return;
    }


    const rect =
        pendulumCanvas.getBoundingClientRect();


    pendulumCtx.clearRect(
        0,
        0,
        rect.width,
        rect.height
    );
}


/* =========================================================
   DRAW PENDULUM
   ========================================================= */

function drawPendulum() {

    if (
        !pendulumCanvas ||
        !pendulumCtx
    ) {

        return;
    }


    const params =
        getCurrentSimulationParameters();


    const positions =
        calculatePositions(
            simulationState,
            params
        );


    const rect =
        pendulumCanvas.getBoundingClientRect();


    const canvasWidth =
        rect.width;


    const canvasHeight =
        rect.height;


    clearCanvas();


    /*
       Background
    */

    drawCanvasBackground(
        canvasWidth,
        canvasHeight
    );


    /*
       Determine scale.

       The complete pendulum length is:

       L = l1 + l2

       We keep sufficient margin around
       the pendulum.
    */

    const totalLength =
        params.l1 +
        params.l2;


    const scale =
        Math.min(
            canvasHeight * 0.40 /
                totalLength,

            canvasWidth * 0.35 /
                totalLength
        );


    /*
       Pivot position.
    */

    const pivotX =
        canvasWidth / 2;


    const pivotY =
        canvasHeight * 0.20;


    /*
       Convert physical coordinates
       to canvas coordinates.

       Physics:
       y positive upward.

       Canvas:
       y positive downward.

       Therefore:

       canvasY = pivotY - y*scale
    */

    const x1 =
        pivotX +
        positions.x1 * scale;


    const y1 =
        pivotY -
        positions.y1 * scale;


    const x2 =
        pivotX +
        positions.x2 * scale;


    const y2 =
        pivotY -
        positions.y2 * scale;


    /*
       Draw trail first.
    */

    if (trailEnabled) {

        drawTrail(
            pivotX,
            pivotY,
            scale
        );
    }


    /*
       Draw pivot support.
    */

    drawPivotSupport(
        pivotX,
        pivotY
    );


    /*
       Draw first link.
    */

    drawLink(
        pivotX,
        pivotY,
        x1,
        y1
    );


    /*
       Draw second link.
    */

    drawLink(
        x1,
        y1,
        x2,
        y2
    );


    /*
       Draw masses.
    */

    drawBob(
        x1,
        y1,
        SIMULATION_CONFIG.bob1Radius,
        "m₁"
    );


    drawBob(
        x2,
        y2,
        SIMULATION_CONFIG.bob2Radius,
        "m₂"
    );


    /*
       Draw angle indicators.
    */

    drawAngleIndicator(
        pivotX,
        pivotY,
        simulationState.theta1,
        Math.min(55, params.l1 * scale * 0.25)
    );


    drawAngleIndicator(
        x1,
        y1,
        simulationState.theta2,
        Math.min(45, params.l2 * scale * 0.25)
    );
}


/* =========================================================
   BACKGROUND
   ========================================================= */

function drawCanvasBackground(
    width,
    height
) {

    pendulumCtx.save();


    /*
       Background
    */

    pendulumCtx.fillStyle =
        "#f8fafc";

    pendulumCtx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
       Engineering grid
    */

    pendulumCtx.strokeStyle =
        "#e2e8f0";

    pendulumCtx.lineWidth = 1;


    const gridSize = 25;


    for (
        let x = 0;
        x <= width;
        x += gridSize
    ) {

        pendulumCtx.beginPath();

        pendulumCtx.moveTo(
            x,
            0
        );

        pendulumCtx.lineTo(
            x,
            height
        );

        pendulumCtx.stroke();
    }


    for (
        let y = 0;
        y <= height;
        y += gridSize
    ) {

        pendulumCtx.beginPath();

        pendulumCtx.moveTo(
            0,
            y
        );

        pendulumCtx.lineTo(
            width,
            y
        );

        pendulumCtx.stroke();
    }


    pendulumCtx.restore();
}


/* =========================================================
   PIVOT SUPPORT
   ========================================================= */

function drawPivotSupport(
    x,
    y
) {

    pendulumCtx.save();


    /*
       Vertical support
    */

    pendulumCtx.strokeStyle =
        "#334155";

    pendulumCtx.lineWidth = 4;

    pendulumCtx.beginPath();

    pendulumCtx.moveTo(
        x,
        y - 65
    );

    pendulumCtx.lineTo(
        x,
        y
    );

    pendulumCtx.stroke();


    /*
       Horizontal mounting plate
    */

    pendulumCtx.lineWidth = 6;

    pendulumCtx.beginPath();

    pendulumCtx.moveTo(
        x - 45,
        y - 65
    );

    pendulumCtx.lineTo(
        x + 45,
        y - 65
    );

    pendulumCtx.stroke();


    /*
       Pivot
    */

    pendulumCtx.fillStyle =
        "#0f172a";

    pendulumCtx.beginPath();

    pendulumCtx.arc(
        x,
        y,
        SIMULATION_CONFIG.pivotRadius,
        0,
        2 * Math.PI
    );

    pendulumCtx.fill();


    pendulumCtx.restore();
}


/* =========================================================
   LINK
   ========================================================= */

function drawLink(
    x1,
    y1,
    x2,
    y2
) {

    pendulumCtx.save();


    /*
       Outer link
    */

    pendulumCtx.strokeStyle =
        "#0f766e";

    pendulumCtx.lineWidth =
        SIMULATION_CONFIG.linkWidth;

    pendulumCtx.lineCap =
        "round";


    pendulumCtx.beginPath();

    pendulumCtx.moveTo(
        x1,
        y1
    );

    pendulumCtx.lineTo(
        x2,
        y2
    );

    pendulumCtx.stroke();


    /*
       Highlight
    */

    pendulumCtx.strokeStyle =
        "#14b8a6";

    pendulumCtx.lineWidth = 2;


    pendulumCtx.beginPath();

    pendulumCtx.moveTo(
        x1,
        y1
    );

    pendulumCtx.lineTo(
        x2,
        y2
    );

    pendulumCtx.stroke();


    pendulumCtx.restore();
}


/* =========================================================
   BOB / MASS
   ========================================================= */

function drawBob(
    x,
    y,
    radius,
    label
) {

    pendulumCtx.save();


    /*
       Shadow
    */

    pendulumCtx.fillStyle =
        "rgba(0,0,0,0.15)";

    pendulumCtx.beginPath();

    pendulumCtx.arc(
        x + 3,
        y + 4,
        radius,
        0,
        2 * Math.PI
    );

    pendulumCtx.fill();


    /*
       Main mass
    */

    pendulumCtx.fillStyle =
        "#0f766e";

    pendulumCtx.beginPath();

    pendulumCtx.arc(
        x,
        y,
        radius,
        0,
        2 * Math.PI
    );

    pendulumCtx.fill();


    /*
       Border
    */

    pendulumCtx.strokeStyle =
        "#064e3b";

    pendulumCtx.lineWidth = 2;

    pendulumCtx.stroke();


    /*
       Label
    */

    pendulumCtx.fillStyle =
        "#ffffff";

    pendulumCtx.font =
        "bold 12px Arial";

    pendulumCtx.textAlign =
        "center";

    pendulumCtx.textBaseline =
        "middle";


    pendulumCtx.fillText(
        label,
        x,
        y
    );


    pendulumCtx.restore();
}


/* =========================================================
   ANGLE INDICATOR
   ========================================================= */

function drawAngleIndicator(
    originX,
    originY,
    angle,
    radius
) {

    if (radius < 5) {
        return;
    }


    pendulumCtx.save();


    pendulumCtx.strokeStyle =
        "rgba(15,118,110,0.65)";

    pendulumCtx.lineWidth = 2;


    /*
       Downward vertical direction.

       Canvas angle:
       90 degrees corresponds to downward.

       Because our physics angle is measured
       from downward vertical:
       canvasAngle = PI/2 + theta
    */

    const startAngle =
        Math.PI / 2;


    const endAngle =
        Math.PI / 2 + angle;


    pendulumCtx.beginPath();

    pendulumCtx.arc(
        originX,
        originY,
        radius,
        startAngle,
        endAngle,
        angle < 0
    );

    pendulumCtx.stroke();


    pendulumCtx.restore();
}


/* =========================================================
   TRAIL
   ========================================================= */

function drawTrail(
    pivotX,
    pivotY,
    scale
) {

    if (
        trailPoints.length < 2
    ) {

        return;
    }


    pendulumCtx.save();


    pendulumCtx.lineWidth = 2;

    pendulumCtx.strokeStyle =
        "rgba(15,118,110,0.35)";


    pendulumCtx.beginPath();


    trailPoints.forEach(
        (point, index) => {

            const x =
                pivotX +
                point.x * scale;


            const y =
                pivotY -
                point.y * scale;


            if (index === 0) {

                pendulumCtx.moveTo(
                    x,
                    y
                );

            } else {

                pendulumCtx.lineTo(
                    x,
                    y
                );
            }
        }
    );


    pendulumCtx.stroke();

    pendulumCtx.restore();
}


/* =========================================================
   TIME DISPLAY
   ========================================================= */

function updateTimeDisplay(
    time
) {

    if (
        typeof window.updateTimeDisplay ===
        "function"
    ) {

        window.updateTimeDisplay(
            time
        );

        return;
    }


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
   STATUS
   ========================================================= */

function updateSimulationCanvasStatus(
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
   RESIZE HANDLER
   ========================================================= */

function handleCanvasResize() {

    if (!pendulumCanvas) {
        return;
    }


    resizeCanvasForDPI();

    drawPendulum();
}


/* =========================================================
   PARAMETER CHANGE HANDLER
   ========================================================= */

function onSimulationParameterChanged() {

    /*
       Do not alter a running simulation.
       The new parameters will be picked up
       by the next physics step.
    */

    if (!simulationRunning) {

        updateStaticSimulation();
    }
}


/* =========================================================
   RESET TRAIL
   ========================================================= */

function clearSimulationTrail() {

    trailPoints = [];

    drawPendulum();
}


/* =========================================================
   GET CURRENT STATE
   ========================================================= */

function getSimulationState() {

    return cloneState(
        simulationState
    );
}


/* =========================================================
   GET SIMULATION TIME
   ========================================================= */

function getSimulationTime() {

    return simulationTime;
}


/* =========================================================
   GET RUNNING STATUS
   ========================================================= */

function isSimulationRunning() {

    return simulationRunning;
}


/* =========================================================
   GET CURRENT PHYSICS RESULTS
   ========================================================= */

function getCurrentPhysicsResults() {

    const params =
        getCurrentSimulationParameters();


    return calculatePhysics(
        simulationState,
        params
    );
}


/* =========================================================
   DEBUG INFORMATION
   ========================================================= */

function printSimulationState() {

    const physics =
        getCurrentPhysicsResults();


    console.log(
        "========== SIMULATION STATE =========="
    );


    console.log(
        "Time:",
        simulationTime.toFixed(4),
        "s"
    );


    console.log(
        "Theta 1:",
        radiansToDegrees(
            simulationState.theta1
        ).toFixed(4),
        "deg"
    );


    console.log(
        "Omega 1:",
        simulationState.omega1.toFixed(4),
        "rad/s"
    );


    console.log(
        "Alpha 1:",
        physics.alpha1.toFixed(4),
        "rad/s²"
    );


    console.log(
        "Theta 2:",
        radiansToDegrees(
            simulationState.theta2
        ).toFixed(4),
        "deg"
    );


    console.log(
        "Omega 2:",
        simulationState.omega2.toFixed(4),
        "rad/s"
    );


    console.log(
        "Alpha 2:",
        physics.alpha2.toFixed(4),
        "rad/s²"
    );


    console.log(
        "Kinetic Energy:",
        physics.kineticEnergy.toFixed(6),
        "J"
    );


    console.log(
        "Potential Energy:",
        physics.potentialEnergy.toFixed(6),
        "J"
    );


    console.log(
        "Total Energy:",
        physics.totalEnergy.toFixed(6),
        "J"
    );


    console.log(
        "======================================="
    );
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        /*
           Avoid shortcuts while typing.
        */

        const tag =
            event.target.tagName
                .toLowerCase();


        if (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select"
        ) {

            return;
        }


        /*
           F = fullscreen simulation
        */

        if (
            event.key.toLowerCase() === "f"
        ) {

            toggleSimulationFullscreen();
        }

    }
);


/* =========================================================
   FULLSCREEN SIMULATION
   ========================================================= */

function toggleSimulationFullscreen() {

    const container =
        document.querySelector(
            ".simulation-container"
        );


    if (!container) {
        return;
    }


    if (!document.fullscreenElement) {

        if (
            container.requestFullscreen
        ) {

            container.requestFullscreen();
        }

    } else {

        if (
            document.exitFullscreen
        ) {

            document.exitFullscreen();
        }
    }
}


/* =========================================================
   FULLSCREEN RESIZE
   ========================================================= */

document.addEventListener(
    "fullscreenchange",
    function() {

        setTimeout(
            function() {

                resizeCanvasForDPI();

                drawPendulum();

            },
            100
        );
    }
);


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function() {

        handleCanvasResize();

    }
);


/* =========================================================
   DOM INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Simulation.js: DOM loaded");

    setTimeout(function () {

        initializeSimulation();

    }, 100);

});


/* =========================================================
   PUBLIC SIMULATION API
   ========================================================= */

/*
   Functions used by controls.js:

   startSimulationEngineCore()
   pauseSimulationEngineCore()
   resetSimulationEngineCore()
   performSimulationStep()
   setSimulationSpeed()
   setTrailEnabled()
   updateStaticSimulation()

   Additional useful functions:

   getSimulationState()
   getSimulationTime()
   isSimulationRunning()
   getCurrentPhysicsResults()
   printSimulationState()
   clearSimulationTrail()
*/
