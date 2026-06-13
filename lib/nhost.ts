import { GraphQLClient } from 'graphql-request';

const NHOST_SUBDOMAIN = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'local';
const NHOST_REGION = process.env.NEXT_PUBLIC_NHOST_REGION || '';

const NHOST_GRAPHQL_URL = NHOST_SUBDOMAIN === 'local'
  ? 'https://local.graphql.nhost.run/v1'
  : `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1`;

export const nhostGraphqlClient = new GraphQLClient(NHOST_GRAPHQL_URL, {
  headers: {
    'x-hasura-admin-secret': process.env.NHOST_ADMIN_SECRET || '',
  },
});

export interface BookingEvent {
  id?: string;
  client_name: string;
  client_email: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  service_type: string;
  session_type: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  reminder_ids?: string[];
}

export async function insertBookings(bookings: BookingEvent[]) {
  const mutation = `
    mutation InsertBookings($objects: [bookings_insert_input!]!) {
      insert_bookings(objects: $objects) {
        affected_rows
        returning {
          id
          reminder_ids
        }
      }
    }
  `;

  try {
    const data = await nhostGraphqlClient.request(mutation, { objects: bookings });
    return { success: true, data };
  } catch (error) {
    console.error('Error inserting bookings to Nhost:', error);
    return { success: false, error };
  }
}

export async function getBusySlots(startTime: string, endTime: string) {
  const query = `
    query GetBusySlots($startTime: timestamptz!, $endTime: timestamptz!) {
      bookings(
        where: {
          start_time: { _gte: $startTime },
          end_time: { _lte: $endTime },
          status: { _neq: "cancelled" }
        }
      ) {
        start_time
        end_time
      }
    }
  `;

  try {
    const data: any = await nhostGraphqlClient.request(query, { startTime, endTime });
    return {
      success: true,
      busySlots: data.bookings.map((b: any) => ({
        startTime: b.start_time,
        endTime: b.end_time,
      })),
    };
  } catch (error) {
    console.error('Error fetching busy slots from Nhost:', error);
    return { success: false, busySlots: [], error };
  }
}

export interface TimetableRule {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  interval_minutes: number;
}

export async function getTimetableRulesData() {
  const query = `
    query GetTimetableRules {
      timetable_rules {
        id
        day_of_week
        start_time
        end_time
        interval_minutes
      }
    }
  `;

  try {
    const data: any = await nhostGraphqlClient.request(query);
    return {
      success: true,
      rules: data.timetable_rules as TimetableRule[],
    };
  } catch (error) {
    console.error('Error fetching timetable rules from Nhost:', error);
    // Return empty array on failure so UI doesn't crash completely
    return { success: false, rules: [], error };
  }
}

export async function upsertTimetableRulesData(rules: TimetableRule[]) {
  // First delete all existing rules, then insert the new ones.
  // This is simpler since it's a complete overwrite.
  const mutation = `
    mutation UpdateTimetableRules($objects: [timetable_rules_insert_input!]!) {
      delete_timetable_rules(where: {}) {
        affected_rows
      }
      insert_timetable_rules(objects: $objects) {
        affected_rows
      }
    }
  `;

  try {
    const data = await nhostGraphqlClient.request(mutation, { objects: rules });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating timetable rules in Nhost:', error);
    return { success: false, error };
  }
}
