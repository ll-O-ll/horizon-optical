import fetch from "node-fetch";

// Requires npm install node-fetch or running with a modern Node version (v18+)

const NHOST_SUBDOMAIN = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "";
const NHOST_REGION = process.env.NEXT_PUBLIC_NHOST_REGION || "";
const ADMIN_SECRET = process.env.NHOST_ADMIN_SECRET || "";

const BASE_URL = `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run`;
// The Hasura query endpoint is usually at /v2/query or /v1/query
const QUERY_URL = `${BASE_URL}/v2/query`;

async function createTable() {
    console.log(`Sending API request to: ${QUERY_URL}`);

    // Step 1: Create table via run_sql
    const sqlPayload = {
        type: "run_sql",
        args: {
            sql: `
            CREATE TABLE IF NOT EXISTS public.timetable_rules (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                day_of_week integer NOT NULL,
                start_time text NOT NULL,
                end_time text NOT NULL
            );
            `
        }
    };

    try {
        const sqlRes = await fetch(QUERY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": ADMIN_SECRET
            },
            body: JSON.stringify(sqlPayload)
        });

        const sqlData = await sqlRes.json();
        
        if (sqlRes.ok) {
            console.log("SQL executed successfully. Table created (if it didn't already exist).");
        } else {
            console.error("SQL Error:", sqlData);
            return; // Stop if creating table fails
        }

        // Step 2: Track table
        const trackPayload = {
            type: "track_table",
            args: {
                schema: "public",
                name: "timetable_rules"
            }
        };

        const trackRes = await fetch(QUERY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": ADMIN_SECRET
            },
            body: JSON.stringify(trackPayload)
        });

        const trackData = await trackRes.json();

        if (trackRes.ok) {
            console.log("Table successfully tracked in Hasura GraphQL schema.");
        } else if (trackData.code === "already-tracked") {
            console.log("Table is already tracked in Hasura.");
        } else {
            console.error("Track Table Error:", trackData);
        }

    } catch (e: any) {
        console.error("Fetch Error:", e.message);
    }
}

createTable();
