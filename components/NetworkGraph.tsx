"use client";

import {
  colorForCategory,
  dashForRelationshipType,
  GRANTEE_LINK_WIDTH,
  opacityForRelationshipStrength,
} from "@/lib/colors";
import type { Graph, GraphNode } from "@/lib/types";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface SimNode extends GraphNode, d3.SimulationNodeDatum {
  x: number;
  y: number;
}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relationshipType: string | null;
  relationshipStrength: string | null;
}
export type SizeMode = "uniform" | "connections";
const WIDTH = 960;
const HEIGHT = 680;

function endpoint(end: string | number | SimNode) {
  return typeof end === "object" ? end.id : String(end);
}

export function NetworkGraph({
  graph,
  focusNodeId,
  onSelectionChange,
  sizeMode = "uniform",
}: {
  graph: Graph;
  focusNodeId?: string | null;
  onSelectionChange?: (id: string | null) => void;
  sizeMode?: SizeMode;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(focusNodeId ?? null);
  const focusRef = useRef<(id: string | null, zoom?: boolean) => void>(
    () => {},
  );
  const controlsRef = useRef<{
    fit: () => void;
    zoom: (factor: number) => void;
  }>({ fit: () => {}, zoom: () => {} });

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const root = svg.append("g");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reducedMotion ? 0 : 300;
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 5])
      .on("zoom", (event) =>
        root.attr("transform", event.transform.toString()),
      );
    svg.call(zoomBehavior).on("dblclick.zoom", null);

    // Seed positions on a sunflower-seed spiral rather than jittering everyone
    // into the same tiny box at the center. Spreading the start position out
    // gives the simulation a reasonable layout to refine instead of escape.
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const nodes: SimNode[] = graph.nodes.map((n, i) => ({
      ...n,
      x: WIDTH / 2 + 30 * Math.sqrt(i + 0.5) * Math.cos(i * goldenAngle),
      y: HEIGHT / 2 + 30 * Math.sqrt(i + 0.5) * Math.sin(i * goldenAngle),
    }));
    const links: SimLink[] = graph.links.map((l) => ({
      source: l.source,
      target: l.target,
      relationshipType: l.relationshipType,
      relationshipStrength: l.relationshipStrength,
    }));
    const visibleNeighbors = new Map<string, Set<string>>();
    for (const l of graph.links) {
      (
        visibleNeighbors.get(l.source) ??
        visibleNeighbors.set(l.source, new Set()).get(l.source)!
      ).add(l.target);
      (
        visibleNeighbors.get(l.target) ??
        visibleNeighbors.set(l.target, new Set()).get(l.target)!
      ).add(l.source);
    }
    // Connections stay attached to their complete regional node records so
    // filtering cannot make an organization's sizing basis silently change.
    const degree = (node: SimNode) =>
      new Set(
        node.connections
          .filter((c) => c.other !== node.id && c.other !== "Unknown")
          .map((c) => c.other),
      ).size;
    const radius = (node: SimNode) =>
      sizeMode === "uniform" ? 12 : Math.sqrt(Math.max(1, degree(node))) * 10;
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((n) => n.id)
          .distance(
            (l) =>
              radius(byId.get(endpoint(l.source))!) +
              radius(byId.get(endpoint(l.target))!) +
              60,
          )
          .strength(0.5),
      )
      // Unlinked nodes need bounded repulsion and a weak central pull;
      // otherwise they drift away and shrink the connected network to a speck.
      .force("charge", d3.forceManyBody().strength(-240).distanceMax(400))
      .force("x", d3.forceX(WIDTH / 2).strength(0.045))
      .force("y", d3.forceY(HEIGHT / 2).strength(0.045))
      .force(
        "collide",
        d3.forceCollide<SimNode>((n) => radius(n) + 18),
      )
      .velocityDecay(0.72)
      .alphaDecay(0.05)
      .stop();
    simulation.tick(140);

    const paths = root
      .append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "var(--muted-foreground)")
      .attr("stroke-dasharray", (l) =>
        dashForRelationshipType(l.relationshipType),
      )
      .attr("stroke-width", (l) =>
        byId.get(endpoint(l.source))?.granteeStatus === "current"
          ? GRANTEE_LINK_WIDTH.current
          : GRANTEE_LINK_WIDTH.other,
      );
    const circles = root
      .append("g")
      .selectAll<SVGCircleElement, SimNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", radius)
      .attr("fill", (n) => colorForCategory(n.category))
      .attr("stroke", "var(--foreground)")
      .attr("stroke-width", (n) => (n.isGrantee ? 2.5 : 0.75))
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr(
        "aria-label",
        (n) => `View ${n.id}; ${degree(n)} recorded regional partners`,
      )
      .style("cursor", "pointer")
      .on("click", (event, n) => {
        event.stopPropagation();
        onSelectionChange?.(n.id);
      })
      .on("keydown", (event: KeyboardEvent, n) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelectionChange?.(n.id);
        }
        if (event.key === "Escape") onSelectionChange?.(null);
      })
      .on("mouseenter focus", (_event, n) => setHover(n.id))
      .on("mouseleave blur", () => setHover(null));
    circles.append("title").text((n) => n.id);

    const labels = root
      .append("g")
      .attr("pointer-events", "none")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("font-family", "var(--font-sans)")
      .attr("font-weight", (n) => (n.isGrantee ? 600 : 400))
      .attr("fill", "var(--foreground)")
      .attr("stroke", "var(--card)")
      .attr("stroke-width", 4)
      .attr("stroke-linejoin", "round")
      .style("paint-order", "stroke fill")
      .text((n) => (n.id.length > 32 ? `${n.id.slice(0, 31)}…` : n.id));

    function render() {
      paths.attr("d", (l) => {
        const source = l.source as SimNode,
          target = l.target as SimNode;
        const dx = target.x - source.x,
          dy = target.y - source.y;
        // A gentle arc separates crossing relationships without implying direction.
        return `M${source.x},${source.y} Q${(source.x + target.x) / 2 - dy * 0.12},${(source.y + target.y) / 2 + dx * 0.12} ${target.x},${target.y}`;
      });
      circles.attr("cx", (n) => n.x).attr("cy", (n) => n.y);
      labels.attr("x", (n) => n.x).attr("y", (n) => n.y + radius(n) + 20);
    }
    function highlight(id: string | null) {
      const near = id ? (visibleNeighbors.get(id) ?? new Set<string>()) : null;
      circles
        .attr("opacity", (n) =>
          !id || n.id === id || near?.has(n.id) ? 1 : 0.18,
        )
        .attr("aria-pressed", (n) => (n.id === id ? "true" : "false"))
        .attr("stroke-width", (n) =>
          n.id === id ? 4 : n.isGrantee ? 2.5 : 0.75,
        );
      paths.attr("stroke-opacity", (l) =>
        id
          ? endpoint(l.source) === id || endpoint(l.target) === id
            ? 0.9
            : 0.06
          : opacityForRelationshipStrength(l.relationshipStrength),
      );
      // Greedily accept labels in priority order rather than painting an
      // unreadable pile-up. The selected organization always wins.
      const eligible = nodes.filter((n) =>
        id ? n.id === id || near?.has(n.id) : n.isGrantee,
      );
      eligible.sort((a, b) =>
        a.id === id ? -1 : b.id === id ? 1 : degree(b) - degree(a),
      );
      const accepted: { x: number; y: number; width: number }[] = [];
      const shown = new Set<string>();
      for (const n of eligible) {
        const box = {
          x: n.x,
          y: n.y + radius(n) + 20,
          width: Math.min(n.id.length, 32) * 7.5,
        };
        if (
          accepted.some(
            (b) =>
              Math.abs(b.x - box.x) < (b.width + box.width) / 2 + 6 &&
              Math.abs(b.y - box.y) < 20,
          )
        )
          continue;
        accepted.push(box);
        shown.add(n.id);
      }
      labels.attr("opacity", (n) => (shown.has(n.id) ? 1 : 0));
    }
    function fit() {
      if (!nodes.length) return;
      const x0 = Math.min(...nodes.map((n) => n.x - radius(n))) - 80;
      const x1 = Math.max(...nodes.map((n) => n.x + radius(n))) + 80;
      const y0 = Math.min(...nodes.map((n) => n.y - radius(n))) - 50;
      const y1 = Math.max(...nodes.map((n) => n.y + radius(n))) + 60;
      const scale = Math.min(1.6, WIDTH / (x1 - x0), HEIGHT / (y1 - y0));
      svg
        .transition()
        .duration(duration)
        .call(
          zoomBehavior.transform,
          d3.zoomIdentity
            .translate(WIDTH / 2, HEIGHT / 2)
            .scale(scale)
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        );
    }
    focusRef.current = (id, zoom = true) => {
      selectedRef.current = id;
      highlight(id);
      const n = id ? byId.get(id) : null;
      if (n && zoom)
        svg
          .transition()
          .duration(duration)
          .call(
            zoomBehavior.transform,
            d3.zoomIdentity
              .translate(WIDTH / 2, HEIGHT / 2)
              .scale(1.8)
              .translate(-n.x, -n.y),
          );
      else if (!id && zoom) fit();
    };
    controlsRef.current = {
      fit,
      zoom: (factor) => {
        svg.transition().duration(duration).call(zoomBehavior.scaleBy, factor);
      },
    };
    circles.call(
      d3
        .drag<SVGCircleElement, SimNode>()
        .clickDistance(6)
        // Restart only on actual movement: pointerdown alone must remain a click.
        .on("drag", (event, n) => {
          if (n.fx == null) simulation.alphaTarget(0.2).restart();
          n.fx = event.x;
          n.fy = event.y;
        })
        .on("end", (_event, n) => {
          simulation.alphaTarget(0);
          n.fx = null;
          n.fy = null;
        }),
    );
    simulation
      .on("tick", render)
      .on("end", () => highlight(selectedRef.current));
    render();
    highlight(selectedRef.current);
    fit();
    if (selectedRef.current && byId.has(selectedRef.current))
      focusRef.current(selectedRef.current);
    return () => {
      simulation.stop();
      svg.interrupt();
      // Strict Mode rebinds this effect; remove root zoom listeners as well
      // as descendants so the handlers never stack across rebuilds.
      svg.on(".zoom", null);
    };
  }, [graph, sizeMode, onSelectionChange]);

  useEffect(() => {
    focusRef.current(focusNodeId ?? null);
  }, [focusNodeId]);

  return (
    <div className="relative h-full w-full bg-card text-card-foreground">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="group"
        aria-label="Interactive organization network. Tab to an organization and press Enter for details, or use the Directory view."
        className="h-full w-full"
      />
      <div
        className="absolute bottom-4 left-4 flex rounded-lg border border-border/50 bg-background p-1 shadow-sm"
        role="group"
        aria-label="Network controls"
      >
        <button
          className="explorer-button border-0"
          aria-label="Zoom in"
          onClick={() => controlsRef.current.zoom(1.3)}
        >
          +
        </button>
        <button
          className="explorer-button border-0"
          aria-label="Zoom out"
          onClick={() => controlsRef.current.zoom(1 / 1.3)}
        >
          −
        </button>
        <button
          className="explorer-button border-0"
          onClick={() => controlsRef.current.fit()}
        >
          Fit network
        </button>
        <button
          className="explorer-button border-0"
          onClick={() => {
            onSelectionChange?.(null);
            controlsRef.current.fit();
          }}
        >
          Reset view
        </button>
      </div>
      {hover && (
        <p className="pointer-events-none absolute inset-x-4 top-3 w-fit max-w-[85%] rounded-lg border border-border/50 bg-popover px-3 py-2 text-sm text-popover-foreground shadow-sm">
          {hover}
        </p>
      )}
    </div>
  );
}
