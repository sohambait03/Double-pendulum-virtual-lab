/* ============================================================
   DOUBLE PENDULUM VIRTUAL LAB
   physics.js

   Nonlinear planar double pendulum physics engine

   Assumptions:
   - Massless rigid links
   - Point masses m1 and m2
   - Frictionless joints
   - No air resistance
   - Constant gravitational acceleration
   - Planar motion
   - Angles measured from downward vertical
   ============================================================ */


/* ============================================================
   1. ANGLE CONVERSION FUNCTIONS
   ============================================================ */

function degreesToRadians(degrees) {

    return degrees * Math.PI / 180;
}


function radiansToDegrees(radians) {

    return radians * 180 / Math.PI;
}


/* ============================================================
   2. ANGLE NORMALIZATION
   ============================================================ */

function normalizeAngle(angle) {

    while (angle > Math.PI) {

        angle -= 2 * Math.PI;
    }


    while (angle < -Math.PI) {

        angle += 2 * Math.PI;
    }


    return angle;
}


/* ============================================================
   3. VALIDATE PHYSICAL PARAMETERS
   ============================================================ */

function validateParameters(parameters) {

    if (!parameters) {

        return false;
    }


    if (!Number.isFinite(parameters.m1) ||
        parameters.m1 <= 0) {

        return false;
    }


    if (!Number.isFinite(parameters.m2) ||
        parameters.m2 <= 0) {

        return false;
    }


    if (!Number.isFinite(parameters.l1) ||
        parameters.l1 <= 0) {

        return false;
    }


    if (!Number.isFinite(parameters.l2) ||
        parameters.l2 <= 0) {

        return false;
    }


    if (!Number.isFinite(parameters.g) ||
        parameters.g <= 0) {

        return false;
    }


    return true;
}


/* ============================================================
   4. MASS MATRIX
   ============================================================

   M(theta) q_ddot = b

   M11 = (m1+m2)l1²

   M12 = m2 l1 l2 cos(theta1-theta2)

   M21 = M12

   M22 = m2 l2²

   ============================================================ */

function calculateMassMatrix(
    state,
    parameters
) {

    const m1 = parameters.m1;
    const m2 = parameters.m2;

    const l1 = parameters.l1;
    const l2 = parameters.l2;


    const theta1 = state.theta1;
    const theta2 = state.theta2;


    const delta =
        theta1 - theta2;


    const cosDelta =
        Math.cos(delta);


    return {

        M11:
            (m1 + m2) *
            l1 *
            l1,

        M12:
            m2 *
            l1 *
            l2 *
            cosDelta,

        M21:
            m2 *
            l1 *
            l2 *
            cosDelta,

        M22:
            m2 *
            l2 *
            l2
    };
}


/* ============================================================
   5. RIGHT-HAND SIDE VECTOR
   ============================================================

   Equation 1:

   M11 alpha1 + M12 alpha2 = b1

   Equation 2:

   M21 alpha1 + M22 alpha2 = b2

   ============================================================ */

function calculateRHS(
    state,
    parameters
) {

    const m1 = parameters.m1;
    const m2 = parameters.m2;

    const l1 = parameters.l1;
    const l2 = parameters.l2;

    const g = parameters.g;


    const theta1 = state.theta1;
    const theta2 = state.theta2;

    const omega1 = state.omega1;
    const omega2 = state.omega2;


    const delta =
        theta1 - theta2;


    const sinDelta =
        Math.sin(delta);


    /*
       First equation RHS
    */

    const b1 =
        -m2 *
        l1 *
        l2 *
        omega2 *
        omega2 *
        sinDelta

        -

        (m1 + m2) *
        g *
        l1 *
        Math.sin(theta1);


    /*
       Second equation RHS
    */

    const b2 =
        m2 *
        l1 *
        l2 *
        omega1 *
        omega1 *
        sinDelta

        -

        m2 *
        g *
        l2 *
        Math.sin(theta2);


    return {

        b1: b1,

        b2: b2
    };
}


/* ============================================================
   6. CALCULATE ANGULAR ACCELERATIONS
   ============================================================ */

function calculateAccelerations(
    state,
    parameters
) {

    const M =
        calculateMassMatrix(
            state,
            parameters
        );


    const b =
        calculateRHS(
            state,
            parameters
        );


    /*
       Determinant of mass matrix
    */

    const determinant =
        M.M11 * M.M22 -
        M.M12 * M.M21;


    /*
       Prevent division by zero
    */

    if (
        Math.abs(determinant) <
        1e-12
    ) {

        console.error(
            "Mass matrix is singular."
        );

        return {

            alpha1: 0,

            alpha2: 0
        };
    }


    /*
       Solve:

       [M11 M12] [alpha1] = [b1]
       [M21 M22] [alpha2]   [b2]

    */

    const alpha1 =
        (
            b.b1 * M.M22 -
            M.M12 * b.b2
        ) /
        determinant;


    const alpha2 =
        (
            M.M11 * b.b2 -
            M.M21 * b.b1
        ) /
        determinant;


    return {

        alpha1: alpha1,

        alpha2: alpha2
    };
}


/* ============================================================
   7. STATE DERIVATIVES
   ============================================================

   State:

   [theta1, omega1, theta2, omega2]

   Derivative:

   [omega1, alpha1, omega2, alpha2]

   ============================================================ */

function calculateDerivatives(
    state,
    parameters
) {

    const accelerations =
        calculateAccelerations(
            state,
            parameters
        );


    return {

        theta1:
            state.omega1,

        omega1:
            accelerations.alpha1,

        theta2:
            state.omega2,

        omega2:
            accelerations.alpha2
    };
}


/* ============================================================
   8. CALCULATE POSITIONS
   ============================================================

   Coordinate system:

   x = horizontal

   y = positive upward

   Pivot is at:

   (0,0)

   ============================================================ */

function calculatePositions(
    state,
    parameters
) {

    const l1 =
        parameters.l1;

    const l2 =
        parameters.l2;


    const theta1 =
        state.theta1;

    const theta2 =
        state.theta2;


    /*
       First bob
    */

    const x1 =
        l1 *
        Math.sin(theta1);


    const y1 =
        -l1 *
        Math.cos(theta1);


    /*
       Second bob
    */

    const x2 =
        x1 +
        l2 *
        Math.sin(theta2);


    const y2 =
        y1 -
        l2 *
        Math.cos(theta2);


    return {

        x1: x1,

        y1: y1,

        x2: x2,

        y2: y2
    };
}


/* ============================================================
   9. CALCULATE VELOCITIES
   ============================================================ */

function calculateVelocities(
    state,
    parameters
) {

    const l1 =
        parameters.l1;

    const l2 =
        parameters.l2;


    const theta1 =
        state.theta1;

    const theta2 =
        state.theta2;


    const omega1 =
        state.omega1;

    const omega2 =
        state.omega2;


    /*
       First mass velocity
    */

    const vx1 =
        l1 *
        Math.cos(theta1) *
        omega1;


    const vy1 =
        l1 *
        Math.sin(theta1) *
        omega1;


    /*
       Second mass velocity
    */

    const vx2 =
        vx1 +
        l2 *
        Math.cos(theta2) *
        omega2;


    const vy2 =
        vy1 +
        l2 *
        Math.sin(theta2) *
        omega2;


    return {

        vx1: vx1,

        vy1: vy1,

        vx2: vx2,

        vy2: vy2
    };
}


/* ============================================================
   10. KINETIC ENERGY
   ============================================================

   T =
   1/2(m1+m2)l1² omega1²
   +
   1/2 m2 l2² omega2²
   +
   m2 l1 l2 omega1 omega2 cos(theta1-theta2)

   ============================================================ */

function calculateKineticEnergy(
    state,
    parameters
) {

    const m1 =
        parameters.m1;

    const m2 =
        parameters.m2;

    const l1 =
        parameters.l1;

    const l2 =
        parameters.l2;


    const omega1 =
        state.omega1;

    const omega2 =
        state.omega2;


    const delta =
        state.theta1 -
        state.theta2;


    const T1 =
        0.5 *
        (m1 + m2) *
        l1 *
        l1 *
        omega1 *
        omega1;


    const T2 =
        0.5 *
        m2 *
        l2 *
        l2 *
        omega2 *
        omega2;


    const T3 =
        m2 *
        l1 *
        l2 *
        omega1 *
        omega2 *
        Math.cos(delta);


    return T1 + T2 + T3;
}


/* ============================================================
   11. POTENTIAL ENERGY
   ============================================================

   V =
   -(m1+m2) g l1 cos(theta1)
   -
   m2 g l2 cos(theta2)

   Reference:
   zero potential at the pivot height.

   ============================================================ */

function calculatePotentialEnergy(
    state,
    parameters
) {

    const m1 =
        parameters.m1;

    const m2 =
        parameters.m2;

    const l1 =
        parameters.l1;

    const l2 =
        parameters.l2;

    const g =
        parameters.g;


    const theta1 =
        state.theta1;

    const theta2 =
        state.theta2;


    const V =
        -(m1 + m2) *
        g *
        l1 *
        Math.cos(theta1)

        -

        m2 *
        g *
        l2 *
        Math.cos(theta2);


    return V;
}


/* ============================================================
   12. TOTAL ENERGY
   ============================================================ */

function calculateEnergy(
    state,
    parameters
) {

    const kineticEnergy =
        calculateKineticEnergy(
            state,
            parameters
        );


    const potentialEnergy =
        calculatePotentialEnergy(
            state,
            parameters
        );


    return (
        kineticEnergy +
        potentialEnergy
    );
}


/* ============================================================
   13. ENERGY ERROR
   ============================================================ */

function calculateEnergyErrorPercentage(
    initialEnergy,
    currentEnergy
) {

    if (
        !Number.isFinite(initialEnergy) ||
        !Number.isFinite(currentEnergy)
    ) {

        return 0;
    }


    if (
        Math.abs(initialEnergy) <
        1e-12
    ) {

        return 0;
    }


    return Math.abs(
        (
            currentEnergy -
            initialEnergy
        ) /
        initialEnergy
    ) * 100;
}


/* ============================================================
   14. COMPLETE PHYSICS CALCULATION
   ============================================================ */

function calculatePhysics(
    state,
    parameters
) {

    /*
       Validate input
    */

    if (
        !validateParameters(parameters)
    ) {

        console.error(
            "Invalid simulation parameters."
        );

        return null;
    }


    /*
       Accelerations
    */

    const accelerations =
        calculateAccelerations(
            state,
            parameters
        );


    /*
       Positions
    */

    const positions =
        calculatePositions(
            state,
            parameters
        );


    /*
       Velocities
    */

    const velocities =
        calculateVelocities(
            state,
            parameters
        );


    /*
       Energy
    */

    const kineticEnergy =
        calculateKineticEnergy(
            state,
            parameters
        );


    const potentialEnergy =
        calculatePotentialEnergy(
            state,
            parameters
        );


    const totalEnergy =
        kineticEnergy +
        potentialEnergy;


    return {

        alpha1:
            accelerations.alpha1,

        alpha2:
            accelerations.alpha2,

        x1:
            positions.x1,

        y1:
            positions.y1,

        x2:
            positions.x2,

        y2:
            positions.y2,

        vx1:
            velocities.vx1,

        vy1:
            velocities.vy1,

        vx2:
            velocities.vx2,

        vy2:
            velocities.vy2,

        kineticEnergy:
            kineticEnergy,

        potentialEnergy:
            potentialEnergy,

        totalEnergy:
            totalEnergy
    };
}


/* ============================================================
   15. LINEARIZED MASS MATRIX
   ============================================================

   For small-angle motion:

   M q_ddot + K q = 0

   ============================================================ */

function calculateLinearMassMatrix(
    parameters
) {

    const m1 =
        parameters.m1;

    const m2 =
        parameters.m2;

    const l1 =
        parameters.l1;

    const l2 =
        parameters.l2;


    return [

        [
            (m1 + m2) *
            l1 *
            l1,

            m2 *
            l1 *
            l2
        ],

        [
            m2 *
            l1 *
            l2,

            m2 *
            l2 *
            l2
        ]
    ];
}


/* ============================================================
   16. LINEARIZED STIFFNESS MATRIX
   ============================================================ */

function calculateLinearStiffnessMatrix(
    parameters
) {

    const m1 =
        parameters.m1;

    const m2 =
        parameters.m2;

    const l1 =
        parameters.l1;

    const l2 =
        parameters.l2;

    const g =
        parameters.g;


    return [

        [
            (m1 + m2) *
            g *
            l1,

            0
        ],

        [
            0,

            m2 *
            g *
            l2
        ]
    ];
}


/* ============================================================
   17. SMALL-ANGLE NATURAL FREQUENCIES
   ============================================================ */

function calculateNaturalFrequencies(
    parameters
) {

    const M =
        calculateLinearMassMatrix(
            parameters
        );


    const K =
        calculateLinearStiffnessMatrix(
            parameters
        );


    /*
       For:

       det(K - omega² M) = 0

       Let lambda = omega².

       a lambda² + b lambda + c = 0
    */


    const M11 = M[0][0];
    const M12 = M[0][1];
    const M22 = M[1][1];


    const K11 = K[0][0];
    const K22 = K[1][1];


    const a =
        M11 *
        M22 -
        M12 *
        M12;


    const b =
        -(
            K11 *
            M22 +
            K22 *
            M11
        );


    const c =
        K11 *
        K22;


    const discriminant =
        b * b -
        4 * a * c;


    if (
        discriminant < 0 ||
        Math.abs(a) < 1e-15
    ) {

        return [];
    }


    const lambda1 =
        (
            -b +
            Math.sqrt(discriminant)
        ) /
        (2 * a);


    const lambda2 =
        (
            -b -
            Math.sqrt(discriminant)
        ) /
        (2 * a);


    const omegaNatural1 =
        Math.sqrt(
            Math.max(0, lambda1)
        );


    const omegaNatural2 =
        Math.sqrt(
            Math.max(0, lambda2)
        );


    return [

        omegaNatural1,

        omegaNatural2
    ].sort(
        (a, b) => a - b
    );
}


/* ============================================================
   18. PHYSICS SELF TEST
   ============================================================ */

function testDoublePendulumPhysics() {

    console.log(
        "Running double pendulum physics test..."
    );


    const parameters = {

        m1: 1.0,

        m2: 1.0,

        l1: 0.8,

        l2: 0.8,

        g: 9.81
    };


    const state = {

        theta1:
            degreesToRadians(30),

        omega1: 0,

        theta2:
            degreesToRadians(40),

        omega2: 0
    };


    /*
       Test parameters
    */

    console.log(
        "Parameters:",
        parameters
    );


    /*
       Test accelerations
    */

    const accelerations =
        calculateAccelerations(
            state,
            parameters
        );


    console.log(
        "Accelerations:",
        accelerations
    );


    /*
       Test positions
    */

    const positions =
        calculatePositions(
            state,
            parameters
        );


    console.log(
        "Positions:",
        positions
    );


    /*
       Test velocities
    */

    const velocities =
        calculateVelocities(
            state,
            parameters
        );


    console.log(
        "Velocities:",
        velocities
    );


    /*
       Test energy
    */

    const energy =
        calculateEnergy(
            state,
            parameters
        );


    console.log(
        "Initial energy:",
        energy
    );


    /*
       Test complete physics
    */

    const physics =
        calculatePhysics(
            state,
            parameters
        );


    console.log(
        "Complete physics:",
        physics
    );


    /*
       Test natural frequencies
    */

    const frequencies =
        calculateNaturalFrequencies(
            parameters
        );


    console.log(
        "Natural frequencies:",
        frequencies
    );


    console.log(
        "Physics engine test completed."
    );


    return true;
}


/* ============================================================
   19. DEFAULT PHYSICS STATE
   ============================================================ */

const DEFAULT_PHYSICS_STATE = {

    theta1:
        degreesToRadians(30),

    omega1:
        0,

    theta2:
        degreesToRadians(40),

    omega2:
        0
};


/* ============================================================
   20. GLOBAL EXPORTS
   ============================================================ */

window.degreesToRadians =
    degreesToRadians;

window.radiansToDegrees =
    radiansToDegrees;

window.normalizeAngle =
    normalizeAngle;

window.validateParameters =
    validateParameters;

window.calculateMassMatrix =
    calculateMassMatrix;

window.calculateRHS =
    calculateRHS;

window.calculateAccelerations =
    calculateAccelerations;

window.calculateDerivatives =
    calculateDerivatives;

window.calculatePositions =
    calculatePositions;

window.calculateVelocities =
    calculateVelocities;

window.calculateKineticEnergy =
    calculateKineticEnergy;

window.calculatePotentialEnergy =
    calculatePotentialEnergy;

window.calculateEnergy =
    calculateEnergy;

window.calculateEnergyErrorPercentage =
    calculateEnergyErrorPercentage;

window.calculatePhysics =
    calculatePhysics;

window.calculateLinearMassMatrix =
    calculateLinearMassMatrix;

window.calculateLinearStiffnessMatrix =
    calculateLinearStiffnessMatrix;

window.calculateNaturalFrequencies =
    calculateNaturalFrequencies;

window.testDoublePendulumPhysics =
    testDoublePendulumPhysics;


/* ============================================================
   21. ENGINE LOADED MESSAGE
   ============================================================ */

console.log(
    "=========================================="
);

console.log(
    "Double Pendulum Physics Engine Loaded"
);

console.log(
    "=========================================="
);
