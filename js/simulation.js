/* ============================================================
   DOUBLE PENDULUM VIRTUAL LAB
   simulation.js

   Numerical simulation using:
   - Nonlinear double-pendulum equations
   - 4th-order Runge-Kutta integration
   - HTML Canvas visualization
   - Real-time parameter updates
   ============================================================ */


/* ============================================================
   1. CANVAS VARIABLES
   ============================================================ */

let pendulumCanvas = null;
let ctx = null;


/* ============================================================
   2. SIMULATION STATE
   ============================================================ */

let simulationState = {
    theta1: degreesToRadians(30),
    omega1: 0,

    theta2: degreesToRadians(40),
    omega2: 0
};


/* ============================================================
   3. SIMULATION CONFIGURATION
   ============================================================ */

const SIMULATION_CONFIG = {

    /*
       Numerical integration time step.
       Smaller value = better accuracy.
    */

    dt: 0.002,

    /*
       Maximum number of integration steps
       performed during one animation frame.
    */

    maxSubSteps: 100,

    /*
       Maximum real-time frame interval.
    */

    maxFrameTime: 0.05,

    /*
       Default simulation speed.
    */

    speed: 1.0,

    /*
       Maximum number of trail points.
    */

    maxTrailPoints: 1000,

    /*
       Visual dimensions.
    */

    bobRadius: 12,

    linkWidth: 5,

    pivotRadius: 7
};


/* ============================================================
   4. SIMULATION VARIABLES
   ============================================================ */

let simulationTime = 0;

let simulationRunning = false;

let animationFrameId = null;

let lastFrameTime = null;

let accumulatedTime = 0;

let simulationSpeed = 1.0;

let trailEnabled = true;

let trailPoints = [];

let initialEnergy = 0;


/* ============================================================
   5. INITIALIZE SIMULATION
   ============================================================ */

function initializeSimulation() {

    console.log("Initializing simulation engine...");


    /*
       Find canvas
    */

    pendulumCanvas =
        document.getElementById("pendulumCanvas");


    if (!pendulumCanvas) {

        console.error(
            "ERROR: pendulumCanvas not found."
        );

        return;
    }


    /*
       Get drawing context
    */

    ctx =
        pendulumCanvas.getContext("2d");


    if (!ctx) {

        console.error(
            "ERROR: Canvas 2D context unavailable."
        );

        return;
    }


    /*
       Configure canvas
    */

    resizeCanvas();


    /*
       Create initial state
    */

    const parameters =
        getCurrentSimulationParameters();


    simulationState =
        createInitialState(parameters);


    simulationTime = 0;

    accumulatedTime = 0;

    trailPoints = [];


    /*
       Calculate initial energy
    */

    if (
        typeof calculateEnergy ===
        "function"
    ) {

        initialEnergy =
            calculateEnergy(
                simulationState,
                parameters
            );
    }


    /*
       Draw initial configuration
    */

    updateStaticSimulation();


    /*
       Set status
    */

    updateSimulationCanvasStatus(
        "ready",
        "Ready"
    );


    console.log(
        "Simulation engine initialized successfully."
    );
}


/* ============================================================
   6. GET CURRENT PARAMETERS
   ============================================================ */

function getCurrentSimulationParameters() {

    /*
       Prefer controls.js
    */

    if (
        typeof getSimulationParameters ===
        "function"
    ) {

        return getSimulationParameters();
    }


    /*
       Fallback values
    */

    return {

        m1: 1.0,

        m2: 1.0,

        l1: 0.8,

        l2: 0.8,

        theta1: 30.0,

        theta2: 40.0,

        g: 9.81,

        speed: 1.0
    };
}


/* ============================================================
   7. CREATE INITIAL STATE
   ============================================================ */

function createInitialState(parameters) {

    return {

        theta1:
            degreesToRadians(
                parameters.theta1
            ),

        omega1: 0,

        theta2:
            degreesToRadians(
                parameters.theta2
            ),

        omega2: 0
    };
}


/* ============================================================
   8. CLONE STATE
   ============================================================ */

function cloneState(state) {

    return {

        theta1: state.theta1,

        omega1: state.omega1,

        theta2: state.theta2,

        omega2: state.omega2
    };
}


/* ============================================================
   9. ADD STATES
   ============================================================ */

function addState(state, derivative, factor) {

    return {

        theta1:
            state.theta1 +
            derivative.theta1 * factor,

        omega1:
            state.omega1 +
            derivative.omega1 * factor,

        theta2:
            state.theta2 +
            derivative.theta2 * factor,

        omega2:
            state.omega2 +
            derivative.omega2 * factor
    };
}


/* ============================================================
   10. RK4 INTEGRATION
   ============================================================ */

function rk4Step(state, dt, parameters) {

    /*
       k1
    */

    const k1 =
        calculateDerivatives(
            state,
            parameters
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
            parameters
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
            parameters
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
            parameters
        );


    /*
       Final RK4 state
    */

    return {

        theta1:
            state.theta1 +
            dt *
            (
                k1.theta1 +
                2 * k2.theta1 +
                2 * k3.theta1 +
                k4.theta1
            ) / 6,

        omega1:
            state.omega1 +
            dt *
            (
                k1.omega1 +
                2 * k2.omega1 +
                2 * k3.omega1 +
                k4.omega1
            ) / 6,

        theta2:
            state.theta2 +
            dt *
            (
                k1.theta2 +
                2 * k2.theta2 +
                2 * k3.theta2 +
                k4.theta2
            ) / 6,

        omega2:
            state.omega2 +
            dt *
            (
                k1.omega2 +
                2 * k2.omega2 +
                2 * k3.omega2 +
                k4.omega2
            ) / 6
    };
}


/* ============================================================
   11. START SIMULATION
   ============================================================ */

function startSimulationEngineCore() {

    if (simulationRunning) {

        return;
    }


    /*
       Make sure engine exists
    */

    if (!pendulumCanvas || !ctx) {

        initializeSimulation();
    }


    if (!pendulumCanvas || !ctx) {

        console.error(
            "Cannot start simulation: canvas unavailable."
        );

        return;
    }


    simulationRunning = true;

    lastFrameTime = performance.now();

    accumulatedTime = 0;


    updateSimulationCanvasStatus(
        "running",
        "Running"
    );


    /*
       Start animation loop
    */

    if (animationFrameId === null) {

        animationFrameId =
            requestAnimationFrame(
                simulationAnimationLoop
            );
    }


    console.log(
        "Double pendulum simulation started."
    );
}


/* ============================================================
   12. PAUSE SIMULATION
   ============================================================ */

function pauseSimulationEngineCore() {

    simulationRunning = false;

    lastFrameTime = null;

    accumulatedTime = 0;


    updateSimulationCanvasStatus(
        "paused",
        "Paused"
    );


    if (animationFrameId !== null) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }


    console.log(
        "Double pendulum simulation paused."
    );
}


/* ============================================================
   13. RESET SIMULATION
   ============================================================ */

function resetSimulationEngineCore() {

    /*
       Stop animation
    */

    simulationRunning = false;

    lastFrameTime = null;

    accumulatedTime = 0;


    if (animationFrameId !== null) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }


    /*
       Get current parameters
    */

    const parameters =
        getCurrentSimulationParameters();


    /*
       Reset state
    */

    simulationState =
        createInitialState(
            parameters
        );


    simulationTime = 0;

    trailPoints = [];


    /*
       Calculate initial energy
    */

    if (
        typeof calculateEnergy ===
        "function"
    ) {

        initialEnergy =
            calculateEnergy(
                simulationState,
                parameters
            );
    }


    /*
       Redraw
    */

    updateStaticSimulation();


    /*
       Update status
    */

    updateSimulationCanvasStatus(
        "ready",
        "Ready"
    );


    console.log(
        "Double pendulum simulation reset."
    );
}


/* ============================================================
   14. PERFORM ONE SIMULATION STEP
   ============================================================ */

function performSimulationStep() {

    const parameters =
        getCurrentSimulationParameters();


    /*
       Perform one RK4 step
    */

    simulationState =
        rk4Step(
            simulationState,
            SIMULATION_CONFIG.dt,
            parameters
        );


    simulationTime +=
        SIMULATION_CONFIG.dt;


    /*
       Update trail
    */

    updateTrail();


    /*
       Update display
    */

    updateSimulationResults();


    /*
       Update canvas
    */

    drawPendulum();


    /*
       Add data to charts
    */

    addCurrentDataToCharts();
}


/* ============================================================
   15. MAIN ANIMATION LOOP
   ============================================================ */

function simulationAnimationLoop(timestamp) {

    /*
       If paused, stop loop.
    */

    if (!simulationRunning) {

        animationFrameId = null;

        return;
    }


    /*
       Initialize frame timing
    */

    if (lastFrameTime === null) {

        lastFrameTime = timestamp;
    }


    /*
       Calculate real elapsed time
    */

    let frameTime =
        (timestamp - lastFrameTime) / 1000;


    lastFrameTime = timestamp;


    /*
       Prevent huge time jumps
    */

    frameTime =
        Math.min(
            frameTime,
            SIMULATION_CONFIG.maxFrameTime
        );


    /*
       Apply simulation speed
    */

    frameTime *= simulationSpeed;


    accumulatedTime += frameTime;


    /*
       Number of physics steps
    */

    let subSteps = 0;


    /*
       Integrate until accumulated time
       is consumed.
    */

    while (
        accumulatedTime >=
        SIMULATION_CONFIG.dt
        &&
        subSteps <
        SIMULATION_CONFIG.maxSubSteps
    ) {

        const parameters =
            getCurrentSimulationParameters();


        simulationState =
            rk4Step(
                simulationState,
                SIMULATION_CONFIG.dt,
                parameters
            );


        simulationTime +=
            SIMULATION_CONFIG.dt;


        accumulatedTime -=
            SIMULATION_CONFIG.dt;


        subSteps++;
    }


    /*
       Update visualization
    */

    updateTrail();

    updateSimulationResults();

    drawPendulum();

    addCurrentDataToCharts();


    /*
       Continue animation
    */

    animationFrameId =
        requestAnimationFrame(
            simulationAnimationLoop
        );
}


/* ============================================================
   16. SET SIMULATION SPEED
   ============================================================ */

function setSimulationSpeed(speed) {

    const value =
        parseFloat(speed);


    if (!Number.isFinite(value)) {

        return;
    }


    simulationSpeed =
        Math.max(
            0.1,
            Math.min(5.0, value)
        );


    console.log(
        "Simulation speed:",
        simulationSpeed
    );
}


/* ============================================================
   17. SET TRAIL ENABLED
   ============================================================ */

function setTrailEnabled(enabled) {

    trailEnabled =
        Boolean(enabled);


    if (!trailEnabled) {

        trailPoints = [];
    }


    drawPendulum();
}


/* ============================================================
   18. UPDATE TRAIL
   ============================================================ */

function updateTrail() {

    if (!trailEnabled) {

        return;
    }


    if (!pendulumCanvas) {

        return;
    }


    const parameters =
        getCurrentSimulationParameters();


    const positions =
        calculatePositions(
            simulationState,
            parameters
        );


    if (!positions) {

        return;
    }


    /*
       Store second bob position.
    */

    trailPoints.push({

        x: positions.x2,

        y: positions.y2

    });


    /*
       Limit trail size.
    */

    if (
        trailPoints.length >
        SIMULATION_CONFIG.maxTrailPoints
    ) {

        trailPoints.shift();
    }
}


/* ============================================================
   19. UPDATE STATIC SIMULATION
   ============================================================ */

function updateStaticSimulation() {

    /*
       If simulation is running,
       don't reset its state.
    */

    if (simulationRunning) {

        return;
    }


    const parameters =
        getCurrentSimulationParameters();


    /*
       Update speed
    */

    if (
        Number.isFinite(parameters.speed)
    ) {

        setSimulationSpeed(
            parameters.speed
        );
    }


    /*
       Reset initial state when parameters
       change while simulation is stopped.
    */

    simulationState =
        createInitialState(
            parameters
        );


    simulationTime = 0;

    trailPoints = [];


    /*
       Recalculate energy
    */

    if (
        typeof calculateEnergy ===
        "function"
    ) {

        initialEnergy =
            calculateEnergy(
                simulationState,
                parameters
            );
    }


    /*
       Update results
    */

    updateSimulationResults();


    /*
       Draw
    */

    drawPendulum();


    /*
       Update time
    */

    updateTimeDisplay(
        simulationTime
    );
}


/* ============================================================
   20. UPDATE SIMULATION RESULTS
   ============================================================ */

function updateSimulationResults() {

    const parameters =
        getCurrentSimulationParameters();


    /*
       Calculate physics
    */

    if (
        typeof calculatePhysics !==
        "function"
    ) {

        console.error(
            "calculatePhysics() is not available."
        );

        return;
    }


    const physics =
        calculatePhysics(
            simulationState,
            parameters
        );


    if (!physics) {

        return;
    }


    /*
       Prepare results
    */

    const results = {

        theta1:
            radiansToDegrees(
                simulationState.theta1
            ),

        theta2:
            radiansToDegrees(
                simulationState.theta2
            ),

        omega1:
            simulationState.omega1,

        omega2:
            simulationState.omega2,

        alpha1:
            physics.alpha1,

        alpha2:
            physics.alpha2,

        kineticEnergy:
            physics.kineticEnergy,

        potentialEnergy:
            physics.potentialEnergy,

        totalEnergy:
            physics.totalEnergy
    };


    /*
       Send to controls.js
    */

    if (
        typeof updateResultDisplay ===
        "function"
    ) {

        updateResultDisplay(
            results
        );
    }


    /*
       Update time
    */

    if (
        typeof updateTimeDisplay ===
        "function"
    ) {

        updateTimeDisplay(
            simulationTime
        );
    }


    /*
       Energy validation
    */

    updateEnergyValidation(
        physics.totalEnergy
    );
}


/* ============================================================
   21. ADD DATA TO CHARTS
   ============================================================ */

function addCurrentDataToCharts() {

    /*
       Don't add data if charts are unavailable.
    */

    if (
        typeof addSimulationData !==
        "function"
    ) {

        return;
    }


    const parameters =
        getCurrentSimulationParameters();


    const physics =
        calculatePhysics(
            simulationState,
            parameters
        );


    if (!physics) {

        return;
    }


    addSimulationData({

        time:
            simulationTime,

        theta1:
            radiansToDegrees(
                simulationState.theta1
            ),

        theta2:
            radiansToDegrees(
                simulationState.theta2
            ),

        omega1:
            simulationState.omega1,

        omega2:
            simulationState.omega2,

        kineticEnergy:
            physics.kineticEnergy,

        potentialEnergy:
            physics.potentialEnergy,

        totalEnergy:
            physics.totalEnergy

    });
}


/* ============================================================
   22. ENERGY VALIDATION
   ============================================================ */

function updateEnergyValidation(currentEnergy) {

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


    /*
       Initial energy
    */

    if (initialElement) {

        initialElement.textContent =
            initialEnergy.toFixed(4) +
            " J";
    }


    /*
       Current energy
    */

    if (currentElement) {

        currentElement.textContent =
            currentEnergy.toFixed(4) +
            " J";
    }


    /*
       Calculate error
    */

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


    /*
       Determine validation status
    */

    let status = "good";

    let message =
        "Energy conserved";


    if (error > 1.0) {

        status = "warning";

        message =
            "Small numerical energy variation";

    }


    if (error > 5.0) {

        status = "error";

        message =
            "Significant energy error";
    }


    if (statusElement) {

        statusElement.className =
            "energy-status " +
            status;
    }


    if (statusTextElement) {

        statusTextElement.textContent =
            message;
    }
}


/* ============================================================
   23. CANVAS RESIZE
   ============================================================ */

function resizeCanvas() {

    if (!pendulumCanvas || !ctx) {

        return;
    }


    /*
       Support high-DPI displays.
    */

    const rect =
        pendulumCanvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio || 1;


    const width =
        rect.width ||
        pendulumCanvas.width;


    const height =
        rect.height ||
        pendulumCanvas.height;


    /*
       Set actual canvas resolution.
    */

    pendulumCanvas.width =
        width * dpr;

    pendulumCanvas.height =
        height * dpr;


    /*
       Restore CSS size.
    */

    pendulumCanvas.style.width =
        width + "px";

    pendulumCanvas.style.height =
        height + "px";


    /*
       Scale drawing coordinates.
    */

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    drawPendulum();
}


/* ============================================================
   24. CLEAR CANVAS
   ============================================================ */

function clearCanvas() {

    if (!pendulumCanvas || !ctx) {

        return;
    }


    const rect =
        pendulumCanvas.getBoundingClientRect();


    ctx.clearRect(
        0,
        0,
        rect.width,
        rect.height
    );
}


/* ============================================================
   25. DRAW PENDULUM
   ============================================================ */

function drawPendulum() {

    if (!pendulumCanvas || !ctx) {

        return;
    }


    const parameters =
        getCurrentSimulationParameters();


    /*
       Canvas dimensions
    */

    const rect =
        pendulumCanvas.getBoundingClientRect();


    const width =
        rect.width ||
        1050;


    const height =
        rect.height ||
        400;


    /*
       Clear
    */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
       Background
    */

    drawBackground(
        width,
        height
    );


    /*
       Calculate physical positions
    */

    const positions =
        calculatePositions(
            simulationState,
            parameters
        );


    if (!positions) {

        return;
    }


    /*
       Scale physical dimensions to canvas.
    */

    const totalLength =
        parameters.l1 +
        parameters.l2;


    const availableHeight =
        height * 0.72;


    const scale =
        Math.min(
            availableHeight /
                Math.max(totalLength, 0.1),

            width * 0.32 /
                Math.max(totalLength, 0.1)
        );


    /*
       Pivot location
    */

    const pivotX =
        width * 0.5;

    const pivotY =
        height * 0.18;


    /*
       Convert positions.
       Physical y is positive upward/downward
       according to our model, so Canvas y
       is inverted.
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
       Draw trail first
    */

    if (trailEnabled) {

        drawTrail(
            pivotX,
            pivotY,
            scale
        );
    }


    /*
       Draw first link
    */

    drawLink(
        pivotX,
        pivotY,
        x1,
        y1
    );


    /*
       Draw second link
    */

    drawLink(
        x1,
        y1,
        x2,
        y2
    );


    /*
       Draw pivot
    */

    drawPivot(
        pivotX,
        pivotY
    );


    /*
       Draw bobs
    */

    drawBob(
        x1,
        y1,
        parameters.m1,
        "m₁"
    );


    drawBob(
        x2,
        y2,
        parameters.m2,
        "m₂"
    );


    /*
       Draw angle indicators
    */

    drawAngleIndicator(
        pivotX,
        pivotY,
        simulationState.theta1,
        55
    );


    drawAngleIndicator(
        x1,
        y1,
        simulationState.theta2,
        45
    );
}


/* ============================================================
   26. DRAW BACKGROUND
   ============================================================ */

function drawBackground(width, height) {

    /*
       Background
    */

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
       Grid
    */

    ctx.strokeStyle =
        "#eeeeee";

    ctx.lineWidth = 1;


    const gridSize = 25;


    for (
        let x = 0;
        x <= width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y <= height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();
    }
}


/* ============================================================
   27. DRAW LINK
   ============================================================ */

function drawLink(
    xStart,
    yStart,
    xEnd,
    yEnd
) {

    ctx.beginPath();

    ctx.moveTo(
        xStart,
        yStart
    );

    ctx.lineTo(
        xEnd,
        yEnd
    );


    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth =
        SIMULATION_CONFIG.linkWidth;

    ctx.lineCap =
        "round";

    ctx.stroke();
}


/* ============================================================
   28. DRAW PIVOT
   ============================================================ */

function drawPivot(x, y) {

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        SIMULATION_CONFIG.pivotRadius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#222222";

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        SIMULATION_CONFIG.pivotRadius + 3,
        0,
        Math.PI * 2
    );


    ctx.strokeStyle =
        "#555555";

    ctx.lineWidth = 2;

    ctx.stroke();
}


/* ============================================================
   29. DRAW BOB
   ============================================================ */

function drawBob(
    x,
    y,
    mass,
    label
) {

    const radius =
        SIMULATION_CONFIG.bobRadius;


    /*
       Bob
    */

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#333333";

    ctx.fill();


    ctx.strokeStyle =
        "#000000";

    ctx.lineWidth = 2;

    ctx.stroke();


    /*
       Label
    */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.fillText(
        label,
        x,
        y
    );
}


/* ============================================================
   30. DRAW ANGLE INDICATOR
   ============================================================ */

function drawAngleIndicator(
    x,
    y,
    angle,
    radius
) {

    /*
       Reference direction:
       downward vertical.
    */

    const startAngle =
        Math.PI / 2;


    /*
       Canvas angle is clockwise relative
       to mathematical convention.
    */

    const endAngle =
        startAngle +
        angle;


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        startAngle,
        endAngle,
        angle < 0
    );


    ctx.strokeStyle =
        "#888888";

    ctx.lineWidth = 2;

    ctx.stroke();
}


/* ============================================================
   31. DRAW TRAIL
   ============================================================ */

function drawTrail(
    pivotX,
    pivotY,
    scale
) {

    if (
        trailPoints.length <
        2
    ) {

        return;
    }


    ctx.beginPath();


    for (
        let i = 0;
        i < trailPoints.length;
        i++
    ) {

        const point =
            trailPoints[i];


        const x =
            pivotX +
            point.x * scale;


        const y =
            pivotY -
            point.y * scale;


        if (i === 0) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );
        }
    }


    ctx.strokeStyle =
        "rgba(80, 80, 80, 0.35)";

    ctx.lineWidth = 2;

    ctx.lineCap =
        "round";

    ctx.stroke();
}


/* ============================================================
   32. CANVAS STATUS
   ============================================================ */

function updateSimulationCanvasStatus(
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
   33. TIME
   ============================================================ */

function getSimulationTime() {

    return simulationTime;
}


/* ============================================================
   34. STATE GETTER
   ============================================================ */

function getSimulationState() {

    return cloneState(
        simulationState
    );
}


/* ============================================================
   35. RUNNING STATUS
   ============================================================ */

function isSimulationRunning() {

    return simulationRunning;
}


/* ============================================================
   36. PHYSICS STATE
   ============================================================ */

function getSimulationPhysics() {

    const parameters =
        getCurrentSimulationParameters();


    return calculatePhysics(
        simulationState,
        parameters
    );
}


/* ============================================================
   37. CHANGE PARAMETERS
   ============================================================ */

function updateSimulationParameters(
    parameters
) {

    if (!parameters) {

        return;
    }


    /*
       Only update values that exist.
    */

    if (
        Number.isFinite(parameters.m1)
    ) {

        simulationParameters.m1 =
            parameters.m1;
    }


    if (
        Number.isFinite(parameters.m2)
    ) {

        simulationParameters.m2 =
            parameters.m2;
    }


    if (
        Number.isFinite(parameters.l1)
    ) {

        simulationParameters.l1 =
            parameters.l1;
    }


    if (
        Number.isFinite(parameters.l2)
    ) {

        simulationParameters.l2 =
            parameters.l2;
    }


    if (
        Number.isFinite(parameters.theta1)
    ) {

        simulationParameters.theta1 =
            parameters.theta1;
    }


    if (
        Number.isFinite(parameters.theta2)
    ) {

        simulationParameters.theta2 =
            parameters.theta2;
    }


    if (
        Number.isFinite(parameters.g)
    ) {

        simulationParameters.g =
            parameters.g;
    }


    if (
        Number.isFinite(parameters.speed)
    ) {

        setSimulationSpeed(
            parameters.speed
        );
    }


    /*
       Redraw if stopped.
    */

    if (!simulationRunning) {

        updateStaticSimulation();
    }
}


/* ============================================================
   38. DEBUG FUNCTION
   ============================================================ */

function debugSimulation() {

    console.log(
        "================================"
    );

    console.log(
        "DOUBLE PENDULUM SIMULATION DEBUG"
    );

    console.log(
        "================================"
    );


    console.log(
        "Canvas:",
        pendulumCanvas
    );


    console.log(
        "Context:",
        ctx
    );


    console.log(
        "Running:",
        simulationRunning
    );


    console.log(
        "Time:",
        simulationTime
    );


    console.log(
        "State:",
        simulationState
    );


    console.log(
        "Speed:",
        simulationSpeed
    );


    console.log(
        "Trail enabled:",
        trailEnabled
    );


    console.log(
        "Physics function:",
        typeof calculatePhysics
    );


    console.log(
        "Derivative function:",
        typeof calculateDerivatives
    );


    console.log(
        "Parameters function:",
        typeof getSimulationParameters
    );


    console.log(
        "================================"
    );
}


/* ============================================================
   39. FULLSCREEN CANVAS
   ============================================================ */

function toggleFullscreen() {

    if (!pendulumCanvas) {

        return;
    }


    if (!document.fullscreenElement) {

        pendulumCanvas
            .requestFullscreen()
            .catch(
                error => {

                    console.error(
                        "Fullscreen error:",
                        error
                    );

                }
            );

    } else {

        document.exitFullscreen();
    }
}


/* ============================================================
   40. KEYBOARD HANDLING
   ============================================================ */

function handleSimulationKeyboard(event) {

    /*
       Don't interfere with text inputs.
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


    switch (
        event.key.toLowerCase()
    ) {

        case " ":

            event.preventDefault();


            if (simulationRunning) {

                pauseSimulationEngineCore();

            } else {

                startSimulationEngineCore();
            }

            break;


        case "r":

            resetSimulationEngineCore();

            break;


        case "s":

            performSimulationStep();

            break;
    }
}


/* ============================================================
   41. WINDOW RESIZE
   ============================================================ */

window.addEventListener(
    "resize",
    function () {

        resizeCanvas();

    }
);


/* ============================================================
   42. DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "simulation.js loaded."
        );


        /*
           Initialize simulation after
           all required DOM elements exist.
        */

        initializeSimulation();


        /*
           Keyboard shortcuts.
        */

        document.addEventListener(
            "keydown",
            handleSimulationKeyboard
        );

    }
);


/* ============================================================
   43. GLOBAL EXPORTS
   ============================================================ */

window.startSimulationEngineCore =
    startSimulationEngineCore;

window.pauseSimulationEngineCore =
    pauseSimulationEngineCore;

window.resetSimulationEngineCore =
    resetSimulationEngineCore;

window.performSimulationStep =
    performSimulationStep;

window.setSimulationSpeed =
    setSimulationSpeed;

window.setTrailEnabled =
    setTrailEnabled;

window.updateStaticSimulation =
    updateStaticSimulation;

window.updateSimulationResults =
    updateSimulationResults;

window.getSimulationTime =
    getSimulationTime;

window.getSimulationState =
    getSimulationState;

window.isSimulationRunning =
    isSimulationRunning;

window.getSimulationPhysics =
    getSimulationPhysics;

window.updateSimulationParameters =
    updateSimulationParameters;

window.debugSimulation =
    debugSimulation;

window.toggleFullscreen =
    toggleFullscreen;

window.resizeCanvas =
    resizeCanvas;


/* ============================================================
   ENGINE LOADED MESSAGE
   ============================================================ */

console.log(
    "=========================================="
);

console.log(
    "Double Pendulum Simulation Engine Loaded"
);

console.log(
    "=========================================="
);
