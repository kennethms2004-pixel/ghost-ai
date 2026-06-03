import type { Project } from "@/types/project";

/**
 * Placeholder project data for the editor UI. Replaced by real persistence in
 * a later feature unit — no API calls yet.
 */
export const MOCK_OWNED_PROJECTS: Project[] = [
  { id: "p1", name: "Checkout Service", slug: "checkout-service", isOwner: true },
  { id: "p2", name: "Event Pipeline", slug: "event-pipeline", isOwner: true },
  { id: "p3", name: "Notification Fanout", slug: "notification-fanout", isOwner: true },
];

export const MOCK_SHARED_PROJECTS: Project[] = [
  { id: "p4", name: "Billing Platform", slug: "billing-platform", isOwner: false },
  { id: "p5", name: "Search Indexer", slug: "search-indexer", isOwner: false },
];
