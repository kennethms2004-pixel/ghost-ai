/**
 * A project as surfaced to the editor UI. The canonical record lives in
 * PostgreSQL; this shape covers only what the sidebar and dialogs need.
 */
export interface Project {
  id: string;
  name: string;
  slug: string;
  /**
   * Whether the current user owns this project. Owners can rename/delete;
   * collaborators on shared projects cannot.
   */
  isOwner: boolean;
}
