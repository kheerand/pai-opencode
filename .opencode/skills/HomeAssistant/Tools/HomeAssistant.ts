#!/usr/bin/env bun

/**
 * HomeAssistant API Client
 *
 * Complete REST API wrapper for Home Assistant management.
 * Handles authentication, error handling, and response parsing.
 *
 * Usage:
 *   bun run HomeAssistant.ts --action states
 *   bun run HomeAssistant.ts --action entity --entity light.living_room
 *   bun run HomeAssistant.ts --action call_service --domain light --service turn_on --entity_id light.living_room
 *
 * @version 1.0.0
 */

import { parseArgs } from "util";

// Configuration from environment
const HOME_ASSISTANT_URL = process.env.HOME_ASSISTANT_URL || "http://localhost:8123";
const HOME_ASSISTANT_TOKEN = process.env.HOME_ASSISTANT_TOKEN || "";

// Error handling
class HomeAssistantError extends Error {
  constructor(message: string, public statusCode?: number, public endpoint?: string) {
    super(message);
    this.name = "HomeAssistantError";
  }
}

// Types
interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: Record<string, any>;
}

interface ServiceCallResult {
  changed_states: EntityState[];
  service_response?: any;
}

interface Config {
  components: string[];
  config_dir: string;
  elevation: number;
  latitude: number;
  longitude: number;
  location_name: string;
  time_zone: string;
  unit_system: Record<string, string>;
  version: string;
}

interface HistoryEntry {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes?: Record<string, any>;
}

interface LogbookEntry {
  context_user_id: string | null;
  domain: string;
  entity_id: string;
  message: string;
  name: string;
  when: string;
}

interface CalendarEvent {
  summary: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  description?: string;
  location?: string;
}

interface Service {
  domain: string;
  services: string[];
}

// API Client
class HomeAssistantClient {
  private baseURL: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseURL = url.replace(/\/$/, ""); // Remove trailing slash
    this.token = token;

    if (!this.token) {
      throw new Error(
        "HOME_ASSISTANT_TOKEN environment variable not set. Generate a token in Home Assistant UI: Profile → Create Token"
      );
    }
  }

  private async api<T>(
    endpoint: string,
    method: "GET" | "POST" | "DELETE" = "GET",
    body?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };

    console.error(`[DEBUG] ${method} ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new HomeAssistantError(
          `API Error (${response.status}): ${errorText}`,
          response.status,
          endpoint
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof HomeAssistantError) throw error;
      throw new HomeAssistantError(
        `Failed to connect to Home Assistant: ${error}`,
        undefined,
        endpoint
      );
    }
  }

  // Health Check
  async checkApi(): Promise<{ message: string }> {
    return this.api<{ message: string }>("/api/");
  }

  // States
  async getStates(): Promise<EntityState[]> {
    return this.api<EntityState[]>("/api/states");
  }

  async getEntity(entityId: string): Promise<EntityState> {
    return this.api<EntityState>(`/api/states/${entityId}`);
  }

  async setEntity(
    entityId: string,
    state: string,
    attributes?: Record<string, any>
  ): Promise<EntityState> {
    return this.api<EntityState>(`/api/states/${entityId}`, "POST", {
      state,
      attributes,
    });
  }

  async deleteEntity(entityId: string): Promise<void> {
    return this.api<void>(`/api/states/${entityId}`, "DELETE");
  }

  // Services
  async getServices(): Promise<Service[]> {
    return this.api<Service[]>("/api/services");
  }

  async callService(
    domain: string,
    service: string,
    serviceData: Record<string, any> = {}
  ): Promise<ServiceCallResult> {
    return this.api<ServiceCallResult>(
      `/api/services/${domain}/${service}`,
      "POST",
      serviceData
    );
  }

  // History
  async getHistory(
    filterEntityId: string,
    startTime?: string,
    endTime?: string,
    options: { minimal_response?: boolean; no_attributes?: boolean; significant_changes_only?: boolean } = {}
  ): Promise<HistoryEntry[][]> {
    const params = new URLSearchParams({ filter_entity_id: filterEntityId });
    if (startTime) params.append("start_time", startTime);
    if (endTime) params.append("end_time", endTime);
    if (options.minimal_response) params.append("minimal_response", "1");
    if (options.no_attributes) params.append("no_attributes", "1");
    if (options.significant_changes_only) params.append("significant_changes_only", "1");

    return this.api<HistoryEntry[][]>(`/api/history/period?${params.toString()}`);
  }

  // Logbook
  async getLogbook(
    startTime?: string,
    entityId?: string,
    endTime?: string
  ): Promise<LogbookEntry[]> {
    let endpoint = "/api/logbook";
    if (startTime) endpoint += `/${startTime}`;

    const params = new URLSearchParams();
    if (entityId) params.append("entity", entityId);
    if (endTime) params.append("end_time", endTime);

    const query = params.toString();
    return this.api<LogbookEntry[]>(query ? `${endpoint}?${query}` : endpoint);
  }

  // Configuration
  async getConfig(): Promise<Config> {
    return this.api<Config>("/api/config");
  }

  async getComponents(): Promise<string[]> {
    return this.api<string[]>("/api/components");
  }

  async getEvents(): Promise<Array<{ event: string; listener_count: number }>> {
    return this.api<Array<{ event: string; listener_count: number }>>("/api/events");
  }

  async getErrorLog(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/error_log`, {
      headers: {
        "Authorization": `Bearer ${this.token}`,
      },
    });
    return response.text();
  }

  // Template
  async renderTemplate(template: string): Promise<string> {
    const response = await this.api<{ result: string }>("/api/template", "POST", {
      template,
    });
    return response.result;
  }

  // Calendar
  async getCalendars(): Promise<Array<{ entity_id: string; name: string }>> {
    return this.api<Array<{ entity_id: string; name: string }>>("/api/calendars");
  }

  async getCalendarEvents(
    calendarEntityId: string,
    startTime: string,
    endTime: string
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      start: startTime,
      end: endTime,
    });
    return this.api<CalendarEvent[]>(
      `/api/calendars/${calendarEntityId}?${params.toString()}`
    );
  }

  // Events
  async fireEvent(eventType: string, eventData?: Record<string, any>): Promise<{ message: string }> {
    return this.api<{ message: string }>(`/api/events/${eventType}`, "POST", eventData);
  }

  // Config Check
  async checkConfig(): Promise<{ errors: string | null; result: string }> {
    return this.api<{ errors: string | null; result: string }>("/api/config/core/check_config", "POST");
  }

  // Helper methods
  filterEntitiesByDomain(states: EntityState[], domain: string): EntityState[] {
    return states.filter((s) => s.entity_id.startsWith(`${domain}.`));
  }

  filterEntitiesByState(states: EntityState[], state: string): EntityState[] {
    return states.filter((s) => s.state === state);
  }

  getFriendlyName(entity: EntityState): string {
    return entity.attributes.friendly_name || entity.entity_id;
  }
}

// CLI Interface
async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      action: { type: "string", short: "a" },
      entity: { type: "string", short: "e" },
      state: { type: "string", short: "s" },
      domain: { type: "string", short: "d" },
      service: { type: "string", short: "v" }, // 'v' for service (since 's' is state)
      service_data: { type: "string", short: "j" }, // JSON string
      filter: { type: "string", short: "f" },
      start_time: { type: "string", short: "t" },
      end_time: { type: "string", short: "T" },
      minimal: { type: "boolean", short: "m" },
      template: { type: "string", short: "p" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    console.log(`
HomeAssistant API Client

USAGE:
  bun run HomeAssistant.ts [options]

OPTIONS:
  -a, --action <action>    Action to perform:
                           check_api, states, entity, set_entity, delete_entity,
                           services, call_service, history, logbook,
                           config, components, events, error_log, template,
                           calendars, calendar_events, fire_event, check_config
  -e, --entity <id>        Entity ID (for entity, set_entity, delete_entity)
  -s, --state <state>      State value (for set_entity)
  -d, --domain <domain>      Domain (for call_service)
  -v, --service <service>   Service name (for call_service)
  -j, --service_data <json> Service data as JSON string (for call_service)
  -f, --filter <domain>      Filter entities by domain (for states)
  -t, --start_time <time>   Start timestamp (for history, logbook)
  -T, --end_time <time>     End timestamp (for history, logbook)
  -m, --minimal              Minimal response (for history)
  -p, --template <text>     Template to render
  -h, --help                Show this help

EXAMPLES:
  # Check API health
  bun run HomeAssistant.ts --action check_api

  # Get all states
  bun run HomeAssistant.ts --action states

  # Get specific entity
  bun run HomeAssistant.ts --action entity --entity light.living_room

  # Set entity state
  bun run HomeAssistant.ts --action set_entity --entity sensor.test --state "25" --service_data '{"unit_of_measurement":"°C"}'

  # Call service (turn on light)
  bun run HomeAssistant.ts --action call_service --domain light --service turn_on --service_data '{"entity_id":"light.living_room"}'

  # Get history
  bun run HomeAssistant.ts --action history --filter sensor.temperature --start_time "2024-01-01T00:00:00Z"

  # Get error log
  bun run HomeAssistant.ts --action error_log

  # Render template
  bun run HomeAssistant.ts --action template --template "Current time: {{ now() }}"

ENVIRONMENT VARIABLES:
  HOME_ASSISTANT_URL    Home Assistant URL (default: http://localhost:8123)
  HOME_ASSISTANT_TOKEN    Long-lived access token (required)
`);
    return;
  }

  const client = new HomeAssistantClient(HOME_ASSISTANT_URL, HOME_ASSISTANT_TOKEN);

  const action = values.action;

  if (!action) {
    console.error("Error: --action is required. Use --help for usage.");
    process.exit(1);
  }

  try {
    switch (action) {
      case "check_api":
        const health = await client.checkApi();
        console.log(JSON.stringify(health, null, 2));
        break;

      case "states":
        const states = await client.getStates();
        if (values.filter) {
          const filtered = client.filterEntitiesByDomain(states, values.filter);
          console.log(JSON.stringify(filtered, null, 2));
        } else {
          console.log(JSON.stringify(states, null, 2));
        }
        break;

      case "entity":
        if (!values.entity) {
          console.error("Error: --entity is required for entity action");
          process.exit(1);
        }
        const entity = await client.getEntity(values.entity);
        console.log(JSON.stringify(entity, null, 2));
        break;

      case "set_entity":
        if (!values.entity || !values.state) {
          console.error("Error: --entity and --state are required for set_entity");
          process.exit(1);
        }
        const serviceData = values.service_data ? JSON.parse(values.service_data) : undefined;
        const updatedEntity = await client.setEntity(values.entity, values.state, serviceData);
        console.log(JSON.stringify(updatedEntity, null, 2));
        break;

      case "delete_entity":
        if (!values.entity) {
          console.error("Error: --entity is required for delete_entity");
          process.exit(1);
        }
        await client.deleteEntity(values.entity);
        console.log(`Entity ${values.entity} deleted successfully`);
        break;

      case "services":
        const services = await client.getServices();
        console.log(JSON.stringify(services, null, 2));
        break;

      case "call_service":
        if (!values.domain || !values.service) {
          console.error("Error: --domain and --service are required for call_service");
          process.exit(1);
        }
        const callData = values.service_data ? JSON.parse(values.service_data) : {};
        const result = await client.callService(values.domain, values.service, callData);
        console.log(JSON.stringify(result, null, 2));
        break;

      case "history":
        if (!values.filter) {
          console.error("Error: --filter (entity_id) is required for history");
          process.exit(1);
        }
        const history = await client.getHistory(
          values.filter,
          values.start_time,
          values.end_time,
          { minimal_response: values.minimal }
        );
        console.log(JSON.stringify(history, null, 2));
        break;

      case "logbook":
        const logbook = await client.getLogbook(
          values.start_time,
          values.entity,
          values.end_time
        );
        console.log(JSON.stringify(logbook, null, 2));
        break;

      case "config":
        const config = await client.getConfig();
        console.log(JSON.stringify(config, null, 2));
        break;

      case "components":
        const components = await client.getComponents();
        console.log(JSON.stringify(components, null, 2));
        break;

      case "events":
        const events = await client.getEvents();
        console.log(JSON.stringify(events, null, 2));
        break;

      case "error_log":
        const errorLog = await client.getErrorLog();
        console.log(errorLog);
        break;

      case "template":
        if (!values.template) {
          console.error("Error: --template is required for template action");
          process.exit(1);
        }
        const rendered = await client.renderTemplate(values.template);
        console.log(rendered);
        break;

      case "calendars":
        const calendars = await client.getCalendars();
        console.log(JSON.stringify(calendars, null, 2));
        break;

      case "calendar_events":
        if (!values.entity || !values.start_time || !values.end_time) {
          console.error("Error: --entity, --start_time, and --end_time are required for calendar_events");
          process.exit(1);
        }
        const calendarEvents = await client.getCalendarEvents(
          values.entity,
          values.start_time,
          values.end_time
        );
        console.log(JSON.stringify(calendarEvents, null, 2));
        break;

      case "fire_event":
        if (!values.entity) {
          console.error("Error: --entity (event_type) is required for fire_event");
          process.exit(1);
        }
        const eventData = values.service_data ? JSON.parse(values.service_data) : undefined;
        const eventResult = await client.fireEvent(values.entity, eventData);
        console.log(JSON.stringify(eventResult, null, 2));
        break;

      case "check_config":
        const configCheck = await client.checkConfig();
        console.log(JSON.stringify(configCheck, null, 2));
        break;

      default:
        console.error(`Error: Unknown action "${action}". Use --help for usage.`);
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof HomeAssistantError) {
      console.error(`Home Assistant Error: ${error.message}`);
      if (error.statusCode) console.error(`Status Code: ${error.statusCode}`);
      if (error.endpoint) console.error(`Endpoint: ${error.endpoint}`);
    } else {
      console.error(`Unexpected error: ${error}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);
