import { describe, expect, it } from "vitest";
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
});
