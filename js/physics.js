/* =========================================================
   DOUBLE PENDULUM VIRTUAL LAB
   File: physics.js

   Mathematical Model:
   - Two point masses: m1, m2
   - Two massless rigid links: l1, l2
   - Gravity: g
   - Frictionless joints
   - No air resistance
   - Absolute angles measured from downward vertical

   State:
   {
       theta1 : angular position of link 1 [rad],
       omega1 : angular velocity of link 1 [rad/s],
       theta2 : angular position of link 2 [rad],
       omega2 : angular velocity of link 2 [rad/s]
   }

   Parameters:
   {
       m1 : mass of first bob [kg],
       m2 : mass of second bob [kg],
       l1 : first link length [m],
       l2 : second link length [m],
       g  : gravitational acceleration [m/s^2]
   }
   ========================================================= */


/* =========================================================
   CONSTANTS
   ========================================================= */

const PHYSICS_EPSILON = 1e-12;


/* =========================================================
   ANGLE CONVERSION FUNCTIONS
   ========================================================= */

/**
 * Convert degrees to radians.
 *
 * @param {number} degrees
 * @returns {number} radians
 */
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}


/**
 * Convert radians to degrees.
 *
 * @param {number} radians
 * @returns {number} degrees
 */
function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}


/**
 * Normalize an angle to the range [-PI, PI].
 *
 * @param {number} angle
 * @returns {number} normalized angle
 */
function normalizeAngle(angle) {
    while (angle > Math.PI) {
        angle -= 2 * Math.PI;
    }

    while (angle < -Math.PI) {
        angle += 2 * Math.PI;
    }

    return angle;
}


/* =========================================================
   PARAMETER VALIDATION
   ========================================================= */

/**
 * Validate the physical parameters.
 *
 * @param {Object} params
 * @returns {Object}
 */
function validatePhysicsParameters(params) {

    if (!params) {
        throw new Error("Physics parameters are missing.");
    }

    const m1 = Number(params.m1);
    const m2 = Number(params.m2);
    const l1 = Number(params.l1);
    const l2 = Number(params.l2);
    const g = Number(params.g);

    if (!Number.isFinite(m1) || m1 <= 0) {
        throw new Error("m1 must be greater than zero.");
    }

    if (!Number.isFinite(m2) || m2 <= 0) {
        throw new Error("m2 must be greater than zero.");
    }

    if (!Number.isFinite(l1) || l1 <= 0) {
        throw new Error("l1 must be greater than zero.");
    }

    if (!Number.isFinite(l2) || l2 <= 0) {
        throw new Error("l2 must be greater than zero.");
    }

    if (!Number.isFinite(g) || g < 0) {
        throw new Error("g must be zero or greater.");
    }

    return {
        m1,
        m2,
        l1,
        l2,
        g
    };
}


/* =========================================================
   STATE VALIDATION
   ========================================================= */

/**
 * Validate the pendulum state.
 *
 * @param {Object} state
 * @returns {Object}
 */
function validatePhysicsState(state) {

    if (!state) {
        throw new Error("Pendulum state is missing.");
    }

    const theta1 = Number(state.theta1);
    const omega1 = Number(state.omega1);
    const theta2 = Number(state.theta2);
    const omega2 = Number(state.omega2);

    if (!Number.isFinite(theta1)) {
        throw new Error("theta1 must be a finite number.");
    }

    if (!Number.isFinite(omega1)) {
        throw new Error("omega1 must be a finite number.");
    }

    if (!Number.isFinite(theta2)) {
        throw new Error("theta2 must be a finite number.");
    }

    if (!Number.isFinite(omega2)) {
        throw new Error("omega2 must be a finite number.");
    }

    return {
        theta1,
        omega1,
        theta2,
        omega2
    };
}


/* =========================================================
   DOUBLE PENDULUM MASS MATRIX
   ========================================================= */

/**
 * Calculate the mass/inertia matrix M(q).
 *
 * M =
 *
 * [ (m1+m2)l1^2              m2*l1*l2*cos(theta1-theta2) ]
 *
 * [ m2*l1*l2*cos(theta1-theta2)       m2*l2^2           ]
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculateMassMatrix(state, params) {

    const { theta1, theta2 } = validatePhysicsState(state);
    const { m1, m2, l1, l2 } = validatePhysicsParameters(params);

    const delta = theta1 - theta2;
    const cosDelta = Math.cos(delta);

    const M11 = (m1 + m2) * l1 * l1;

    const M12 = m2 * l1 * l2 * cosDelta;

    const M21 = M12;

    const M22 = m2 * l2 * l2;

    return {
        M11,
        M12,
        M21,
        M22
    };
}


/* =========================================================
   RIGHT-HAND SIDE VECTOR
   ========================================================= */

/**
 * Calculate the RHS vector b.
 *
 * M(q) * q_ddot = b
 *
 * b1 =
 * -m2*l1*l2*omega2^2*sin(delta)
 * -(m1+m2)*g*l1*sin(theta1)
 *
 * b2 =
 * +m2*l1*l2*omega1^2*sin(delta)
 * -m2*g*l2*sin(theta2)
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculateRHS(state, params) {

    const {
        theta1,
        omega1,
        theta2,
        omega2
    } = validatePhysicsState(state);

    const {
        m1,
        m2,
        l1,
        l2,
        g
    } = validatePhysicsParameters(params);

    const delta = theta1 - theta2;

    const sinDelta = Math.sin(delta);

    const b1 =
        -m2 * l1 * l2 * omega2 * omega2 * sinDelta
        -(m1 + m2) * g * l1 * Math.sin(theta1);

    const b2 =
        m2 * l1 * l2 * omega1 * omega1 * sinDelta
        -m2 * g * l2 * Math.sin(theta2);

    return {
        b1,
        b2
    };
}


/* =========================================================
   ANGULAR ACCELERATIONS
   ========================================================= */

/**
 * Calculate angular accelerations.
 *
 * Solves:
 *
 * M11*alpha1 + M12*alpha2 = b1
 * M21*alpha1 + M22*alpha2 = b2
 *
 * using Cramer's rule.
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculateAccelerations(state, params) {

    const M = calculateMassMatrix(state, params);

    const b = calculateRHS(state, params);

    const determinant =
        M.M11 * M.M22 -
        M.M12 * M.M21;

    if (Math.abs(determinant) < PHYSICS_EPSILON) {
        throw new Error(
            "Singular mass matrix. Check pendulum parameters."
        );
    }

    /*
       alpha1 =
       (b1*M22 - M12*b2) / determinant
    */

    const alpha1 =
        (b.b1 * M.M22 -
         M.M12 * b.b2) /
        determinant;


    /*
       alpha2 =
       (M11*b2 - M21*b1) / determinant
    */

    const alpha2 =
        (M.M11 * b.b2 -
         M.M21 * b.b1) /
        determinant;


    return {
        alpha1,
        alpha2
    };
}


/* =========================================================
   FIRST-ORDER STATE DERIVATIVES
   ========================================================= */

/**
 * Convert the second-order equations into
 * first-order state equations.
 *
 * State vector:
 *
 * x = [theta1, omega1, theta2, omega2]
 *
 * Derivative:
 *
 * dx/dt =
 *
 * [ omega1 ]
 * [ alpha1 ]
 * [ omega2 ]
 * [ alpha2 ]
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculateDerivatives(state, params) {

    const validatedState = validatePhysicsState(state);

    const accelerations =
        calculateAccelerations(
            validatedState,
            params
        );

    return {
        theta1: validatedState.omega1,
        omega1: accelerations.alpha1,

        theta2: validatedState.omega2,
        omega2: accelerations.alpha2
    };
}


/* =========================================================
   POSITION CALCULATION
   ========================================================= */

/**
 * Calculate positions of both masses.
 *
 * Coordinate system:
 *
 *           Pivot
 *             |
 *             |
 *             ● m1
 *            /
 *           /
 *          ● m2
 *
 * x = positive right
 * y = positive upward
 *
 * Angles are measured from downward vertical.
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculatePositions(state, params) {

    const {
        theta1,
        theta2
    } = validatePhysicsState(state);

    const {
        l1,
        l2
    } = validatePhysicsParameters(params);


    // First mass

    const x1 =
        l1 * Math.sin(theta1);

    const y1 =
        -l1 * Math.cos(theta1);


    // Second mass

    const x2 =
        l1 * Math.sin(theta1) +
        l2 * Math.sin(theta2);

    const y2 =
        -l1 * Math.cos(theta1) -
        l2 * Math.cos(theta2);


    return {
        x1,
        y1,
        x2,
        y2
    };
}


/* =========================================================
   VELOCITY CALCULATION
   ========================================================= */

/**
 * Calculate Cartesian velocities of both masses.
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculateVelocities(state, params) {

    const {
        theta1,
        omega1,
        theta2,
        omega2
    } = validatePhysicsState(state);

    const {
        l1,
        l2
    } = validatePhysicsParameters(params);


    // Velocity of mass 1

    const vx1 =
        l1 * Math.cos(theta1) * omega1;

    const vy1 =
        l1 * Math.sin(theta1) * omega1;


    // Velocity of mass 2

    const vx2 =
        l1 * Math.cos(theta1) * omega1 +
        l2 * Math.cos(theta2) * omega2;

    const vy2 =
        l1 * Math.sin(theta1) * omega1 +
        l2 * Math.sin(theta2) * omega2;


    return {
        vx1,
        vy1,
        vx2,
        vy2
    };
}


/* =========================================================
   KINETIC ENERGY
   ========================================================= */

/**
 * Calculate kinetic energy.
 *
 * T =
 *
 * 1/2 (m1+m2) l1^2 omega1^2
 *
 * + 1/2 m2 l2^2 omega2^2
 *
 * + m2 l1 l2 omega1 omega2 cos(theta1-theta2)
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {number} kinetic energy [J]
 */
function calculateKineticEnergy(state, params) {

    const {
        theta1,
        omega1,
        theta2,
        omega2
    } = validatePhysicsState(state);

    const {
        m1,
        m2,
        l1,
        l2
    } = validatePhysicsParameters(params);

    const delta = theta1 - theta2;

    const kineticEnergy =

        0.5 *
        (m1 + m2) *
        l1 * l1 *
        omega1 * omega1

        +

        0.5 *
        m2 *
        l2 * l2 *
        omega2 * omega2

        +

        m2 *
        l1 *
        l2 *
        omega1 *
        omega2 *
        Math.cos(delta);


    return kineticEnergy;
}


/* =========================================================
   POTENTIAL ENERGY
   ========================================================= */

/**
 * Calculate gravitational potential energy.
 *
 * Reference:
 * The pivot is taken as y = 0.
 *
 * V =
 *
 * -(m1+m2) g l1 cos(theta1)
 * -m2 g l2 cos(theta2)
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {number} potential energy [J]
 */
function calculatePotentialEnergy(state, params) {

    const {
        theta1,
        theta2
    } = validatePhysicsState(state);

    const {
        m1,
        m2,
        l1,
        l2,
        g
    } = validatePhysicsParameters(params);


    const potentialEnergy =

        -(m1 + m2) *
        g *
        l1 *
        Math.cos(theta1)

        -

        m2 *
        g *
        l2 *
        Math.cos(theta2);


    return potentialEnergy;
}


/* =========================================================
   TOTAL MECHANICAL ENERGY
   ========================================================= */

/**
 * Calculate total mechanical energy.
 *
 * E = T + V
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculateEnergy(state, params) {

    const kineticEnergy =
        calculateKineticEnergy(
            state,
            params
        );

    const potentialEnergy =
        calculatePotentialEnergy(
            state,
            params
        );

    const totalEnergy =
        kineticEnergy +
        potentialEnergy;


    return {
        kineticEnergy,
        potentialEnergy,
        totalEnergy
    };
}


/* =========================================================
   ENERGY ERROR
   ========================================================= */

/**
 * Calculate percentage energy error.
 *
 * @param {number} initialEnergy
 * @param {number} currentEnergy
 * @returns {number}
 */
function calculateEnergyErrorPercentage(
    initialEnergy,
    currentEnergy
) {

    if (!Number.isFinite(initialEnergy) ||
        !Number.isFinite(currentEnergy)) {

        return 0;
    }


    const referenceEnergy =
        Math.max(
            Math.abs(initialEnergy),
            PHYSICS_EPSILON
        );


    return Math.abs(
        (currentEnergy - initialEnergy) /
        referenceEnergy
    ) * 100;
}


/* =========================================================
   COMPLETE PHYSICS CALCULATION
   ========================================================= */

/**
 * Convenience function that calculates all
 * important physical quantities.
 *
 * @param {Object} state
 * @param {Object} params
 * @returns {Object}
 */
function calculatePhysics(state, params) {

    const validatedState =
        validatePhysicsState(state);

    const validatedParams =
        validatePhysicsParameters(params);

    const accelerations =
        calculateAccelerations(
            validatedState,
            validatedParams
        );

    const positions =
        calculatePositions(
            validatedState,
            validatedParams
        );

    const velocities =
        calculateVelocities(
            validatedState,
            validatedParams
        );

    const energy =
        calculateEnergy(
            validatedState,
            validatedParams
        );


    return {

        // Angular quantities

        theta1: validatedState.theta1,

        omega1: validatedState.omega1,

        alpha1: accelerations.alpha1,


        theta2: validatedState.theta2,

        omega2: validatedState.omega2,

        alpha2: accelerations.alpha2,


        // Cartesian positions

        x1: positions.x1,
        y1: positions.y1,

        x2: positions.x2,
        y2: positions.y2,


        // Cartesian velocities

        vx1: velocities.vx1,
        vy1: velocities.vy1,

        vx2: velocities.vx2,
        vy2: velocities.vy2,


        // Energy

        kineticEnergy: energy.kineticEnergy,

        potentialEnergy: energy.potentialEnergy,

        totalEnergy: energy.totalEnergy
    };
}


/* =========================================================
   SMALL-ANGLE LINEAR MODEL
   ========================================================= */

/**
 * Calculate the mass matrix for the
 * small-angle linearized model.
 *
 * [M]{theta_ddot} + [K]{theta} = 0
 *
 * @param {Object} params
 * @returns {Object}
 */
function calculateLinearMassMatrix(params) {

    const {
        m1,
        m2,
        l1,
        l2
    } = validatePhysicsParameters(params);


    return {

        M11:
            (m1 + m2) *
            l1 *
            l1,

        M12:
            m2 *
            l1 *
            l2,

        M21:
            m2 *
            l1 *
            l2,

        M22:
            m2 *
            l2 *
            l2
    };
}


/**
 * Calculate the stiffness matrix
 * for the small-angle approximation.
 *
 * @param {Object} params
 * @returns {Object}
 */
function calculateLinearStiffnessMatrix(params) {

    const {
        m1,
        m2,
        l1,
        l2,
        g
    } = validatePhysicsParameters(params);


    return {

        K11:
            (m1 + m2) *
            g *
            l1,

        K12: 0,

        K21: 0,

        K22:
            m2 *
            g *
            l2
    };
}


/* =========================================================
   DEBUG / TEST FUNCTION
   ========================================================= */

/**
 * Run a basic physics sanity check.
 *
 * This can be called from the browser console:
 *
 *     testDoublePendulumPhysics();
 *
 * @returns {Object}
 */
function testDoublePendulumPhysics() {

    const params = {

        m1: 1.0,
        m2: 1.0,

        l1: 0.8,
        l2: 0.8,

        g: 9.81
    };


    const state = {

        theta1:
            degreesToRadians(30),

        omega1:
            0,

        theta2:
            degreesToRadians(40),

        omega2:
            0
    };


    const result =
        calculatePhysics(
            state,
            params
        );


    console.log(
        "===== DOUBLE PENDULUM PHYSICS TEST ====="
    );

    console.log(
        "State:",
        state
    );

    console.log(
        "Parameters:",
        params
    );

    console.log(
        "Angular acceleration 1:",
        result.alpha1,
        "rad/s²"
    );

    console.log(
        "Angular acceleration 2:",
        result.alpha2,
        "rad/s²"
    );

    console.log(
        "Mass 1 position:",
        result.x1,
        result.y1
    );

    console.log(
        "Mass 2 position:",
        result.x2,
        result.y2
    );

    console.log(
        "Kinetic Energy:",
        result.kineticEnergy,
        "J"
    );

    console.log(
        "Potential Energy:",
        result.potentialEnergy,
        "J"
    );

    console.log(
        "Total Energy:",
        result.totalEnergy,
        "J"
    );

    console.log(
        "=========================================="
    );


    return result;
}


/* =========================================================
   INITIAL PHYSICS OBJECT
   ========================================================= */

/**
 * Default state used when the simulation
 * is first loaded.
 */
const DEFAULT_PHYSICS_STATE = {

    theta1:
        degreesToRadians(30),

    omega1: 0,

    theta2:
        degreesToRadians(40),

    omega2: 0
};


/* =========================================================
   GLOBAL PHYSICS API
   ========================================================= */

/*
   These functions are intentionally kept global
   because simulation.js will use them directly.

   Main functions available to simulation.js:

   calculateAccelerations()
   calculateDerivatives()
   calculatePositions()
   calculateVelocities()
   calculateKineticEnergy()
   calculatePotentialEnergy()
   calculateEnergy()
   calculatePhysics()
   degreesToRadians()
   radiansToDegrees()
   normalizeAngle()
*/


console.log(
    "Double Pendulum Physics Engine Loaded"
);
