import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "embedded-sockets",
    track: "embedded-systems",
    title: "Sockets & Network Programming in C",
    blurb: "TCP vs. UDP, the sockets API, and what DNS and ARP actually do underneath a connection.",
    lesson: `This is the single highest-signal topic for a networking-appliance embedded interview, and for good reason: the entire product is software that sits in the path of network traffic, so understanding what a connection actually is at the C/socket level is closer to the job than almost anything else in this track.

**A socket is an endpoint for communication, represented in C as a file descriptor** -- once you have one, \`read\`/\`write\`/\`close\` work on it much like a file, because the kernel deliberately unified that interface. Creating one is \`socket(domain, type, protocol)\` -- \`domain\` picks the address family (IPv4 vs. IPv6), \`type\` picks the transport (stream vs. datagram), \`protocol\` is almost always left to the kernel to infer from \`type\`.

**TCP is connection-oriented and reliable; UDP is connectionless and makes no promises.** TCP establishes a connection first (the three-way handshake: SYN, SYN-ACK, ACK), guarantees delivery and ordering by retransmitting lost segments and buffering out-of-order ones, and tears the connection down explicitly when done. That reliability costs latency and per-connection state. UDP just sends a packet -- no handshake, no guarantee it arrives, no guarantee of order if more than one is sent -- which is exactly why it's the right choice for things where a late or lost packet is worse than a dropped one: DNS lookups, video/voice streams, and a lot of the low-level protocols this kind of appliance inspects.

**The socket API's server side has a specific, memorisable sequence:** \`socket()\` creates the endpoint, \`bind()\` attaches it to a local address and port, \`listen()\` marks it ready to accept incoming TCP connections and sets a backlog queue size, \`accept()\` blocks until a client connects and returns a *new* socket specifically for that connection (the original listening socket keeps listening for the next one). The client side is simpler: \`socket()\` then \`connect()\` to the server's address. UDP skips \`listen\`/\`accept\`/\`connect\` entirely and just uses \`sendto\`/\`recvfrom\`, since there's no connection to establish.

**DNS turns a hostname into an IP address**, over UDP by default (falling back to TCP for responses too large for a single UDP packet) -- a client asks a resolver, the resolver may ask further up a hierarchy of authoritative servers, and the answer gets cached for the response's TTL. **ARP does a related but different job at a lower layer**: given an IP address already known to be on the local network segment, ARP finds the corresponding MAC (hardware) address, because Ethernet frames are addressed by MAC, not IP -- DNS resolves names to IPs across the internet, ARP resolves IPs to hardware addresses on the wire you're actually sitting on.

**HTTPS is HTTP carried inside a TLS-encrypted connection**, not a separate protocol on the wire -- the TLS handshake (negotiating an encryption method and exchanging keys) happens first, then ordinary HTTP request/response traffic flows encrypted inside it. That a firewall or security appliance can't read HTTPS payloads without terminating and re-establishing the TLS session itself (a deliberate, visible act, not a side effect) is a real, current tension in exactly the kind of product this interview is for.`,
    resources: [
      { label: "Beej's Guide to Network Programming", url: "https://beej.us/guide/bgnet/" },
      { label: "RFC 9293 — Transmission Control Protocol (TCP)", url: "https://www.rfc-editor.org/rfc/rfc9293" },
      { label: "RFC 768 — User Datagram Protocol (UDP)", url: "https://www.rfc-editor.org/rfc/rfc768" },
    ],
  },
  {
    id: "embedded-netsec",
    track: "embedded-systems",
    title: "Network Security Fundamentals",
    blurb: "Firewalls and common vulnerability classes, framed around what a security-appliance company actually builds.",
    lesson: `A junior embedded role at a company whose entire product line is network security appliances will assume you can talk about *why* the product exists, not just how sockets work -- this topic is that context.

**A firewall's basic job is deciding whether to allow or block traffic based on rules,** and the two broad approaches differ in how much they understand about what they're looking at. A **packet-filtering (stateless) firewall** looks at each packet in isolation -- source/destination IP, port, protocol -- and decides per-packet, which is fast but blind to context: it can't tell a legitimate reply packet from an unsolicited one arriving on the same port. A **stateful firewall** tracks active connections and only allows traffic that's part of a connection it already approved (or a genuinely new, permitted request), which closes that gap at the cost of more memory and processing per connection. A **next-generation firewall (NGFW)** goes further still, inspecting traffic up through the application layer -- which application protocol this actually is, not just which port it claims to use -- which is roughly the category Fortinet's own products compete in.

**A DDoS (distributed denial-of-service) attack aims to exhaust a target's capacity** -- bandwidth, connection slots, CPU -- using traffic from many sources at once, which is exactly what makes it hard to block with a simple IP-based rule: there's no single bad IP to drop. Mitigations lean on rate limiting, traffic scrubbing, and absorbing volume across distributed infrastructure rather than any single clever rule.

**A man-in-the-middle (MITM) attack** positions the attacker between two parties who believe they're talking directly to each other, able to read or alter traffic in transit. This is precisely the class of attack TLS is designed to prevent -- certificate validation is what stops an attacker from transparently impersonating the server, which is also why a security appliance terminating HTTPS to inspect it has to actively manage that trust relationship rather than sidestep it.

**Buffer overflows, from the C topic earlier in this track, are a network security issue too, not just a memory-safety one** -- a huge share of historical remote-code-execution vulnerabilities are a network service reading attacker-controlled input into a fixed buffer with no length check. This is exactly why input validation and safe string handling are treated as a security property of network-facing C code, not just a correctness nicety: the code parsing untrusted packets is the code with the most to lose from getting it wrong.

**The principle of least privilege applies as much to a running service as to a person:** a network daemon should run with only the permissions and network access it actually needs, so that if it is compromised, the blast radius is bounded by what that specific service was allowed to touch -- not the whole device.`,
    resources: [
      { label: "OWASP Top Ten", url: "https://owasp.org/www-project-top-ten/" },
      { label: "CWE-120: Buffer Copy without Checking Size of Input", url: "https://cwe.mitre.org/data/definitions/120.html" },
    ],
  },
];

export const questions: Question[] = [
  {
    id: "es-sock-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 1,
    prompt: "What is a socket, at the C level?",
    options: [
      { id: "a", text: "A file descriptor representing an endpoint for network communication" },
      { id: "b", text: "A physical port on the network card" },
      { id: "c", text: "A special kind of pointer that can only address IP addresses" },
      { id: "d", text: "A compiled network driver" },
    ],
    answer: "a",
    explanation:
      "socket() returns a file descriptor, just like open() does for a file. Because the kernel unified the interface, read/write/close work on it the same way they do on any other file descriptor.",
    concepts: ["Socket", "File descriptor"],
  },
  {
    id: "es-sock-002",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 2,
    prompt: "What's the core difference between TCP and UDP?",
    options: [
      {
        id: "a",
        text: "TCP establishes a connection and guarantees ordered, reliable delivery; UDP sends individual packets with no such guarantee",
      },
      { id: "b", text: "UDP is TCP with encryption added" },
      { id: "c", text: "TCP is only usable for downloading files, UDP only for uploading" },
      { id: "d", text: "They are interchangeable with no practical difference" },
    ],
    answer: "a",
    explanation:
      "TCP's handshake and retransmission machinery cost latency and per-connection state in exchange for reliability. UDP skips all of that, making it the right fit for cases where a late or dropped packet is worse than the alternative — DNS, video/voice, and much of what this kind of appliance inspects at line rate.",
    concepts: ["TCP", "UDP"],
  },
  {
    id: "es-sock-003",
    type: "ordering",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 2,
    prompt: "Put these TCP server-side socket calls in the order a server actually makes them.",
    items: ["socket()", "bind()", "listen()", "accept()"],
    explanation:
      "socket() creates the endpoint, bind() attaches it to a local address/port, listen() marks it ready to receive connections with a backlog queue, and accept() blocks until a client connects — returning a new socket dedicated to that one connection, distinct from the original listening socket.",
    concepts: ["Socket API", "TCP server"],
  },
  {
    id: "es-sock-004",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 2,
    context: "The three-message exchange (SYN, SYN-ACK, ACK) a TCP connection uses to establish itself before any data flows.",
    prompt: "What is this called? (Three words.)",
    answers: ["three-way handshake", "three way handshake"],
    typoTolerance: true,
    explanation:
      "The three-way handshake. Both sides confirm they can send and receive before either commits application data, which is part of what makes TCP reliable — and part of why UDP, skipping it, has lower latency for a single exchange.",
    concepts: ["Three-way handshake", "TCP"],
  },
  {
    id: "es-sock-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 3,
    prompt: "What does DNS actually do?",
    options: [
      { id: "a", text: "Translates a hostname into an IP address" },
      { id: "b", text: "Translates an IP address into a MAC address on the local network" },
      { id: "c", text: "Encrypts traffic between a client and server" },
      { id: "d", text: "Establishes a TCP connection on behalf of the application" },
    ],
    answer: "a",
    explanation:
      "DNS resolves names to IP addresses, typically over UDP (falling back to TCP for oversized responses), via a hierarchy of resolvers and authoritative servers. Translating an IP to a MAC address on the local segment is a different protocol entirely: ARP.",
    concepts: ["DNS"],
  },
  {
    id: "es-sock-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 3,
    prompt: "What problem does ARP solve, and why is it needed even after DNS has resolved a hostname to an IP?",
    options: [
      {
        id: "a",
        text: "Ethernet frames are addressed by MAC address, not IP, so something still has to map a known local IP to the hardware address to actually send the frame",
      },
      { id: "b", text: "ARP is an alternative to DNS for resolving hostnames" },
      { id: "c", text: "ARP encrypts traffic at the link layer" },
      { id: "d", text: "ARP is only used for IPv6, never IPv4" },
    ],
    answer: "a",
    explanation:
      "DNS gets you from a name to an IP address, potentially across the whole internet. ARP operates one layer down and only on the local network segment: given an IP already known to be local, it finds the MAC address Ethernet actually needs to deliver the frame.",
    concepts: ["ARP", "MAC address"],
  },
  {
    id: "es-sock-007",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 3,
    prompt: "Is HTTPS a separate protocol from HTTP?",
    options: [
      {
        id: "a",
        text: "No — it's ordinary HTTP carried inside a TLS-encrypted connection, established by a TLS handshake first",
      },
      { id: "b", text: "Yes, entirely separate, sharing no request/response format with HTTP" },
      { id: "c", text: "HTTPS replaces TCP with UDP for lower latency" },
      { id: "d", text: "HTTPS is HTTP with the port number encrypted, nothing else" },
    ],
    answer: "a",
    explanation:
      "TLS negotiates encryption and exchanges keys first; once that handshake completes, normal HTTP traffic flows inside the encrypted channel. That's exactly why a firewall can't read HTTPS payloads without deliberately terminating and re-establishing the TLS session itself — there's no way to peek without becoming an active participant.",
    concepts: ["HTTPS", "TLS"],
  },
  {
    id: "es-sock-008",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-sockets",
    difficulty: 4,
    context: "A UDP-based service must handle packets that arrive out of order or not at all.",
    prompt: "Why doesn't UDP itself handle this, the way TCP does?",
    options: [
      {
        id: "a",
        text: "UDP deliberately omits ordering and retransmission to minimise latency and overhead, leaving reliability to the application if it needs it",
      },
      { id: "b", text: "UDP always delivers packets in order; this scenario can't actually happen" },
      { id: "c", text: "UDP relies on the operating system to silently retransmit lost packets" },
      { id: "d", text: "UDP is simply a broken, deprecated version of TCP" },
    ],
    answer: "a",
    explanation:
      "UDP is a deliberate design tradeoff, not an incomplete TCP. Applications that need reliability on top of UDP — DNS resolvers retrying a query, a video codec tolerating loss but needing rough ordering — implement exactly as much of it as they need themselves, rather than paying for TCP's full guarantee when they don't want all of it.",
    concepts: ["UDP", "Protocol design tradeoffs"],
  },
  {
    id: "es-netsec-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-netsec",
    difficulty: 1,
    prompt: "What does a firewall fundamentally do?",
    options: [
      { id: "a", text: "Decides whether to allow or block network traffic based on a set of rules" },
      { id: "b", text: "Encrypts all traffic leaving a network" },
      { id: "c", text: "Physically disconnects a device from the internet" },
      { id: "d", text: "Speeds up network traffic by compressing it" },
    ],
    answer: "a",
    explanation:
      "That's the whole job at its core, whether the rules look at a single packet's headers or the full application-layer content of a connection — every firewall type is a variation on 'allow or block, based on rules.'",
    concepts: ["Firewall"],
  },
  {
    id: "es-netsec-002",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-netsec",
    difficulty: 2,
    prompt: "What's the difference between a stateless (packet-filtering) firewall and a stateful firewall?",
    options: [
      {
        id: "a",
        text: "A stateful firewall tracks active connections and only allows traffic belonging to one it approved; a stateless one judges each packet in isolation",
      },
      { id: "b", text: "A stateless firewall is always more secure, because it has fewer moving parts" },
      { id: "c", text: "Stateful firewalls cannot inspect TCP traffic, only UDP" },
      { id: "d", text: "There is no practical difference" },
    ],
    answer: "a",
    explanation:
      "A stateless firewall is blind to context — it can't distinguish a legitimate reply on a port from an unsolicited packet arriving there. Tracking connection state closes that gap, at the cost of more memory and per-connection bookkeeping.",
    concepts: ["Stateful firewall", "Stateless firewall"],
  },
  {
    id: "es-netsec-003",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-netsec",
    difficulty: 2,
    context: "An attack that floods a target with traffic from many distributed sources at once, aiming to exhaust its capacity.",
    prompt: "What is this attack called? (Acronym, 4 letters.)",
    answers: ["ddos", "dd0s"],
    typoTolerance: true,
    explanation:
      "A DDoS (distributed denial-of-service) attack. The 'distributed' part is what makes it hard to block with a simple rule — there's no single bad IP to drop, which is why mitigation leans on rate limiting and absorbing volume rather than a clever blocklist.",
    concepts: ["DDoS"],
  },
  {
    id: "es-netsec-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-netsec",
    difficulty: 3,
    prompt: "What does TLS certificate validation actually protect against?",
    options: [
      {
        id: "a",
        text: "A man-in-the-middle attacker transparently impersonating the server the client believes it's talking to",
      },
      { id: "b", text: "A denial-of-service attack overwhelming the server" },
      { id: "c", text: "A buffer overflow in the server's request parser" },
      { id: "d", text: "Physical theft of the server hardware" },
    ],
    answer: "a",
    explanation:
      "Without certificate validation, there's nothing stopping an attacker positioned between client and server from presenting their own certificate and quietly relaying (and reading) traffic between the two — a man-in-the-middle attack. Validation is what forces that impersonation to fail visibly.",
    concepts: ["TLS", "Man-in-the-middle attack", "Certificate validation"],
  },
  {
    id: "es-netsec-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-netsec",
    difficulty: 3,
    prompt: "Why is a buffer overflow specifically a network security concern, not just a correctness bug?",
    options: [
      {
        id: "a",
        text: "A network service reading attacker-controlled input into a fixed buffer with no bounds check is a classic path to remote code execution",
      },
      { id: "b", text: "Buffer overflows only ever cause a crash, never a security issue" },
      { id: "c", text: "Network services are immune to buffer overflows by design" },
      { id: "d", text: "It only matters if the service is written in a memory-safe language" },
    ],
    answer: "a",
    explanation:
      "A huge share of historical remote-code-execution vulnerabilities trace back to exactly this: a network-facing function reading untrusted, attacker-controlled input into a fixed-size buffer with no length check. It's why input validation on the code parsing untrusted packets is treated as a security property, not a nicety.",
    concepts: ["Buffer overflow", "Remote code execution"],
  },
  {
    id: "es-netsec-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-netsec",
    difficulty: 4,
    prompt: "What does the principle of least privilege mean for a running network service?",
    options: [
      {
        id: "a",
        text: "It should run with only the permissions and access it actually needs, so a compromise is bounded to what that service could already touch",
      },
      { id: "b", text: "Every service should run as root for simplicity" },
      { id: "c", text: "It applies only to human user accounts, not running processes" },
      { id: "d", text: "It means a service should have no network access at all" },
    ],
    answer: "a",
    explanation:
      "The point is bounding blast radius: if a service that only needed read access to one directory and one network port is compromised, the attacker inherits exactly that — not root, not the whole filesystem, not every port on the box. Over-privileging a service turns a contained bug into a much larger incident.",
    concepts: ["Principle of least privilege"],
  },
  {
    id: "es-netsec-007",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-netsec",
    difficulty: 2,
    prompt: "At minimum, what does a basic packet-filtering firewall rule typically match on?",
    options: [
      { id: "a", text: "Source/destination IP address, port, and protocol" },
      { id: "b", text: "The plaintext content of an encrypted payload" },
      { id: "c", text: "The programming language the sending application was written in" },
      { id: "d", text: "The physical location of the user's keyboard" },
    ],
    answer: "a",
    explanation:
      "A stateless rule looks at what's visible in the packet headers: where it's from, where it's going, which port, which protocol. It can't see inside an encrypted payload and has no notion of the application generating the traffic — that broader visibility is what a stateful or next-generation firewall adds on top.",
    concepts: ["Firewall", "Packet filtering"],
  },
];
