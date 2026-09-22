import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "c-embedded",
    track: "embedded-systems",
    title: "C for Systems & Embedded Programming",
    blurb: "Pointers, memory corruption, and the qualifiers that matter once nothing is managed for you.",
    lesson: `Embedded and systems C is the same language as application C, but the rules that keep application code safe -- a garbage collector, a huge heap, an OS that kills a misbehaving process -- are mostly absent. The bugs that are merely annoying elsewhere are the ones interviewers probe for here.

**Pointers are addresses, not magic.** A pointer is a number that names a location in memory; \`*p\` reads or writes what lives there, \`&x\` asks for where \`x\` lives. Pointer arithmetic moves by the size of the pointed-to type, not by one byte -- \`p + 1\` on an \`int*\` moves four bytes forward, not one. A dangling pointer (one that still holds an address whose memory has since been freed or gone out of scope) reads or writes memory that is no longer yours; the read might look fine for a while, which is exactly what makes it dangerous.

**Memory corruption is the category interviewers keep coming back to.** A buffer overflow writes past the end of an array -- classically \`strcpy\` into a fixed buffer with no length check -- and depending on what sits next in memory, that can silently corrupt an adjacent variable, a return address, or nothing at all until it does. A use-after-free reads or writes through a pointer whose memory has already been released. Both are "the code compiles and often runs" bugs, which is what makes them worse than a crash: a crash tells you immediately, corruption tells you eventually and somewhere else.

**\`volatile\` tells the compiler to stop optimising a read or write away.** It exists for exactly one reason: some memory changes for a cause the compiler cannot see -- a hardware register, a value another thread writes, a signal handler. Without \`volatile\`, the compiler is free to assume a variable that your code never writes to inside a loop can't change, cache it in a register, and never re-read it -- which is correct C semantics and wrong for a status register that's changing under it. \`const\` says "not written through this name," a compile-time promise the compiler checks, not a runtime protection. \`static\` at file scope limits a name to that translation unit; on a local variable, it makes the variable persist across calls instead of living on the stack.

**Header files declare, they do not define.** A \`.h\` file tells the compiler a function's or a struct's shape so other files can call it or use it correctly; the actual code lives in a \`.c\` file compiled separately and linked together. Getting a declaration wrong across files is a linker error waiting to happen, and it is why header guards (\`#ifndef\`/\`#define\` or \`#pragma once\`) exist -- to stop the same declarations being read twice when headers include each other.`,
    resources: [
      { label: "Beej's Guide to C Programming", url: "https://beej.us/guide/bgc/" },
      { label: "CWE-119: Buffer Overflow", url: "https://cwe.mitre.org/data/definitions/119.html" },
    ],
  },
  {
    id: "number-systems",
    track: "embedded-systems",
    title: "Number Systems & Bitwise Operations",
    blurb: "Binary, hex, two's complement, and the bit-twiddling idioms that show up in every protocol header.",
    lesson: `Everything a processor does is binary underneath; hex exists purely so humans can read it without going cross-eyed. One hex digit is exactly four bits, so a byte is always two hex digits -- \`0xFF\` is 11111111, \`0x0A\` is 00001010 -- which is the whole reason hex is used instead of decimal for anything close to hardware.

**Two's complement is how signed integers actually work.** To negate a number, invert every bit and add one. The top bit acts as a sign bit, but not by simply meaning "negative" -- the representation is chosen so that ordinary binary addition produces correct results for both positive and negative numbers without the hardware needing separate logic. It's also why a signed integer's range is asymmetric: an 8-bit signed value runs from -128 to 127, not -127 to 127, because zero only needs one representation.

**Bitwise operators are how you manipulate flags and fields packed into a single word,** which is the normal way protocol headers, hardware registers, and permission bits are laid out. \`&\` (AND) tests or clears bits: \`x & mask\` keeps only the bits set in \`mask\`. \`|\` (OR) sets bits: \`x | (1 << 3)\` sets bit 3 without touching the rest. \`^\` (XOR) toggles bits and is the classic in-place swap trick. \`~\` inverts every bit. \`<<\` and \`>>\` shift bits left or right, which for unsigned values is also a fast multiply or divide by a power of two -- but right-shifting a *signed* negative value is implementation-defined behaviour in older C standards depending on whether the shift is arithmetic (sign-extending) or logical (zero-filling), which is exactly the kind of thing that bites someone porting code between compilers.

**The idiom worth having cold:** \`x & (x - 1)\` clears the lowest set bit, which is how you check if a number is a power of two (\`x & (x-1) == 0\`) or count set bits without a lookup table. \`x & -x\` isolates the lowest set bit on its own. These show up constantly in flag-checking code and in interview questions about bit manipulation specifically because they compress a loop into one instruction.`,
    resources: [
      { label: "Two's complement — Wikipedia", url: "https://en.wikipedia.org/wiki/Two%27s_complement" },
      { label: "Bit Twiddling Hacks", url: "https://graphics.stanford.edu/~seander/bithacks.html" },
    ],
  },
  {
    id: "digital-logic",
    track: "embedded-systems",
    title: "Digital Logic & Computer Architecture Basics",
    blurb: "Gates, registers, and the ALU -- what's actually underneath the C code, rebuilt from scratch.",
    lesson: `This is the layer under the layer: before there's a processor to run C on, there's a handful of logic gates wired together, and everything above is built out of more of the same idea, repeated at scale.

**Logic gates are the alphabet.** AND outputs 1 only if both inputs are 1; OR outputs 1 if either is; NOT inverts a single input; XOR outputs 1 only if its inputs differ. NAND (AND then NOT) and NOR are "universal" gates -- either one alone can be wired together to build every other gate, which is a fact interviewers like precisely because it's surprising the first time you hear it.

**Combinational logic has no memory: same inputs, same outputs, instantly** (in principle -- real gates have propagation delay). An adder built from gates is combinational: feed it two numbers, it outputs their sum, and it forgets the moment the inputs change. **Sequential logic has memory**, built from a flip-flop -- the simplest circuit that can hold one bit and change it only when a clock edge tells it to. Chain enough flip-flops together and you have a register: a small, fast storage location the processor can read and write in a single cycle, which is the whole reason registers are faster than RAM -- there's no bus, no address decode, just wires directly into the ALU.

**The ALU (Arithmetic Logic Unit) is the part that actually computes** -- addition, subtraction, the bitwise operations from the previous topic, comparisons -- and a control unit feeds it operands from registers and routes its result back. That register-ALU-register loop, repeated once per instruction, is the machine underneath every line of C you write.

**Von Neumann vs. Harvard architecture is about whether instructions and data share one memory or two.** A von Neumann machine stores code and data in the same memory space, fetched over the same bus -- simple, flexible, and it means a buggy write can (in principle) corrupt executable code, which is part of why stack-overflow-style attacks are possible at all. A Harvard architecture keeps instruction memory and data memory physically separate with separate buses -- common in microcontrollers, where it lets an instruction fetch and a data access happen in the same cycle instead of contending for one bus, and where it's an actual security property: you cannot overwrite code by overflowing a data buffer.`,
    resources: [
      { label: "Logic gate — Wikipedia", url: "https://en.wikipedia.org/wiki/Logic_gate" },
      { label: "Harvard architecture — Wikipedia", url: "https://en.wikipedia.org/wiki/Harvard_architecture" },
    ],
  },
  {
    id: "assembly-fetch-execute",
    track: "embedded-systems",
    title: "Assembly & the Fetch-Execute Cycle",
    blurb: "What one instruction actually does, and why a function call needs a stack frame.",
    lesson: `Every instruction a processor runs, whether it came from hand-written assembly or a C compiler, goes through the same cycle, over and over, billions of times a second.

**Fetch, decode, execute.** Fetch reads the next instruction from memory at the address the program counter (PC) holds. Decode figures out what that instruction's bits mean -- which operation, which registers, which addressing mode. Execute does it: the ALU computes, a register updates, a memory address is read or written. Then the PC advances (or, for a jump or branch, gets overwritten with a new address) and the cycle repeats. Everything a processor does, from a single \`ADD\` to running an entire operating system, is this loop running continuously.

**Registers are the processor's own local variables** -- a small, fixed number of storage locations built directly into the CPU, orders of magnitude faster to access than RAM because there's no memory bus involved. An assembly instruction like \`ADD R1, R2, R3\` (add the contents of R2 and R3, store the result in R1) operates entirely on registers; getting a value from memory into a register is a separate \`LOAD\` instruction, and getting it back out is a \`STORE\` -- this load/store discipline is exactly why "how many memory accesses does this take" is a meaningful question in low-level code.

**A function call needs somewhere to remember where to return to and where its local variables live, and that's the stack frame.** Calling a function pushes a return address (where execution resumes afterward) onto the stack, then typically the caller's frame pointer, then space for the callee's local variables. The *calling convention* is the agreed rule for how arguments get passed -- in registers, on the stack, or some mix -- and who's responsible for cleaning the stack up afterward; different platforms and compilers disagree, which is exactly why calling a function compiled with the wrong convention corrupts the stack instead of erroring cleanly.

**This is also the mechanism a stack buffer overflow exploits.** A local array lives in the current stack frame, below the saved return address in the typical layout. Write past the end of that array with no bounds check, and you're overwriting the return address itself -- so when the function returns, execution jumps to whatever address you wrote there instead of back to the caller. That's the entire mechanism behind classic stack-smashing attacks, and it's the concrete reason "always bounds-check a buffer" is not academic advice in this domain.`,
    resources: [
      { label: "Instruction cycle — Wikipedia", url: "https://en.wikipedia.org/wiki/Instruction_cycle" },
      { label: "x86 Calling Conventions — Wikipedia", url: "https://en.wikipedia.org/wiki/X86_calling_conventions" },
    ],
  },
];

export const questions: Question[] = [
  {
    id: "es-c-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "c-embedded",
    difficulty: 1,
    prompt: "What does the expression `*p` do, given `int *p`?",
    options: [
      { id: "a", text: "Reads or writes the int value stored at the address p holds" },
      { id: "b", text: "Multiplies p by the value it points to" },
      { id: "c", text: "Returns the address of p itself" },
      { id: "d", text: "Declares a new pointer named p" },
    ],
    answer: "a",
    explanation:
      "* is the dereference operator: it follows the pointer to the memory it addresses. &p, by contrast, would give you the address of the pointer variable itself, not what it points to.",
    concepts: ["Pointer", "Dereference operator"],
  },
  {
    id: "es-c-002",
    type: "mcq",
    track: "embedded-systems",
    topic: "c-embedded",
    difficulty: 2,
    context: "`int arr[5]; int *p = arr; p = p + 1;`",
    prompt: "How far does p move in memory?",
    options: [
      { id: "a", text: "By sizeof(int) bytes — typically 4" },
      { id: "b", text: "By exactly 1 byte" },
      { id: "c", text: "By sizeof(arr) bytes" },
      { id: "d", text: "It doesn't move; p+1 is a type error" },
    ],
    answer: "a",
    explanation:
      "Pointer arithmetic is scaled by the size of the pointed-to type, so p + 1 on an int* advances by sizeof(int) bytes, landing on the next element of the array — not the next byte.",
    concepts: ["Pointer arithmetic"],
  },
  {
    id: "es-c-003",
    type: "short",
    track: "embedded-systems",
    topic: "c-embedded",
    difficulty: 2,
    context:
      "A pointer still holds the address of a heap block after that block has been freed, and the code later dereferences it.",
    prompt: "What is this bug called? (Two words.)",
    answers: ["use after free", "use-after-free"],
    typoTolerance: true,
    explanation:
      "A use-after-free. The memory may still hold the old data for a while, making the bug look harmless right up until something else reuses that memory and the read or write corrupts unrelated state.",
    concepts: ["Use-after-free", "Dangling pointer"],
  },
  {
    id: "es-c-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "c-embedded",
    difficulty: 2,
    prompt: "Why does `volatile` exist?",
    options: [
      {
        id: "a",
        text: "It tells the compiler the value can change for reasons it can't see, so it must not cache or optimise reads away",
      },
      { id: "b", text: "It makes a variable read-only" },
      { id: "c", text: "It forces a variable to be stored in a register" },
      { id: "d", text: "It marks a variable as thread-local" },
    ],
    answer: "a",
    explanation:
      "Without volatile, the compiler may assume a variable your code never writes inside a loop can't change and hoist the read out of the loop entirely. volatile forces a fresh read every time — necessary for hardware registers, signal handlers, or anything another thread changes.",
    concepts: ["volatile", "Compiler optimisation"],
  },
  {
    id: "es-c-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "c-embedded",
    difficulty: 3,
    context: "`char buf[8]; strcpy(buf, userInput);` where userInput is attacker-controlled and unbounded.",
    prompt: "What is the risk here, precisely?",
    options: [
      {
        id: "a",
        text: "strcpy has no length check, so input longer than 8 bytes overwrites whatever memory follows buf",
      },
      { id: "b", text: "strcpy is slower than memcpy, causing a timing issue" },
      { id: "c", text: "buf will simply be truncated at 8 bytes automatically" },
      { id: "d", text: "This only fails if userInput contains non-ASCII characters" },
    ],
    answer: "a",
    explanation:
      "strcpy copies until it hits a null terminator, with no idea how big the destination is. Input longer than the buffer overflows into adjacent memory — the classic buffer overflow, and the reason strcpy is on every 'do not use' list for untrusted input.",
    concepts: ["Buffer overflow", "strcpy"],
  },
  {
    id: "es-c-006",
    type: "multi",
    track: "embedded-systems",
    topic: "c-embedded",
    difficulty: 3,
    prompt: "Which are true of a header file (.h)? Select all that apply.",
    options: [
      { id: "a", text: "It typically declares function signatures and struct shapes, not their implementation" },
      { id: "b", text: "Include guards prevent it from being processed twice if included transitively more than once" },
      { id: "c", text: "It must contain the compiled machine code for every function it declares" },
      { id: "d", text: "Other .c files include it so the compiler knows a function's shape before it's called" },
    ],
    answers: ["a", "b", "d"],
    explanation:
      "A header declares; the .c file defines. Include guards (#ifndef/#define or #pragma once) stop the same declarations being read twice when headers include each other, which would otherwise be a compile error. Machine code belongs in the compiled object file, never the header.",
    concepts: ["Header file", "Include guard", "Declaration vs. definition"],
  },
  {
    id: "es-c-007",
    type: "mcq",
    track: "embedded-systems",
    topic: "c-embedded",
    difficulty: 4,
    prompt: "A `static` variable declared inside a function, not at file scope — what's true of it?",
    options: [
      {
        id: "a",
        text: "It persists across calls, initialised once, instead of being recreated on the stack each call",
      },
      { id: "b", text: "It behaves identically to a normal local variable" },
      { id: "c", text: "It is automatically shared across threads safely" },
      { id: "d", text: "It is visible to every other file in the program" },
    ],
    answer: "a",
    explanation:
      "static on a local variable moves its storage out of the stack frame into static storage that lives for the program's whole run, keeping its value between calls. It is not automatically thread-safe — concurrent calls can race on it, which is a common source of bugs in code ported from single-threaded to multi-threaded use.",
    concepts: ["static keyword", "Storage duration"],
  },
  {
    id: "es-num-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "number-systems",
    difficulty: 1,
    prompt: "What is 0x0F in binary?",
    options: [
      { id: "a", text: "00001111" },
      { id: "b", text: "11110000" },
      { id: "c", text: "00000001" },
      { id: "d", text: "11111111" },
    ],
    answer: "a",
    explanation:
      "Each hex digit maps to exactly 4 bits. 0 is 0000 and F is 1111, so 0x0F is 00001111 — 15 in decimal.",
    concepts: ["Hexadecimal", "Binary representation"],
  },
  {
    id: "es-num-002",
    type: "short",
    track: "embedded-systems",
    topic: "number-systems",
    difficulty: 2,
    prompt: "In an 8-bit signed two's complement integer, what is the range of representable values?",
    answers: ["-128 to 127", "-128 127"],
    explanation:
      "-128 to 127. The top bit acts as a sign bit within two's complement's addition-friendly scheme, and zero needs only one representation, which is why the negative range is one wider than the positive range.",
    concepts: ["Two's complement", "Signed integer range"],
  },
  {
    id: "es-num-003",
    type: "mcq",
    track: "embedded-systems",
    topic: "number-systems",
    difficulty: 2,
    prompt: "How do you negate a number in two's complement?",
    options: [
      { id: "a", text: "Invert every bit, then add 1" },
      { id: "b", text: "Flip only the sign bit" },
      { id: "c", text: "Invert every bit, no further step" },
      { id: "d", text: "Subtract the number from 0xFF" },
    ],
    answer: "a",
    explanation:
      "Invert (one's complement), then add one. This is what makes ordinary binary addition produce correct results for negative numbers without the ALU needing separate subtraction logic — a - b is computed as a + (~b + 1).",
    concepts: ["Two's complement", "Bitwise NOT"],
  },
  {
    id: "es-num-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "number-systems",
    difficulty: 2,
    context: "`uint8_t flags = 0b00000000; flags |= (1 << 3);`",
    prompt: "What is the value of flags after this line?",
    options: [
      { id: "a", text: "0b00001000" },
      { id: "b", text: "0b00000011" },
      { id: "c", text: "0b11111000" },
      { id: "d", text: "0b00000001" },
    ],
    answer: "a",
    explanation:
      "1 << 3 shifts a single 1 bit left three places, producing 0b00001000. OR-ing that into flags sets bit 3 and leaves every other bit untouched — the standard idiom for setting one flag without disturbing the rest.",
    concepts: ["Bitwise OR", "Left shift", "Bit flags"],
  },
  {
    id: "es-num-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "number-systems",
    difficulty: 3,
    context: "`uint8_t x = 0b01101100;`",
    prompt: "What does `x & (x - 1)` compute, as a general-purpose idiom?",
    options: [
      { id: "a", text: "x with its lowest set bit cleared" },
      { id: "b", text: "x with all bits inverted" },
      { id: "c", text: "The number of bits set in x" },
      { id: "d", text: "x rounded up to the next power of two" },
    ],
    answer: "a",
    explanation:
      "x - 1 flips every bit from the lowest set bit downward; ANDing with the original x clears that lowest set bit and leaves everything above it unchanged. Repeating it in a loop counts set bits in the number of iterations equal to the count, not the bit width.",
    concepts: ["Bit manipulation", "Bitwise AND"],
  },
  {
    id: "es-num-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "number-systems",
    difficulty: 3,
    prompt: "For an unsigned integer, what does `x << 1` compute?",
    options: [
      { id: "a", text: "x multiplied by 2 (dropping any bit shifted off the top)" },
      { id: "b", text: "x divided by 2" },
      { id: "c", text: "The bitwise complement of x" },
      { id: "d", text: "x with its sign flipped" },
    ],
    answer: "a",
    explanation:
      "Shifting left by one is equivalent to multiplying by two, as long as no set bit is shifted past the top of the type's width — if one is, that information is silently lost, which is exactly how left-shift overflow bugs happen.",
    concepts: ["Left shift", "Bitwise operations"],
  },
  {
    id: "es-num-007",
    type: "mcq",
    track: "embedded-systems",
    topic: "number-systems",
    difficulty: 4,
    prompt: "Why is right-shifting a negative signed integer (`x >> 1` where x < 0) a place bugs hide?",
    options: [
      {
        id: "a",
        text: "Whether it sign-extends (arithmetic shift) or zero-fills (logical shift) is implementation-defined in C, so behaviour can differ across compilers",
      },
      { id: "b", text: "It always crashes on negative input" },
      { id: "c", text: "C forbids shifting negative numbers entirely" },
      { id: "d", text: "It silently converts the value to unsigned first" },
    ],
    answer: "a",
    explanation:
      "Most compilers implement an arithmetic right shift (sign-extending, so the result stays negative), but older C standards left this implementation-defined rather than mandating it. Code that assumes one behaviour and runs on a compiler with the other gets a silently wrong answer — a real source of porting bugs.",
    concepts: ["Arithmetic vs. logical shift", "Implementation-defined behaviour"],
  },
  {
    id: "es-logic-001",
    type: "matching",
    track: "embedded-systems",
    topic: "digital-logic",
    difficulty: 1,
    prompt: "Match each gate to its output rule.",
    pairs: [
      { left: "AND", right: "Outputs 1 only if both inputs are 1" },
      { left: "OR", right: "Outputs 1 if either input is 1" },
      { left: "NOT", right: "Inverts its single input" },
      { left: "XOR", right: "Outputs 1 only if its inputs differ" },
    ],
    explanation:
      "These four are the alphabet everything else is built from. NAND and NOR are 'universal' — either alone can be wired together to reconstruct AND, OR, and NOT, which is why real chips are so often built almost entirely out of one of them.",
    concepts: ["Logic gate", "AND gate", "OR gate", "XOR gate"],
  },
  {
    id: "es-logic-002",
    type: "mcq",
    track: "embedded-systems",
    topic: "digital-logic",
    difficulty: 2,
    prompt: "What distinguishes sequential logic from combinational logic?",
    options: [
      { id: "a", text: "Sequential logic has memory and changes state on a clock edge; combinational logic has none and reacts instantly to its inputs" },
      { id: "b", text: "Combinational logic is slower than sequential logic" },
      { id: "c", text: "Sequential logic only exists in software, never in hardware" },
      { id: "d", text: "They are two names for the same thing" },
    ],
    answer: "a",
    explanation:
      "A combinational circuit (like an adder) has no memory: given the same inputs, it always produces the same outputs immediately. A sequential circuit, built from flip-flops, holds state and only updates on a clock edge — which is what makes registers and counters possible.",
    concepts: ["Combinational logic", "Sequential logic", "Flip-flop"],
  },
  {
    id: "es-logic-003",
    type: "short",
    track: "embedded-systems",
    topic: "digital-logic",
    difficulty: 2,
    context: "The simplest circuit that can hold one bit of state, changing only on a clock edge.",
    prompt: "What is this circuit called?",
    answers: ["flip-flop", "flip flop", "flipflop"],
    typoTolerance: true,
    explanation:
      "A flip-flop. Chain enough of them together and you get a register — fast, on-chip storage the processor reads and writes in a single cycle, unlike RAM which needs an address decode and a bus transaction.",
    concepts: ["Flip-flop", "Register"],
  },
  {
    id: "es-logic-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "digital-logic",
    difficulty: 3,
    prompt: "Why are registers faster to access than RAM?",
    options: [
      {
        id: "a",
        text: "They're wired directly into the ALU with no address bus or decode logic, unlike RAM which needs both",
      },
      { id: "b", text: "Registers use a different, faster type of transistor than RAM" },
      { id: "c", text: "Registers are always physically closer to the power supply" },
      { id: "d", text: "There is no actual speed difference in modern processors" },
    ],
    answer: "a",
    explanation:
      "A register is wired directly into the datapath alongside the ALU — reading it is just routing a wire. Accessing RAM means driving an address bus, waiting for the memory to decode it and respond, and routing data back over a separate bus — several extra steps that all cost time.",
    concepts: ["Register", "Random-access memory", "ALU"],
  },
  {
    id: "es-logic-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "digital-logic",
    difficulty: 3,
    prompt: "What's the practical difference between von Neumann and Harvard architecture?",
    options: [
      {
        id: "a",
        text: "Von Neumann shares one memory and bus for code and data; Harvard keeps them physically separate",
      },
      { id: "b", text: "Harvard architecture cannot execute more than one instruction per second" },
      { id: "c", text: "Von Neumann machines have no concept of a program counter" },
      { id: "d", text: "They differ only in clock speed, not memory layout" },
    ],
    answer: "a",
    explanation:
      "Von Neumann stores instructions and data together, fetched over a shared bus — flexible, but code and data contend for the same bus, and a data write can in principle land on executable memory. Harvard architecture, common in microcontrollers, keeps them on separate buses, which also means overflowing a data buffer cannot overwrite code the way it can on a von Neumann machine.",
    concepts: ["Von Neumann architecture", "Harvard architecture"],
  },
  {
    id: "es-logic-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "digital-logic",
    difficulty: 4,
    prompt: "Why are NAND and NOR called 'universal' gates?",
    options: [
      { id: "a", text: "Either one alone can be wired together to construct AND, OR, and NOT" },
      { id: "b", text: "They are the only gates that exist in real hardware" },
      { id: "c", text: "They consume no power" },
      { id: "d", text: "They can only be used in combinational circuits, never sequential ones" },
    ],
    answer: "a",
    explanation:
      "Functional completeness: NAND (or NOR) alone is enough to build every other basic gate through combinations of itself. That's why a lot of real digital logic is fabricated almost entirely from one gate type — it simplifies manufacturing without limiting what can be built.",
    concepts: ["Universal gate", "Functional completeness"],
  },
  {
    id: "es-logic-007",
    type: "mcq",
    track: "embedded-systems",
    topic: "digital-logic",
    difficulty: 2,
    prompt: "What does a NAND gate output?",
    options: [
      { id: "a", text: "0 only when both inputs are 1; 1 in every other case" },
      { id: "b", text: "1 only when both inputs are 1" },
      { id: "c", text: "1 only when exactly one input is 1" },
      { id: "d", text: "The inverse of whichever input changed most recently" },
    ],
    answer: "a",
    explanation:
      "NAND is AND followed by NOT: it outputs 0 in the one case AND would output 1 (both inputs 1), and 1 in every other case. That single inversion is what makes it — and NOR, its OR-based counterpart — enough on its own to build every other basic gate.",
    concepts: ["NAND gate", "Logic gate"],
  },
  {
    id: "es-asm-001",
    type: "ordering",
    track: "embedded-systems",
    topic: "assembly-fetch-execute",
    difficulty: 1,
    prompt: "Put the stages of the instruction cycle in order.",
    items: ["Fetch the next instruction using the program counter", "Decode what the instruction means", "Execute it", "Advance the program counter"],
    explanation:
      "Fetch, decode, execute, advance — then repeat, continuously, for as long as the processor runs. A jump or branch instruction is the one case that overwrites the program counter directly instead of simply advancing it.",
    concepts: ["Instruction cycle", "Program counter"],
  },
  {
    id: "es-asm-002",
    type: "mcq",
    track: "embedded-systems",
    topic: "assembly-fetch-execute",
    difficulty: 2,
    prompt: "Why are registers used for arithmetic instead of operating directly on RAM?",
    options: [
      { id: "a", text: "Registers are far faster to access, and most instruction sets are built around a load/store discipline for exactly that reason" },
      { id: "b", text: "RAM cannot hold numeric values, only characters" },
      { id: "c", text: "Registers are unlimited in number, unlike RAM" },
      { id: "d", text: "There's no real reason — it's a historical convention with no performance effect" },
    ],
    answer: "a",
    explanation:
      "A load/store architecture moves a value from memory into a register with LOAD, computes on registers, and writes a result back out with STORE. Registers are small in number but dramatically faster, so keeping the ALU's hot path entirely register-to-register is what makes the loop fast.",
    concepts: ["Register", "Load/store architecture"],
  },
  {
    id: "es-asm-003",
    type: "short",
    track: "embedded-systems",
    topic: "assembly-fetch-execute",
    difficulty: 2,
    context:
      "The block of stack memory holding a function call's return address, saved registers, and local variables.",
    prompt: "What is this called?",
    answers: ["stack frame", "call frame", "activation record"],
    typoTolerance: true,
    explanation:
      "A stack frame (also called an activation record). Each function call pushes a new one; returning pops it off, restoring the caller's state and jumping back to the saved return address.",
    concepts: ["Stack frame", "Call stack"],
  },
  {
    id: "es-asm-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "assembly-fetch-execute",
    difficulty: 3,
    prompt: "What does a calling convention actually specify?",
    options: [
      {
        id: "a",
        text: "How arguments are passed (registers vs. stack) and who cleans the stack up afterward",
      },
      { id: "b", text: "Which programming language the function was written in" },
      { id: "c", text: "How many times the function may be called" },
      { id: "d", text: "The function's return type only" },
    ],
    answer: "a",
    explanation:
      "It's the agreed contract for passing arguments, returning values, and cleaning up the stack. Two functions compiled under mismatched calling conventions can call each other without a compile error and corrupt the stack at runtime, since neither side is doing anything individually 'wrong.'",
    concepts: ["Calling convention", "Stack frame"],
  },
  {
    id: "es-asm-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "assembly-fetch-execute",
    difficulty: 4,
    context: "`void f(char *input) { char buf[16]; strcpy(buf, input); }` called with a much longer, attacker-controlled input.",
    prompt: "In the typical stack layout, what does overflowing buf eventually overwrite?",
    options: [
      {
        id: "a",
        text: "The saved return address for f, so the function returns execution to wherever the overflow wrote instead of back to the caller",
      },
      { id: "b", text: "Only unrelated global variables, never anything on the stack" },
      { id: "c", text: "The compiled machine code of f itself" },
      { id: "d", text: "Nothing — the compiler always inserts an unconditional bounds check on local arrays" },
    ],
    answer: "a",
    explanation:
      "A local buffer typically sits below the saved return address on the stack. Write past its end with no bounds check and you keep writing upward through the frame until you overwrite that return address — so when f returns, control jumps to whatever address landed there. This is the actual mechanism behind classic stack-smashing exploits, not an abstract risk.",
    concepts: ["Stack buffer overflow", "Stack frame", "Return address"],
  },
  {
    id: "es-asm-006",
    type: "short",
    track: "embedded-systems",
    topic: "assembly-fetch-execute",
    difficulty: 2,
    context: "The register that holds the memory address of the next instruction to fetch.",
    prompt: "What is this register usually called? (Two words, or its common acronym.)",
    answers: ["program counter", "pc"],
    typoTolerance: true,
    explanation:
      "The program counter (PC). It advances automatically after each fetch, and a jump or branch instruction is exactly the case where an instruction overwrites it directly instead of letting it advance normally.",
    concepts: ["Program counter"],
  },
];
