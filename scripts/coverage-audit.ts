import { ALL_QUESTIONS, ALL_TOPICS } from "../src/content";

const AREAS: { area: string; topics: string[] }[] = [
  { area: "APIs (REST/SOAP/etc)", topics: ["api-design", "protocols"] },
  { area: "API design & security", topics: ["api-design", "security"] },
  { area: "Database design", topics: ["databases", "storage", "sharding"] },
  { area: "Database security", topics: ["security"] },
  { area: "Enterprise technology", topics: [] },
  { area: "Enterprise architecture", topics: ["arch-patterns", "microservices"] },
  { area: "AI / LLM", topics: ["ai-systems"] },
  { area: "Vibe coding", topics: [] },
  { area: "Vibe coding security", topics: [] },
  { area: "MCP servers", topics: [] },
  { area: "Machine learning basics", topics: [] },
  { area: "Frontend security", topics: [] },
  { area: "Frontend design", topics: [] },
];

console.log("Requested area".padEnd(26) + "  n  covered by");
console.log("-".repeat(72));
for (const { area, topics } of AREAS) {
  const n = ALL_QUESTIONS.filter((q) => topics.includes(q.topic)).length;
  console.log(
    area.padEnd(26) + String(n).padStart(3) + "  " + (topics.join(", ") || "NOTHING"),
  );
}

console.log("\nWhat the security topic actually covers:");
for (const q of ALL_QUESTIONS.filter((q) => q.topic === "security")) {
  console.log("  [" + (q.tags ?? []).join(", ") + "] " + q.prompt.slice(0, 62));
}

console.log("\nWhat api-design actually covers:");
for (const q of ALL_QUESTIONS.filter((q) => q.topic === "api-design")) {
  console.log("  [" + (q.tags ?? []).join(", ") + "] " + q.prompt.slice(0, 62));
}

console.log("\nAll " + ALL_TOPICS.length + " current topics:");
console.log("  " + ALL_TOPICS.map((t) => t.id).join(", "));
