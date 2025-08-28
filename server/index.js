// =================================================================
// NODE.JS EXPRESS BACKEND FOR INTELLIGENT RENTAL SYSTEM (POSTGRESQL VERSION)
// =================================================================
// This server connects to a PostgreSQL database to serve data via a REST API.

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// --- PostgreSQL Connection Pool ---
// The connection pool is a highly efficient way to manage database connections.
// It reuses connections, which is much faster than opening a new one for every query.
// Connection details should be stored in environment variables for security.
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rental_sys',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
});

// Check database connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error connecting to the PostgreSQL database:', err);
        process.exit(1);
    } else {
        console.log('✅ Successfully connected to the PostgreSQL database.');
    }
});


// =================================================================
// API ENDPOINTS
// =================================================================

// --- 1. Asset Dashboard Endpoint ---
app.get('/api/assets', async (req, res) => {
    try {
        const query = `
            SELECT
                m.*,
                CASE WHEN rc.rental_status = 'active' THEN 'Rented' ELSE m.status::text END AS "rentalStatus",
                c.name AS "currentRenter"
                FROM
                Machine m
            LEFT JOIN
                RentalContract rc ON m.machine_id = rc.machine_id AND rc.rental_status = 'active'
            LEFT JOIN
                Company c ON rc.company_id = c.company_id;
        `;
        const { rows: assets } = await pool.query(query);

        const rentedCount = assets.filter(a => a.status === 'rented').length;
        const totalCount = assets.length;

        const categoryQuery = `SELECT asset_type, COUNT(*) as count FROM Machine GROUP BY asset_type;`;
        const { rows: categoryRows } = await pool.query(categoryQuery);
        const categoryDistribution = categoryRows.reduce((acc, row) => {
            acc[row.asset_type] = parseInt(row.count, 10);
            return acc;
        }, {});

        res.json({
            assets,
            summary: {
                total: totalCount,
                rented: rentedCount,
                available: totalCount - rentedCount,
                rentedPercentage: totalCount > 0 ? (rentedCount / totalCount) * 100 : 0
            },
            categoryDistribution
        });
    } catch (error) {
        console.error('Error fetching asset data:', error);
        res.status(500).json({ message: "Error processing asset data", error: error.message });
    }
});


// --- 2. Health Dashboard Endpoint ---
app.get('/api/health', async (req, res) => {
    try {
        // This query gets the most recent health analytic for each machine.
        const query = `
            SELECT DISTINCT ON (m.machine_id)
                m.machine_id,
                m.asset_type || ' #' || m.machine_id as name,
                m.manufacturer,
                mha.*
            FROM
                Machine m
            LEFT JOIN
                MachineHealthAnalytics mha ON m.machine_id = mha.machine_id
            ORDER BY
                m.machine_id, mha.log_timestamp DESC;
        `;
        const { rows: latestHealthData } = await pool.query(query);
        res.json(latestHealthData);
    } catch (error) {
        console.error('Error fetching health data:', error);
        res.status(500).json({ message: "Error processing health data", error: error.message });
    }
});

// Endpoint to get detailed sensor data for a specific machine
app.get('/api/health/:machineId', async (req, res) => {
    try {
        const { machineId } = req.params;
        const machineQuery = 'SELECT * FROM Machine WHERE machine_id = $1';
        const { rows: machines } = await pool.query(machineQuery, [machineId]);

        if (machines.length === 0) {
            return res.status(404).json({ message: "Machine not found" });
        }

        const sensorQuery = 'SELECT * FROM MachineSensorData WHERE machine_id = $1 ORDER BY "timestamp" DESC LIMIT 50';
        const { rows: machineSensorData } = await pool.query(sensorQuery, [machineId]);

        res.json({
            machine: machines[0],
            sensorReadings: machineSensorData.reverse() // reverse to show oldest first for charting
        });
    } catch (error) {
        console.error('Error fetching machine detail data:', error);
        res.status(500).json({ message: "Error processing machine detail data", error: error.message });
    }
});


// --- 3. Usage Logging Endpoint ---
app.get('/api/usage', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT ON (m.machine_id)
                m.machine_id,
                m.asset_type || ' #' || m.machine_id as name,
                m.current_location_lat as location_lat,
                m.current_location_lon as location_lon,
                msd.*
            FROM
                Machine m
            LEFT JOIN
                MachineSensorData msd ON m.machine_id = msd.machine_id
            ORDER BY
                m.machine_id, msd."timestamp" DESC;
        `;
        const { rows: usageLogs } = await pool.query(query);

        // Add utilization status logic in the application layer
        const processedLogs = usageLogs.map(log => {
            let utilization_status = 'Normal';
            const productiveMins = parseFloat(log.productive_time_mins || 0);
            const idleMins = parseFloat(log.idle_time_mins || 0);
            const totalMins = productiveMins + idleMins;
            if (totalMins > 0) {
                const idleRatio = idleMins / totalMins;
                if (idleRatio > 0.4) utilization_status = 'Underutilized';
                if (productiveMins > 500) utilization_status = 'Overutilized';
            }
            return { ...log, utilization_status };
        });

        res.json(processedLogs);
    } catch (error) {
        console.error('Error fetching usage data:', error);
        res.status(500).json({ message: "Error processing usage data", error: error.message });
    }
});


// --- 4. Demand Forecasting Endpoint ---
app.get('/api/forecast', async (req, res) => {
    try {
        const query = `
            SELECT
                TO_CHAR(start_date, 'YYYY-MM') as month,
                COUNT(*) as rentals
            FROM
                RentalContract
            GROUP BY
                month
            ORDER BY
                month;
        `;
        const { rows: forecastData } = await pool.query(query);
        res.json(forecastData);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        res.status(500).json({ message: "Error processing forecast data", error: error.message });
    }
});


// --- 5. Customer Segmentation Endpoint ---
app.get('/api/customers', async (req, res) => {
    try {
        // This complex query calculates all segmentation metrics in the database for efficiency.
        const query = `
            WITH ContractMetrics AS (
                SELECT
                    company_id,
                    COUNT(*) AS total_rentals,
                    COUNT(CASE WHEN rental_status = 'overdue' THEN 1 END) AS overdue_rentals
                FROM
                    RentalContract
                GROUP BY
                    company_id
            ),
            HealthMetrics AS (
                SELECT
                    rc.company_id,
                    AVG(mha.safety_score) AS avg_safety_score,
                    AVG(mha.wear_and_tear_index) AS avg_wear_index
                FROM
                    RentalContract rc
                JOIN
                    MachineHealthAnalytics mha ON rc.machine_id = mha.machine_id
                WHERE
                    mha.log_timestamp BETWEEN rc.actual_start_date AND rc.actual_end_date
                GROUP BY
                    rc.company_id
            )
            SELECT
                c.*,
                COALESCE(cm.total_rentals, 0) AS "totalRentals",
                CASE
                    WHEN COALESCE(cm.total_rentals, 0) > 0
                    THEN (1 - (COALESCE(cm.overdue_rentals, 0)::FLOAT / cm.total_rentals::FLOAT)) * 100
                    ELSE 100
                END AS "onTimeReturnRate",
                COALESCE(hm.avg_safety_score, 100) AS "avgSafetyScore",
                COALESCE(hm.avg_wear_index, 0) AS "avgWearIndex"
            FROM
                Company c
            LEFT JOIN
                ContractMetrics cm ON c.company_id = cm.company_id
            LEFT JOIN
                HealthMetrics hm ON c.company_id = hm.company_id;
        `;
        const { rows: customerData } = await pool.query(query);
        res.json(customerData);
    } catch (error) {
        console.error('Error fetching customer data:', error);
        res.status(500).json({ message: "Error processing customer data", error: error.message });
    }
});


app.get('/api/reports/:companyId', async (req, res) => {
    const { companyId } = req.params;
    // Get start and end dates from query parameters, e.g., /api/reports/1?startDate=2025-01-01&endDate=2025-03-31
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: "Please provide both startDate and endDate query parameters." });
    }

    try {
        const companyQuery = 'SELECT * FROM Company WHERE company_id = $1';
        const { rows: companies } = await pool.query(companyQuery, [companyId]);
        if (companies.length === 0) {
            return res.status(404).json({ message: "Company not found" });
        }

        // CORRECTED QUERY
        const reportQuery = `
            WITH RelevantContracts AS (
                SELECT contract_id, machine_id, actual_start_date, actual_end_date
                FROM RentalContract
                WHERE company_id = $1
                  AND actual_start_date IS NOT NULL
                  AND actual_end_date IS NOT NULL
                  AND (actual_start_date, actual_end_date) OVERLAPS ($2::TIMESTAMPTZ, $3::TIMESTAMPTZ)
            ),
            AggregatedSensorData AS (
                SELECT
                    SUM(msd.avg_fuel_consumption_rate * (msd.productive_time_mins / 60.0)) AS total_fuel_consumed,
                    AVG(msd.idle_fuel_consumption_pct) AS avg_idle_pct,
                    SUM(msd.over_speed_events) AS total_over_speed_events,
                    SUM(msd.overload_cycles) AS total_overload_cycles
                FROM MachineSensorData msd
                JOIN RelevantContracts rc ON msd.machine_id = rc.machine_id
                WHERE msd."timestamp" >= rc.actual_start_date AND msd."timestamp" <= rc.actual_end_date
            ),
            AggregatedHealthData AS (
                SELECT
                    AVG(mha.fuel_efficiency_score) AS avg_fuel_efficiency_score,
                    AVG(mha.safety_score) AS avg_safety_score,
                    AVG(mha.wear_and_tear_index) AS avg_wear_and_tear_index,
                    AVG(mha.downtime_risk_pct) AS avg_downtime_risk_pct
                FROM MachineHealthAnalytics mha
                JOIN RelevantContracts rc ON mha.machine_id = rc.machine_id
                WHERE mha.log_timestamp >= rc.actual_start_date AND mha.log_timestamp <= rc.actual_end_date
            ),
            AggregatedContractData AS (
                SELECT
                    COUNT(CASE WHEN rc.actual_end_date > rc.end_date THEN 1 END) as overdue_contracts,
                    COUNT(*) as total_contracts
                FROM RentalContract rc
                WHERE rc.company_id = $1
                  AND rc.actual_end_date BETWEEN $2::TIMESTAMPTZ AND $3::TIMESTAMPTZ
            )
            SELECT * FROM AggregatedSensorData, AggregatedHealthData, AggregatedContractData;
        `;

        const { rows } = await pool.query(reportQuery, [companyId, startDate, endDate]);
        const reportData = rows[0];

        if (!reportData || reportData.total_contracts === null) {
            return res.status(404).json({ message: "No contract data found for the specified period." });
        }

        // Constants for calculations
        const CO2_EMISSION_FACTOR_PER_LITRE = 2.68; // kg CO2 per litre of diesel

        const finalReport = {
            company: companies[0],
            reportingPeriod: {
                from: startDate,
                to: endDate
            },
            environmental: {
                totalFuelConsumedLitres: parseFloat(reportData.total_fuel_consumed || 0).toFixed(2),
                estimatedCo2EmissionsKg: (parseFloat(reportData.total_fuel_consumed || 0) * CO2_EMISSION_FACTOR_PER_LITRE).toFixed(2),
                averageIdleTimePercentage: parseFloat(reportData.avg_idle_pct || 0).toFixed(2),
                averageFuelEfficiencyScore: parseFloat(reportData.avg_fuel_efficiency_score || 0).toFixed(2)
            },
            social: {
                averageSafetyScore: parseFloat(reportData.avg_safety_score || 0).toFixed(2),
                totalOverSpeedEvents: parseInt(reportData.total_over_speed_events || 0),
                totalOverloadCycles: parseInt(reportData.total_overload_cycles || 0)
            },
            governance: {
                averageWearAndTearIndex: parseFloat(reportData.avg_wear_and_tear_index || 0).toFixed(2),
                averageDowntimeRiskPercentage: parseFloat(reportData.avg_downtime_risk_pct || 0).toFixed(2),
                onTimeReturnRate: reportData.total_contracts > 0 ?
                    ((1 - (reportData.overdue_contracts / reportData.total_contracts)) * 100).toFixed(2) :
                    "100.00"
            }
        };

        res.json(finalReport);

    } catch (error) {
        console.error('Error generating ESG report:', error);
        res.status(500).json({ message: "Error generating ESG report", error: error.message });
    }
});


// --- Server Initialization ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
