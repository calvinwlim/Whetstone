"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

export interface StackFlowNodeData {
  [key: string]: unknown;
  kind: "layer" | "child";
  label: string;
  groupLabel?: string;
  hasChildren: boolean;
  expanded: boolean;
  dimmed: boolean;
  active: boolean;
}

/** One diagram box, for both a top-level layer and an expanded child. Styling
 *  stays achromatic -- like the rest of the app, colour is reserved for
 *  correctness feedback, so "selected" and "connected" read through border
 *  weight and opacity instead of a colour key. */
export function StackNodeView({
  data,
}: NodeProps<Node<StackFlowNodeData, "stackNode">>) {
  const { kind, label, groupLabel, hasChildren, expanded, dimmed, active } =
    data;

  return (
    <div
      className={`rounded-card border px-3 py-2 shadow-sm transition-opacity ${
        kind === "layer" ? "min-w-[168px]" : "min-w-[150px] bg-surface"
      } ${
        active
          ? "border-ink bg-ink-wash text-ink"
          : "border-border bg-bg text-text hover:border-border-strong"
      } ${dimmed ? "opacity-35" : "opacity-100"}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-none !bg-border-strong"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-none !bg-border-strong"
      />

      {kind === "layer" && groupLabel ? (
        <p className="label text-[10px] text-text-2">{groupLabel}</p>
      ) : null}

      <div className="flex items-center gap-1.5">
        <p
          className={`truncate text-sm font-semibold ${kind === "child" ? "text-[0.8125rem]" : ""}`}
        >
          {label}
        </p>
        {hasChildren ? (
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className={`h-3 w-3 shrink-0 text-text-2 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
            fill="currentColor"
          >
            <path d="M6 4l4 4-4 4z" />
          </svg>
        ) : null}
      </div>
    </div>
  );
}
