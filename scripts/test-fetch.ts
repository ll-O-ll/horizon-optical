import { GraphQLClient } from 'graphql-request';

const NHOST_SUBDOMAIN = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'local';
const NHOST_REGION = process.env.NEXT_PUBLIC_NHOST_REGION || '';

const NHOST_GRAPHQL_URL = NHOST_SUBDOMAIN === 'local'
    ? 'https://local.graphql.nhost.run/v1'
    : `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1`;

console.log("Using URL:", NHOST_GRAPHQL_URL);

const nhostGraphqlClient = new GraphQLClient(NHOST_GRAPHQL_URL, {
    headers: {
        'x-hasura-admin-secret': process.env.NHOST_ADMIN_SECRET || '',
    },
});

async function checkBookings() {
    const query = `
    query GetDashboardBookings {
      bookings(order_by: {start_time: desc}) {
        id
        client_name
        client_email
        start_time
        end_time
        service_type
        session_type
        status
        payment_status
        created_at
      }
    }
  `

    try {
        const data: any = await nhostGraphqlClient.request(query)
        console.log("Success! Found", data.bookings.length, "bookings:");
        console.log(JSON.stringify(data.bookings, null, 2));
    } catch (error: any) {
        console.error("GraphQL Error:", error?.response?.errors || error.message);
    }
}

checkBookings();
