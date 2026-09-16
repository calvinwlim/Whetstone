import { describe, expect, it } from "vitest";
import { ALL_TOPICS } from "@/content";
import { isKnownTopicId, stackMapTopicReferences, STACK_EDGES, STACK_NODES } from "@/content/stack-map";

describe("stack map", () => {
  it("only references topic ids that exist in the content bank", () => {
    const bad = stackMapTopicReferences().filter(
      (ref) => !isKnownTopicId(ref.topicId),
    );
    expect(bad).toEqual([]);
  });

  it("has no duplicate node ids, including children", () => {
    const ids = new Set<string>();
    const dupes: string[] = [];
    for (const node of STACK_NODES) {
      if (ids.has(node.id)) dupes.push(node.id);
      ids.add(node.id);
      for (const child of node.children ?? []) {
        if (ids.has(child.id)) dupes.push(child.id);
        ids.add(child.id);
      }
    }
    expect(dupes).toEqual([]);
  });

  it("only draws edges between nodes that exist", () => {
    const nodeIds = new Set(STACK_NODES.map((n) => n.id));
    const bad = STACK_EDGES.filter(
      (edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target),
    );
    expect(bad).toEqual([]);
  });

  // The map is meant to be a complete picture of the content bank, not just
  // the API-heavy corner it started as -- a newly authored topic should show
  // up here as a failure, not silently go missing from the diagram.
  it("references every topic in the content bank", () => {
    const referenced = new Set(stackMapTopicReferences().map((r) => r.topicId));
    const missing = ALL_TOPICS.map((t) => t.id).filter((id) => !referenced.has(id));
    expect(missing).toEqual([]);
  });
});
