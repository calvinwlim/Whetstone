import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "dns",
    track: "system-design",
    depth: true,
    title: "DNS",
    blurb: "The first hop of every request, and the slowest thing to change.",
    lesson: `DNS turns a name into an address, and it is the first thing that happens in almost every request you will ever draw on a whiteboard.

**How a lookup resolves.** The client asks a *recursive resolver* (usually your ISP's or something like 1.1.1.1). If it has no cached answer it walks down: a *root* server points it at the TLD servers for .com, which point it at the *authoritative* nameserver for your domain, which returns the record. Each step is cached, which is why the second lookup is nearly free.

**Records worth knowing.** *A* maps a name to an IPv4 address, *AAAA* to IPv6. *CNAME* aliases one name to another — and it cannot exist at the zone apex, which is why providers invented *ALIAS* / *ANAME* records so \`example.com\` can point at a load balancer hostname. *NS* delegates a zone, *MX* routes mail, *TXT* carries verification and policy records.

**TTL is the whole tradeoff.** A record's TTL tells resolvers how long to cache it. A long TTL means fewer lookups and faster average resolution; a short TTL means you can move traffic quickly. Teams planning a migration drop the TTL to a minute *days in advance*, precisely because the old TTL is already cached everywhere. "DNS propagation" is not propagation at all — it is just waiting for other people's caches to expire.

**DNS as a routing tool.** GeoDNS returns different addresses by the client's approximate location, and DNS-based failover pulls a sick region out by changing a record. Both are coarse and slow to take effect, because you do not control the caches. Anycast and a load balancer react in seconds; DNS reacts in minutes at best.`,
    resources: [
      {
        label: "Cloudflare — What is DNS?",
        url: "https://www.cloudflare.com/learning/dns/what-is-dns/",
      },
      {
        label: "MDN — DNS",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/DNS",
      },
    ],
  },
  {
    id: "protocols",
    track: "system-design",
    title: "Protocols & Communication",
    blurb: "What actually carries the request, and when the choice matters.",
    lesson: `Above the network, the protocol choice decides your latency floor, your failure modes, and how easy the thing is to debug.

**TCP vs UDP.** TCP is connection-oriented: it orders bytes, retransmits what is lost, and backs off under congestion. That reliability costs a handshake and head-of-line blocking — one lost packet stalls everything behind it. UDP has none of it, which is exactly why real-time video, games, and DNS use it. Losing a frame of video is better than pausing to redeliver it.

**HTTP versions.** HTTP/1.1 allows one in-flight request per connection in practice, so browsers open several. HTTP/2 multiplexes many streams over one connection and compresses headers, but because it still rides TCP, one lost packet stalls *every* stream. HTTP/3 moves to QUIC over UDP, so loss on one stream no longer blocks the others, and the handshake is faster.

**Choosing an API protocol.** REST over HTTP is the default: cacheable, debuggable with curl, universally supported. gRPC uses HTTP/2 and protobuf — compact, fast, strongly typed, with real streaming, and awkward from a browser without a proxy, which makes it a service-to-service choice. GraphQL lets the client ask for exactly the fields it needs, solving over-fetching for many different clients, at the cost of harder HTTP caching and a standing N+1 risk in resolvers.

**Pushing to the client.** WebSockets give a persistent full-duplex connection, right for chat and collaborative editing. Server-Sent Events are one-directional server-to-client over plain HTTP with automatic reconnect — simpler, and enough for notifications, progress, and token streaming. Long polling is the fallback when neither is available.`,
    resources: [
      {
        label: "MDN — Evolution of HTTP",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP",
      },
      {
        label: "gRPC — Introduction",
        url: "https://grpc.io/docs/what-is-grpc/introduction/",
      },
    ],
  },
  {
    id: "availability",
    track: "system-design",
    depth: true,
    title: "Availability & Failover",
    blurb: "Counting nines honestly, and what actually happens when a node dies.",
    lesson: `Availability is usually quoted in nines, and the arithmetic is worth knowing cold because interviewers ask for it directly.

**What the nines mean per year:** 99% is about 3.65 days of downtime. 99.9% ("three nines") is about 8.8 hours. 99.99% is about 53 minutes. 99.999% is about 5 minutes. Each extra nine costs roughly an order of magnitude more effort, which is why "five nines" is a claim to interrogate rather than a target to assume.

**Components in sequence multiply.** If a request must pass through two services that are each 99.9% available, the path is 0.999 x 0.999 = 99.8%. Dependencies make you *less* available, and a long chain of healthy-looking services can add up to a bad number. This is the single most useful availability calculation in an interview.

**Components in parallel compound the other way.** Two redundant 99.9% replicas give 1 - (0.001)² = 99.9999%, because both must fail simultaneously. Redundancy is how you buy nines; dependencies are how you spend them.

**Failover shapes.** *Active-passive* keeps a standby that takes over on failure — simpler, and you pay for idle capacity while the failover window is real downtime. *Active-active* serves from both, so there is no cutover and you get load distribution, but now you own write conflicts and both sides must be able to carry full load alone, or failover just moves the outage.

**The gap people miss:** failover machinery is itself a system that can fail, and it is exercised rarely. An untested failover path is a hypothesis, not a guarantee.`,
    resources: [
      {
        label: "Google SRE — Availability table",
        url: "https://sre.google/sre-book/availability-table/",
      },
      {
        label: "AWS — Reliability pillar",
        url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- DNS ----------
  {
    id: "sd-dns-001",
    type: "ordering",
    track: "system-design",
    topic: "dns",
    difficulty: 2,
    prompt: "Put an uncached DNS resolution in order.",
    items: [
      "Client asks its recursive resolver for the name",
      "Resolver queries a root nameserver",
      "Root replies with the nameservers for the .com TLD",
      "TLD server replies with the domain's authoritative nameserver",
      "Authoritative nameserver returns the A record",
    ],
    explanation:
      "Each step is cached along the way, which is why only the first lookup is expensive. The recursive resolver does the walking — the client asks one question and waits for one answer.",
    concepts: ["DNS resolution", "Recursive resolver", "Authoritative nameserver"],
    tags: ["resolution"],
  },
  {
    id: "sd-dns-002",
    type: "mcq",
    track: "system-design",
    topic: "dns",
    difficulty: 3,
    context:
      "You plan to move a service to a new provider next week and want to be able to switch quickly.",
    prompt: "What should you do now, days ahead of the move?",
    options: [
      {
        id: "a",
        text: "Lower the record's TTL well in advance, so the old long TTL has expired everywhere by cutover",
      },
      { id: "b", text: "Lower the TTL at the moment you cut over" },
      { id: "c", text: "Raise the TTL so clients hold the new value longer" },
      { id: "d", text: "Nothing — DNS changes take effect immediately" },
    ],
    answer: "a",
    explanation:
      "Resolvers are already holding the old TTL, so lowering it at cutover changes nothing for anyone with a cached answer. Dropping it days ahead means every cache has re-fetched the short value by the time you switch. There is no such thing as propagation — you are only ever waiting for other people's caches to expire.",
    concepts: ["TTL", "DNS propagation", "DNS migration"],
    tags: ["ttl", "migration"],
  },
  {
    id: "sd-dns-003",
    type: "matching",
    track: "system-design",
    topic: "dns",
    difficulty: 2,
    prompt: "Match each DNS record type to what it does.",
    pairs: [
      { left: "A", right: "Maps a name to an IPv4 address" },
      { left: "AAAA", right: "Maps a name to an IPv6 address" },
      { left: "CNAME", right: "Aliases one name to another name" },
      { left: "MX", right: "Routes mail for the domain" },
      { left: "NS", right: "Delegates the zone to a nameserver" },
    ],
    explanation:
      "The one that bites people in practice is CNAME: it cannot exist at the zone apex alongside other records, which is why hosting providers offer ALIAS or ANAME so a bare domain can still point at a load balancer's hostname.",
    concepts: ["A record", "CNAME record", "MX record", "NS record"],
    tags: ["records"],
  },
  {
    id: "sd-dns-004",
    type: "mcq",
    track: "system-design",
    topic: "dns",
    difficulty: 4,
    context:
      "A team uses DNS failover to move traffic away from an unhealthy region. Users keep hitting the bad region for several minutes after the change.",
    prompt: "Why?",
    options: [
      {
        id: "a",
        text: "Resolvers and clients cache the old record until its TTL expires, and you do not control those caches",
      },
      { id: "b", text: "DNS changes require a manual flush at each root server" },
      { id: "c", text: "The authoritative nameserver rejects rapid updates" },
      { id: "d", text: "Failover records take priority only after a full zone transfer" },
    ],
    answer: "a",
    explanation:
      "DNS is a caching system by design, and some clients ignore TTLs entirely. That makes DNS a coarse, minutes-scale routing tool. When you need seconds, move traffic at a layer you actually control — anycast, or a load balancer in front of both regions.",
    concepts: ["DNS failover", "TTL", "DNS caching"],
    tags: ["failover", "ttl"],
  },
  {
    id: "sd-dns-005",
    type: "short",
    track: "system-design",
    topic: "dns",
    difficulty: 3,
    context:
      "You want a bare domain like example.com to point at a load balancer that is identified by a hostname rather than a fixed IP. A CNAME is not allowed there.",
    prompt: "What is the record type providers offer instead? (Either name is accepted.)",
    answers: ["alias", "aname", "alias record", "aname record", "alias/aname"],
    typoTolerance: true,
    explanation:
      "ALIAS (also sold as ANAME) behaves like a CNAME but resolves at the nameserver and returns an address record, so it is legal at the zone apex where a CNAME would conflict with the required SOA and NS records.",
    concepts: ["ALIAS record", "Zone apex", "CNAME record"],
    tags: ["records", "apex"],
  },
  {
    id: "sd-dns-006",
    type: "mcq",
    track: "system-design",
    topic: "dns",
    difficulty: 1,
    prompt: "What does DNS do?",
    options: [
      { id: "a", text: "Translates a human-readable name into a network address" },
      { id: "b", text: "Encrypts traffic between client and server" },
      { id: "c", text: "Distributes requests evenly across servers" },
      { id: "d", text: "Caches static assets closer to users" },
    ],
    answer: "a",
    explanation:
      "Name to address. It can be bent into coarse traffic routing through GeoDNS and failover records, but that is a side effect of returning different answers, not its purpose.",
    concepts: ["Domain Name System", "Name resolution"],
    tags: ["fundamentals"],
  },

  // ---------- Protocols ----------
  {
    id: "sd-proto-001",
    type: "mcq",
    track: "system-design",
    topic: "protocols",
    difficulty: 2,
    context:
      "A live video stream would rather drop an occasional frame than pause playback to recover it.",
    prompt: "Which transport protocol fits, and why?",
    options: [
      {
        id: "a",
        text: "UDP — no retransmission or ordering, so loss costs a frame instead of a stall",
      },
      { id: "b", text: "TCP — reliable delivery guarantees every frame arrives" },
      { id: "c", text: "TCP — ordering is required for video to decode" },
      { id: "d", text: "Either; the transport has no effect on latency" },
    ],
    answer: "a",
    explanation:
      "TCP's guarantees are the problem here, not the benefit: retransmitting a lost packet means everything behind it waits. For real-time media the freshest data matters more than complete data, which is exactly the trade UDP makes.",
    concepts: ["UDP", "TCP", "Head-of-line blocking"],
    tags: ["tcp-udp"],
  },
  {
    id: "sd-proto-002",
    type: "mcq",
    track: "system-design",
    topic: "protocols",
    difficulty: 4,
    prompt:
      "HTTP/2 multiplexes many streams over one connection. Why can a single lost packet still stall all of them?",
    options: [
      {
        id: "a",
        text: "It runs on TCP, which delivers bytes in order, so loss blocks every stream sharing the connection",
      },
      { id: "b", text: "HTTP/2 processes streams strictly sequentially" },
      { id: "c", text: "Header compression must decompress in order" },
      { id: "d", text: "It does not — HTTP/2 eliminated head-of-line blocking entirely" },
    ],
    answer: "a",
    explanation:
      "HTTP/2 removed head-of-line blocking at the HTTP layer but inherited it from TCP underneath. That is precisely why HTTP/3 moved to QUIC over UDP, where each stream recovers from loss independently.",
    concepts: ["HTTP/2", "Head-of-line blocking", "Multiplexing"],
    tags: ["http2", "http3", "head-of-line"],
  },
  {
    id: "sd-proto-003",
    type: "mcq",
    track: "system-design",
    topic: "protocols",
    difficulty: 3,
    context:
      "You need to push notifications from server to client. Traffic only flows one way, and you want automatic reconnection without extra libraries.",
    prompt: "What is the simplest fit?",
    options: [
      { id: "a", text: "Server-Sent Events" },
      { id: "b", text: "WebSockets" },
      { id: "c", text: "Long polling" },
      { id: "d", text: "gRPC bidirectional streaming" },
    ],
    answer: "a",
    explanation:
      "SSE is one-directional server-to-client over ordinary HTTP, with reconnection and event ids built into the browser API. WebSockets buy full duplex you do not need here, and bring their own connection handling. Long polling is the fallback when SSE is unavailable.",
    concepts: ["Server-Sent Events", "WebSocket", "Long polling"],
    tags: ["sse", "websockets", "push"],
  },
  {
    id: "sd-proto-004",
    type: "matching",
    track: "system-design",
    topic: "protocols",
    difficulty: 3,
    prompt: "Match each API protocol to its strongest argument.",
    pairs: [
      { left: "REST", right: "Cacheable over HTTP and debuggable with any client" },
      { left: "gRPC", right: "Compact binary payloads and fast service-to-service calls" },
      { left: "GraphQL", right: "Clients request exactly the fields they need" },
      { left: "WebSockets", right: "Persistent full-duplex connection" },
    ],
    explanation:
      "Each strength has a matching cost: REST over-fetches, gRPC is awkward from a browser without a proxy, GraphQL makes HTTP caching hard and invites resolver N+1, and WebSockets add stateful connections that complicate scaling and deploys.",
    concepts: ["REST", "gRPC", "GraphQL", "WebSocket"],
    tags: ["api-protocols"],
  },
  {
    id: "sd-proto-005",
    type: "multi",
    track: "system-design",
    topic: "protocols",
    difficulty: 4,
    prompt:
      "Which are genuine costs of adopting GraphQL for a public API? Select all that apply.",
    options: [
      { id: "a", text: "HTTP caching is harder because most queries go to one endpoint" },
      { id: "b", text: "Resolvers can trigger N+1 database queries without care" },
      { id: "c", text: "A single query can be arbitrarily expensive without cost limits" },
      { id: "d", text: "Clients must over-fetch fields they do not need" },
      { id: "e", text: "It cannot express mutations, only reads" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Caching, resolver N+1, and unbounded query cost are the three real operational burdens, which is why production GraphQL grows dataloaders, depth limits, and cost analysis. Over-fetching is the problem GraphQL exists to solve, and mutations are part of the spec.",
    concepts: ["GraphQL", "N+1 query problem", "Query cost analysis"],
    tags: ["graphql", "tradeoffs"],
  },
  {
    id: "sd-proto-006",
    type: "short",
    track: "system-design",
    topic: "protocols",
    difficulty: 3,
    context:
      "HTTP/3 abandons TCP so that packet loss on one stream no longer blocks the others.",
    prompt: "Which transport protocol does HTTP/3 use?",
    answers: ["quic", "quic protocol", "udp/quic", "quic over udp"],
    typoTolerance: true,
    explanation:
      "QUIC, which runs over UDP and implements its own reliability, ordering, and congestion control per stream. It also folds the TLS handshake into the connection setup, cutting a round trip.",
    concepts: ["QUIC", "HTTP/3", "UDP"],
    tags: ["http3", "quic"],
  },

  // ---------- Availability ----------
  {
    id: "sd-avail-001",
    type: "mcq",
    track: "system-design",
    topic: "availability",
    difficulty: 3,
    context:
      "A request must pass through two services in sequence. Each is independently 99.9% available.",
    prompt: "What is the availability of the whole path?",
    options: [
      { id: "a", text: "About 99.8% — availabilities multiply in sequence" },
      { id: "b", text: "99.9% — the weakest link sets the number" },
      { id: "c", text: "About 99.99% — redundancy improves it" },
      { id: "d", text: "99.95% — the average of the two" },
    ],
    answer: "a",
    explanation:
      "0.999 x 0.999 = 0.998. Every hard dependency you add makes you less available, which is why a chain of individually healthy services can add up to a number nobody is happy with. This calculation comes up constantly in interviews.",
    concepts: ["Availability", "Nines", "Serial availability"],
    tags: ["nines", "sequence"],
  },
  {
    id: "sd-avail-002",
    type: "mcq",
    track: "system-design",
    topic: "availability",
    difficulty: 4,
    context: "Two redundant replicas are each 99.9% available and fail independently.",
    prompt: "What is the availability of the pair?",
    options: [
      { id: "a", text: "About 99.9999% — both must fail at once" },
      { id: "b", text: "99.9% — redundancy does not change availability" },
      { id: "c", text: "About 99.8% — availabilities multiply" },
      { id: "d", text: "100% — a redundant pair cannot fail" },
    ],
    answer: "a",
    explanation:
      "In parallel you multiply the failure probabilities, not the availabilities: 1 - (0.001)² gives six nines. Redundancy buys nines and dependencies spend them — that is the whole shape of availability arithmetic. Independence is the assumption to question: a shared rack, region, or deploy makes failures correlated.",
    concepts: ["Redundancy", "Parallel availability", "Nines"],
    tags: ["nines", "parallel", "redundancy"],
  },
  {
    id: "sd-avail-003",
    type: "matching",
    track: "system-design",
    topic: "availability",
    difficulty: 3,
    prompt: "Match each availability target to its approximate downtime per year.",
    pairs: [
      { left: "99%", right: "About 3.65 days" },
      { left: "99.9%", right: "About 8.8 hours" },
      { left: "99.99%", right: "About 53 minutes" },
      { left: "99.999%", right: "About 5 minutes" },
    ],
    explanation:
      "Each additional nine cuts downtime tenfold and costs roughly an order of magnitude more engineering. Five nines is about five minutes a year — less than a single careless deploy, which is why the claim deserves scrutiny.",
    concepts: ["Nines", "Downtime budget", "Service level agreement"],
    tags: ["nines"],
  },
  {
    id: "sd-avail-004",
    type: "mcq",
    track: "system-design",
    topic: "availability",
    difficulty: 4,
    prompt: "What does active-active buy over active-passive, and what does it cost?",
    options: [
      {
        id: "a",
        text: "No cutover window and shared load, at the cost of write conflicts and each side needing full capacity",
      },
      { id: "b", text: "Lower infrastructure cost, at the cost of slower failover" },
      { id: "c", text: "Simpler operations, at the cost of higher latency" },
      { id: "d", text: "Stronger consistency, at the cost of availability" },
    ],
    answer: "a",
    explanation:
      "Active-passive is simpler but the failover window is genuine downtime and the standby sits idle. Active-active removes the cutover and distributes load, and now you own conflict resolution. The trap is capacity: if each side normally runs at 70%, losing one does not fail over, it overloads the survivor.",
    concepts: ["Active-active", "Active-passive", "Failover"],
    tags: ["failover"],
  },
  {
    id: "sd-avail-005",
    type: "mcq",
    track: "system-design",
    topic: "availability",
    difficulty: 5,
    context:
      "A design claims 99.999% availability from two regions that are each 99.9% available.",
    prompt: "What is the strongest objection?",
    options: [
      {
        id: "a",
        text: "The maths assumes independent failures, and shared deploys, config, or dependencies make them correlated",
      },
      { id: "b", text: "Two regions can never exceed the availability of one" },
      { id: "c", text: "Availability cannot be calculated for multi-region systems" },
      { id: "d", text: "The figure is too low — two regions should give six nines" },
    ],
    answer: "a",
    explanation:
      "The arithmetic is fine; the independence assumption usually is not. A bad config push, a poisoned deploy, an expired certificate, or a shared control plane takes both regions at once, and none of those show up in the per-region number. Correlated failure is what actually causes multi-region outages.",
    concepts: ["Correlated failure", "Blast radius", "Single point of failure"],
    tags: ["correlated-failure", "nines"],
  },
  {
    id: "sd-avail-006",
    type: "short",
    track: "system-design",
    topic: "availability",
    difficulty: 2,
    prompt:
      "Roughly how much downtime per year does 99.9% availability allow? (Answer in hours, number only.)",
    answers: ["8.8", "8.76", "9", "8", "8.8 hours", "about 9"],
    typoTolerance: false,
    explanation:
      "About 8.76 hours — 0.1% of 8,760 hours in a year. Handy anchors: three nines is hours, four nines is under an hour, five nines is minutes.",
    concepts: ["Nines", "Availability"],
    tags: ["nines"],
  },
];
