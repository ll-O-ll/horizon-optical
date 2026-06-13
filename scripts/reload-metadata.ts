import fetch from "node-fetch";

const NHOST_SUBDOMAIN = "bxfkdhyednvrkjvwlfeb";
const NHOST_REGION = "us-east-1";
const ADMIN_SECRET = "oh(L1K1d;gq%'*WopDJ26C=idgh+^=Lw";

const BASE_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run`;
const QUERY_URL = `${BASE_URL}/v1/metadata`;

async function reload() {
    const payload = {
        type: "reload_metadata",
        args: {}
    };

    try {
        const res = await fetch(QUERY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": ADMIN_SECRET
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(data);
    } catch (e: any) {
        console.error(e);
    }
}

reload();
