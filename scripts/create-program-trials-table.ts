import fetch from "node-fetch";

const NHOST_SUBDOMAIN = "bxfkdhyednvrkjvwlfeb";
const NHOST_REGION = "us-east-1";
const ADMIN_SECRET = "oh(L1K1d;gq%'*WopDJ26C=idgh+^=Lw";
const BASE_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run`;
const QUERY_URL = `${BASE_URL}/v1/metadata`; // metadata API is usually v1/metadata

async function trackTable() {
    const trackPayload = {
        type: "pg_track_table",
        args: {
            source: "default",
            table: "program_trials"
        }
    };

    try {
        const res = await fetch(QUERY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": ADMIN_SECRET
            },
            body: JSON.stringify(trackPayload)
        });
        const data = await res.json();
        console.log(data);
    } catch (e: any) {
        console.error(e);
    }
}

trackTable();
