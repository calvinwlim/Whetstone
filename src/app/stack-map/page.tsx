"use client";

import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { getTopic } from "@/content";
import {
  STACK_EDGES,
  STACK_GROUPS,
  STACK_NODES,
  type StackGroupId,
} from "@/content/stack-map";
import {
  StackNodeView,
  type StackFlowNodeData,
} from "@/components/stack-map/stack-node";

const NODE_TYPES = { stackNode: StackNodeView };

type FlowNode = Node<StackFlowNodeData, "stackNode">;

interface SelectedInfo {
  id: string;
  label: string;
  description: string;
  groupLabel?: string;
  parentLabel?: string;
  hasChildren: boolean;
  relatedTopicIds: string[];
}

/** Direct neighbours of a top-level node in either direction -- what lights
 *  up when it is selected, since "what does this talk to" is the whole point
 *  of the diagram. */
function neighborsOf(nodeId: string): Set<string> {
  const set = new Set<string>();
  for (const edge of STACK_EDGES) {
    if (edge.source === nodeId) set.add(edge.target);
    if (edge.target === nodeId) set.add(edge.source);
  }
  return set;
}

function findSelected(selectedId: string | null): SelectedInfo | null {
  if (!selectedId) return null;
  for (const node of STACK_NODES) {
    if (node.id === selectedId) {
      return {
        id: node.id,
        label: node.label,
        description: node.description,
        groupLabel: STACK_GROUPS.find((g) => g.id === node.group)?.label,
        hasChildren: Boolean(node.children?.length),
        relatedTopicIds: node.relatedTopicIds,
      };
    }
    for (const child of node.children ?? []) {
      if (child.id === selectedId) {
        return {
          id: child.id,
          label: child.label,
          description: child.description,
          parentLabel: node.label,
          hasChildren: false,
          relatedTopicIds: child.relatedTopicIds,
        };
      }
    }
  }
  return null;
}

function StackMap() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<StackGroupId | "all">("all");
  const { fitView } = useReactFlow();
  const isFirstRender = useRef(true);

  const selected = findSelected(selectedId);

  // Newly revealed children can land outside the current viewport, so pull
  // the camera back out whenever a layer's expanded state changes. Skipped
  // on mount -- the `fitView` prop below already handles the first paint,
  // and running both races the canvas before it has real dimensions.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 50);
    return () => window.clearTimeout(id);
  }, [expanded, fitView]);

  const highlightSet = useMemo(() => {
    if (!selectedId) return null;
    // A selected child highlights alongside its parent layer; a selected
    // layer highlights alongside whatever it talks to upstream/downstream.
    const parent = STACK_NODES.find((n) =>
      n.children?.some((c) => c.id === selectedId),
    );
    if (parent) return new Set([selectedId, parent.id]);
    const layer = STACK_NODES.find((n) => n.id === selectedId);
    const ownChildren = layer?.children?.map((c) => c.id) ?? [];
    return new Set([selectedId, ...neighborsOf(selectedId), ...ownChildren]);
  }, [selectedId]);

  const { flowNodes, flowEdges } = useMemo(() => {
    const nodes: FlowNode[] = [];
    const edges: Edge[] = [];

    for (const layer of STACK_NODES) {
      const isExpanded = expanded.has(layer.id);
      const matchesFilter = groupFilter === "all" || layer.group === groupFilter;
      const dimmed = Boolean(
        (groupFilter !== "all" && !matchesFilter) ||
          (highlightSet && !highlightSet.has(layer.id)),
      );

      nodes.push({
        id: layer.id,
        type: "stackNode",
        position: layer.position,
        draggable: true,
        data: {
          kind: "layer",
          label: layer.label,
          groupLabel: STACK_GROUPS.find((g) => g.id === layer.group)?.label,
          hasChildren: Boolean(layer.children?.length),
          expanded: isExpanded,
          dimmed,
          active: selectedId === layer.id,
        },
      });

      if (isExpanded && layer.children) {
        layer.children.forEach((child, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          nodes.push({
            id: child.id,
            type: "stackNode",
            position: {
              x: layer.position.x - 90 + col * 190,
              y: layer.position.y + 130 + row * 84,
            },
            draggable: true,
            data: {
              kind: "child",
              label: child.label,
              hasChildren: false,
              expanded: false,
              dimmed: Boolean(
                (groupFilter !== "all" && !matchesFilter) ||
                  (highlightSet && !highlightSet.has(child.id)),
              ),
              active: selectedId === child.id,
            },
          });
          edges.push({
            id: `child-${layer.id}-${child.id}`,
            source: layer.id,
            target: child.id,
            style: { stroke: "var(--border)", strokeDasharray: "3 3" },
          });
        });
      }
    }

    for (const edge of STACK_EDGES) {
      const isHighlighted =
        highlightSet && highlightSet.has(edge.source) && highlightSet.has(edge.target);
      edges.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        labelStyle: { fill: "var(--text-2)", fontSize: 11 },
        labelBgStyle: { fill: "var(--bg)" },
        style: {
          stroke: isHighlighted ? "var(--ink)" : "var(--border-strong)",
          strokeWidth: isHighlighted ? 2 : 1,
          opacity: highlightSet && !isHighlighted ? 0.35 : 1,
        },
      });
    }

    return { flowNodes: nodes, flowEdges: edges };
  }, [expanded, selectedId, highlightSet, groupFilter]);

  function toggleExpand(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Stack Map</h1>
      <p className="mt-2 max-w-2xl text-sm text-text-2">
        A real system, laid out end to end. Click a layer to see what it talks
        to and expand it into its topics; each topic links straight to the
        lesson.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setGroupFilter("all")}
          aria-pressed={groupFilter === "all"}
          className={`btn rounded-chip px-2.5 py-1 text-[0.8125rem] ${
            groupFilter === "all"
              ? "btn-primary"
              : "border border-border text-text-2 hover:border-border-strong hover:text-text"
          }`}
        >
          All layers
        </button>
        {STACK_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() =>
              setGroupFilter((current) => (current === group.id ? "all" : group.id))
            }
            aria-pressed={groupFilter === group.id}
            className={`btn rounded-chip px-2.5 py-1 text-[0.8125rem] ${
              groupFilter === group.id
                ? "btn-primary"
                : "border border-border text-text-2 hover:border-border-strong hover:text-text"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row">
        <div className="relative h-[420px] flex-none overflow-hidden rounded-card border border-border bg-surface sm:h-[520px] lg:h-[620px] lg:flex-1">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={NODE_TYPES}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            nodesConnectable={false}
            elementsSelectable
            nodeClickDistance={10}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            colorMode="light"
          >
            <Background gap={20} size={1} color="var(--border)" />
            <Controls
              showInteractive={false}
              className="!shadow-none [&_button]:!border-border [&_button]:!bg-surface [&_button]:!fill-text [&_button]:!text-text"
            />
            <MiniMap
              className="hidden sm:block"
              maskColor="rgba(0,0,0,0.06)"
              nodeColor="var(--border-strong)"
              pannable
              zoomable
            />
          </ReactFlow>
        </div>

        <aside className="w-full shrink-0 rounded-card border border-border bg-surface p-4 lg:w-80">
          {selected ? (
            <div>
              {selected.parentLabel ? (
                <p className="label text-text-2">
                  Part of {selected.parentLabel}
                </p>
              ) : selected.groupLabel ? (
                <p className="label text-text-2">{selected.groupLabel}</p>
              ) : null}
              <h2 className="mt-0.5 text-lg font-semibold">{selected.label}</h2>
              <p className="mt-1.5 text-sm text-text-2">{selected.description}</p>

              {selected.hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(selected.id)}
                  className="btn btn-primary mt-3 rounded-control px-3 py-1.5 text-sm"
                >
                  {expanded.has(selected.id) ? "Collapse" : "Expand"} topics
                </button>
              ) : null}

              {selected.relatedTopicIds.length ? (
                <div className="mt-4">
                  <p className="label text-text-2">Related topics</p>
                  <ul className="mt-2 space-y-2">
                    {selected.relatedTopicIds.map((topicId) => {
                      const topic = getTopic(topicId);
                      if (!topic) return null;
                      return (
                        <li key={topicId}>
                          <Link
                            href={`/topics/${topic.id}`}
                            className="block rounded-control border border-border px-2.5 py-2 transition-colors hover:border-border-strong hover:bg-bg"
                          >
                            <p className="text-sm font-medium">{topic.title}</p>
                            <p className="mt-0.5 text-xs text-text-2">
                              {topic.blurb}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">Nothing selected</p>
              <p className="mt-1.5 text-sm text-text-2">
                Click a layer on the map to see what it does, how it connects
                upstream and downstream, and which topics live there. Layers
                with a chevron expand into their component topics.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function StackMapPage() {
  return (
    <ReactFlowProvider>
      <StackMap />
    </ReactFlowProvider>
  );
}
