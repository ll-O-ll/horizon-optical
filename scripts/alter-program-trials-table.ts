import fetch from "node-fetch";

const NHOST_SUBDOMAIN = "bxfkdhyednvrkjvwlfeb";
const NHOST_REGION = "us-east-1";
const ADMIN_SECRET = "oh(L1K1d;gq%'*WopDJ26C=idgh+^=Lw";

const BASE_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run`;
const QUERY_URL = `${BASE_URL}/v2/query`;

async function alterTable() {
    console.log(`Sending API request to: ${QUERY_URL}`);

    const sqlPayload = {
        type: "run_sql",
        args: {
            sql: `
            ALTER TABLE public.program_trials ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
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
            console.log("SQL executed successfully. Column added.");
        } else {
            console.error("SQL Error:", sqlData);
            return;
        }

        // We also need to run track_table or track_column, but for pg it's automatic usually if we reload metadata
        const reloadPayload = {
            type: "reload_metadata",
            args: {}
        };

        const reloadRes = await fetch(QUERY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": ADMIN_SECRET
            },
            body: JSON.stringify(reloadPayload)
        });

        if (reloadRes.ok) {
            console.log("Metadata reloaded.");
        } else {
            const reloadData = await reloadRes.json();
            console.error("Reload Error:", reloadData);
        }

    } catch (e: any) {
        console.error("Fetch Error:", e.message);
    }
}

alterTable();
