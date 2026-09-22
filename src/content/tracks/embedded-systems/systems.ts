import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "embedded-memory",
    track: "embedded-systems",
    title: "Memory Management in Constrained Systems",
    blurb: "Stack vs. heap, memory-mapped I/O, and the bug classes interviewers actually probe for.",
    lesson: `An embedded or systems program manages memory far more explicitly than application code, and the space it has to work with is often measured in kilobytes rather than gigabytes -- which is exactly why the mistakes here matter more than they would in a web service with virtual memory and a garbage collector cleaning up after you.

**The stack and the heap are both RAM, used two completely different ways.** The stack grows and shrinks automatically as functions are called and return -- it holds local variables and stack frames, allocation and deallocation are essentially free (just moving a pointer), and its lifetime is scoped: the moment a function returns, its stack memory is gone, whether or not you still have a pointer to it. The heap is memory you request explicitly (\`malloc\` in C) and must release explicitly (\`free\`); its lifetime is whatever you make it, which is powerful and is also the entire source of two categories of bug: a **memory leak** (allocated, never freed, so usable memory shrinks over the program's life) and a **use-after-free** or **double free** (freed, then still touched, or freed twice). On a device with no virtual memory and no OS to reclaim leaked pages when the process exits, a slow leak in code that's supposed to run for months is not a curiosity, it eventually crashes the device.

**A pointer to a stack variable that's returned or stored past the function's return is a dangling pointer the instant the function returns** -- the memory is still physically there, so it often *appears* to work, right up until something else reuses that stack space and the old data is gone. This is one of the most common junior-level embedded bugs, precisely because it doesn't fail immediately.

**Memory-mapped I/O is how software talks to hardware on most embedded platforms:** a hardware register -- a UART's status flag, a GPIO pin's output state -- is given a fixed memory address, and reading or writing that address reads or writes the hardware directly, through the exact same \`load\`/\`store\` instructions used for ordinary memory. This is precisely why those addresses must be accessed through a \`volatile\`-qualified pointer: the compiler has no way to know the value can change on its own (a peripheral setting a status bit) or that a write has a side effect beyond storing a value (an interrupt-clear register, say), and without \`volatile\` it's free to optimise the access away entirely.

**Alignment and padding matter more here than in application code.** A struct's members are typically padded so each one starts at an address that's a multiple of its own size, because many processors either can't read a misaligned value at all or do so much slower via multiple bus accesses. That padding means \`sizeof(struct)\` is often larger than the sum of its members' sizes -- a fact that trips people up the first time they \`memcpy\` a struct expecting the packed size, and it's why reordering a struct's fields (largest first) can shrink it.`,
    resources: [
      { label: "man7.org: malloc(3)", url: "https://man7.org/linux/man-pages/man3/malloc.3.html" },
      { label: "Memory-mapped I/O — Wikipedia", url: "https://en.wikipedia.org/wiki/Memory-mapped_I/O_and_port-mapped_I/O" },
    ],
  },
  {
    id: "embedded-concurrency",
    track: "embedded-systems",
    title: "Processes, Threads & Concurrency",
    blurb: "Thread safety, races, and the primitives that stop two things touching the same memory at once.",
    lesson: `Embedded and systems code frequently has more than one thing happening at once -- an interrupt firing mid-function, a second thread, a signal handler -- and unlike a single-threaded script, ordering is no longer something you can assume.

**A process has its own memory space; a thread shares memory with every other thread in the same process.** That sharing is the whole point of threads -- fast communication with no copying -- and it's also the whole source of the danger: any thread can read or write any other thread's data structures with no OS-enforced boundary between them the way there is between processes.

**A race condition happens when the correctness of a result depends on the timing of two or more threads,** and that timing isn't guaranteed. The textbook example: two threads both do "read counter, add one, write counter" on a shared variable with no protection. If both read the same starting value before either writes back, one increment is silently lost -- and this happens *rarely enough* in testing that it's a classic "works on my machine, fails in the field" bug.

**A mutex (mutual exclusion lock) makes a region of code atomic with respect to other threads:** only one thread can hold it at a time, so code between lock and unlock runs as if nothing else could interleave with it. A semaphore is more general -- it holds a count rather than a single lock/unlock state, so it can allow up to N threads into a region at once, or be used to signal between threads rather than just protect data. Get the discipline wrong -- forget to unlock, unlock twice, lock in an order that another thread locks in reverse -- and you get a **deadlock**: two threads each holding a lock the other needs, both waiting forever.

**Priority inversion is the specific, nasty case where a low-priority thread holds a lock a high-priority thread needs,** and a medium-priority thread that needs neither lock preempts the low-priority one — so the high-priority thread waits not just for the lock, but indirectly for a thread that outranks it in priority to even get scheduled. This is famous partly because it took down the Mars Pathfinder rover in 1997, and the standard fix — priority inheritance, where the low-priority thread temporarily inherits the waiting thread's priority while it holds the lock — is a concrete, nameable answer interviewers listen for.

**Inter-process communication (IPC)** is how separate processes, which don't share memory, exchange data anyway: pipes, message queues, shared memory segments (which reintroduce the same race conditions threads have, deliberately, in exchange for speed), and sockets — the same mechanism used for network communication, which also works perfectly well between two processes on the same machine.`,
    resources: [
      { label: "man7.org: pthread_mutex_lock(3)", url: "https://man7.org/linux/man-pages/man3/pthread_mutex_lock.3p.html" },
      { label: "Priority inversion — Wikipedia", url: "https://en.wikipedia.org/wiki/Priority_inversion" },
    ],
  },
  {
    id: "embedded-linux",
    track: "embedded-systems",
    title: "Linux Fundamentals for Embedded Systems",
    blurb: "Why appliance-style devices run embedded Linux, and the kernel basics worth actually knowing.",
    lesson: `A lot of what people picture as "embedded" is a small bare-metal microcontroller looping over sensor reads. A network security appliance is a different animal: it's closer to a small, purpose-built computer, and it very often runs a stripped-down Linux rather than a classic RTOS -- which is why Linux fundamentals are a real, frequently-tested part of this kind of interview rather than a side topic.

**Why Linux, on a dedicated appliance, instead of writing everything bare-metal?** Because a kernel that already has a TCP/IP stack, device drivers, a filesystem, and process isolation is an enormous amount of correct, tested infrastructure you don't have to write yourself -- and a networking appliance's entire job is moving and inspecting network traffic, which is exactly the part of the OS that's most mature. The tradeoff is size, boot time, and less deterministic timing than a purpose-built RTOS, which is why the *harder* real-time constraints in this space (packet-processing fast paths) are often pushed into dedicated hardware or kernel-bypass techniques rather than handled in ordinary user-space code.

**The kernel mediates every interaction between a program and the hardware or other programs.** User-space code doesn't touch hardware directly; it asks the kernel to, through a **system call** -- \`read\`, \`write\`, \`open\`, \`fork\`, \`socket\` are all system calls, a controlled, checked doorway between an unprivileged process and the privileged kernel. That privilege split (user mode vs. kernel mode) is a hardware-enforced boundary, not just a convention -- it's what stops a bug in one process from directly corrupting the kernel or another process's memory.

**A process is the OS's unit of isolation: its own memory space, its own file descriptors, scheduled independently.** \`fork()\` creates a near-exact copy of the calling process; \`exec()\` replaces a process's memory with a different program entirely. The common pattern of calling \`fork()\` followed by \`exec()\` in the child is literally how a shell launches every command you type.

**A file descriptor is a small integer the kernel hands back for an open resource** -- a file, a socket, a pipe -- and it's the handle every subsequent \`read\`/\`write\`/\`close\` call uses. The fact that sockets are file descriptors too, not a separate concept, is why so much of the networking API looks like ordinary file I/O: the kernel deliberately unified the interface.

**Everything above assumes a process boundary.** Kernel modules, by contrast, run inside the kernel itself with no such isolation -- a bug in one can crash the whole system, which is exactly the tradeoff a device driver author is making by choosing to live in kernel space rather than user space.`,
    resources: [
      { label: "man7.org: syscalls(2)", url: "https://man7.org/linux/man-pages/man2/syscalls.2.html" },
      { label: "The Linux Kernel documentation", url: "https://www.kernel.org/doc/html/latest/" },
    ],
  },
  {
    id: "embedded-debugging",
    track: "embedded-systems",
    title: "Debugging Embedded & Systems Code",
    blurb: "Reading a crash, the bug classes worth recognising on sight, and debugging without a search engine.",
    lesson: `A live coding round often means debugging someone else's broken C with no internet access and a clock running -- which rewards recognising bug *shapes* on sight over reasoning from first principles every time.

**A segmentation fault means the program touched memory it isn't allowed to touch** -- dereferencing a null or wild pointer, reading past the end of an array into unmapped memory, writing to memory marked read-only (like a string literal). It's the OS's memory-protection hardware catching the access and killing the process before it does more damage, which makes it a relatively *friendly* crash: it fails loudly, immediately, near the actual bug. Memory corruption that doesn't segfault -- a small buffer overflow that lands inside memory that's still mapped -- is worse precisely because nothing stops you at the scene of the crime.

**A null pointer dereference is the single most common crash in C and C++ code,** and the fix discipline is almost always the same: check a pointer for null before using it, especially right after anything that can return null -- \`malloc\` under memory pressure, a failed lookup, an uninitialised pointer nobody assigned yet.

**An off-by-one error is a boundary miscounted by exactly one** -- looping \`<=\` instead of \`<\` against an array's length, or the reverse, is the canonical case, and it's worth checking first whenever a bug's symptom is "the last element is wrong" or "this reads one past where it should."

**A memory leak doesn't crash anything immediately, which is what makes it dangerous on a long-running device** -- available memory shrinks a little at a time until, eventually, an allocation fails somewhere with no obvious connection to the code that actually leaked. Tools like Valgrind exist specifically to catch this class of bug by tracking every allocation and flagging what was never freed.

**A debugger like gdb lets you stop a program mid-execution, inspect memory and registers, and step instruction by instruction** -- which is the practical alternative to littering code with print statements, especially useful when the bug only reproduces under specific timing. A **core dump** is a snapshot of a crashed process's memory taken at the moment it died, loadable into a debugger afterward -- essential when a crash isn't reliably reproducible and you only get one look at it.

**Reading a stack trace backward tells you the call chain that led to the crash** -- the top frame is where it actually failed, and each frame below it is "called from here," down to main. The instinct to fix the top frame is usually right, but not always: sometimes the top frame is a symptom (writing through a pointer that was already corrupted three calls earlier), and the actual bug is further down.`,
    resources: [
      { label: "GDB documentation", url: "https://sourceware.org/gdb/current/onlinedocs/gdb/" },
      { label: "Valgrind documentation", url: "https://valgrind.org/docs/manual/quick-start.html" },
    ],
  },
];

export const questions: Question[] = [
  {
    id: "es-mem-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 1,
    prompt: "What's the key difference in lifetime between stack and heap memory?",
    options: [
      { id: "a", text: "Stack memory is freed automatically when a function returns; heap memory lives until explicitly freed" },
      { id: "b", text: "Heap memory is freed automatically; stack memory must be freed by hand" },
      { id: "c", text: "Both are freed automatically at the same time, at program exit" },
      { id: "d", text: "Neither is ever freed automatically" },
    ],
    answer: "a",
    explanation:
      "The stack's lifetime is scoped to the function call — it unwinds automatically on return. The heap's lifetime is whatever the program makes it, via malloc/free, which is exactly why leaks and use-after-free are heap problems, not stack problems.",
    concepts: ["Stack", "Heap", "Memory lifetime"],
  },
  {
    id: "es-mem-002",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 2,
    context: "Memory is allocated with malloc and the pointer to it is lost — never freed, never reachable again.",
    prompt: "What is this bug called?",
    answers: ["memory leak", "leak"],
    typoTolerance: true,
    explanation:
      "A memory leak. On a long-running embedded device with no OS to reclaim it on process exit, a slow leak eventually exhausts available memory and crashes the device — which is why it matters more here than in a short-lived script.",
    concepts: ["Memory leak"],
  },
  {
    id: "es-mem-003",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 3,
    context: "`int *f() { int x = 5; return &x; }`",
    prompt: "What's wrong with this function?",
    options: [
      {
        id: "a",
        text: "It returns the address of a local variable whose stack frame no longer exists once f returns — a dangling pointer",
      },
      { id: "b", text: "Nothing; returning a pointer to a local variable is always safe in C" },
      { id: "c", text: "It leaks memory, because x is never freed" },
      { id: "d", text: "It will fail to compile" },
    ],
    answer: "a",
    explanation:
      "x lives in f's stack frame, which is deallocated the moment f returns. The returned address still points to where x was, and the caller reading through it is reading memory that may already have been reused — it can appear to work by coincidence, which is what makes this bug hard to catch in testing.",
    concepts: ["Dangling pointer", "Stack frame"],
  },
  {
    id: "es-mem-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 3,
    prompt: "Why must a memory-mapped hardware register be accessed through a `volatile` pointer?",
    options: [
      {
        id: "a",
        text: "The value can change from outside the program's control flow, and without volatile the compiler may cache a stale copy or optimise repeated reads away",
      },
      { id: "b", text: "volatile makes the access faster" },
      { id: "c", text: "It's required syntax with no actual effect on generated code" },
      { id: "d", text: "It prevents the address from ever being read twice" },
    ],
    answer: "a",
    explanation:
      "A status register can change because of hardware activity the compiler has no visibility into. Without volatile, the compiler is free to assume the value is unchanged if the code never writes to it and skip re-reading it — which would mean the program never notices the hardware state changing.",
    concepts: ["volatile", "Memory-mapped I/O"],
  },
  {
    id: "es-mem-005",
    type: "multi",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 3,
    prompt: "Which are true about struct padding and alignment? Select all that apply.",
    options: [
      { id: "a", text: "A struct's members are often padded so each starts at an address aligned to its own size" },
      { id: "b", text: "sizeof(struct) can be larger than the sum of its members' individual sizes" },
      { id: "c", text: "Reordering fields (largest first) can sometimes shrink a struct's total size" },
      { id: "d", text: "Padding never affects sizeof; it's purely a runtime concept" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Many processors either can't access a misaligned value in one operation or do so more slowly, so compilers pad struct members to keep them aligned. That padding is counted in sizeof, and ordering fields from largest to smallest often reduces the padding needed between them.",
    concepts: ["Struct padding", "Memory alignment"],
  },
  {
    id: "es-mem-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 4,
    prompt: "A device has no virtual memory or MMU. What's the practical consequence for a wild pointer write?",
    options: [
      {
        id: "a",
        text: "It can corrupt any physical memory it happens to address, including other running code, with no hardware protection catching it",
      },
      { id: "b", text: "The OS automatically isolates every process's memory regardless" },
      { id: "c", text: "It behaves identically to a system with an MMU — segfaults are guaranteed" },
      { id: "d", text: "It has no effect, since embedded devices don't use pointers" },
    ],
    answer: "a",
    explanation:
      "An MMU is what enforces per-process memory protection and turns an invalid access into a clean segfault. Without one — common on smaller microcontrollers — a wild write just lands wherever it lands, silently corrupting whatever's physically there, which is exactly why bare-metal embedded bugs can be so much harder to localise than a desktop segfault.",
    concepts: ["Memory protection unit", "Wild pointer"],
  },
  {
    id: "es-mem-007",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 1,
    context: "The C function used to request a block of heap memory at runtime, and the one used to release it.",
    prompt: "Name the pair. (Two words, e.g. \"x and y\".)",
    answers: ["malloc and free", "malloc, free", "malloc free"],
    typoTolerance: true,
    explanation:
      "malloc requests a block of heap memory; free releases it. Every successful malloc needs exactly one matching free — call it twice (a double free) or not at all (a leak) and you've introduced one of the two classic heap bugs.",
    concepts: ["malloc", "free", "Heap"],
  },
  {
    id: "es-mem-008",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-memory",
    difficulty: 2,
    prompt: "What does it mean to call `free()` twice on the same pointer?",
    options: [
      { id: "a", text: "A double free — undefined behaviour that can corrupt the heap's own bookkeeping structures" },
      { id: "b", text: "A harmless no-op the second time" },
      { id: "c", text: "It automatically reallocates the same block" },
      { id: "d", text: "A compile-time error" },
    ],
    answer: "a",
    explanation:
      "The heap allocator keeps its own metadata about free and used blocks, and freeing the same pointer twice corrupts that bookkeeping — the second free() has no way to know the block was already returned. It's undefined behaviour, not a clean error, which is exactly what makes it dangerous rather than merely wrong.",
    concepts: ["Double free", "Heap"],
  },
  {
    id: "es-conc-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 1,
    prompt: "What's the key difference between a process and a thread?",
    options: [
      { id: "a", text: "A process has its own memory space; threads within the same process share memory" },
      { id: "b", text: "A thread always runs on a different physical core than its process" },
      { id: "c", text: "A process can only run one instruction at a time, but threads cannot" },
      { id: "d", text: "There is no meaningful difference" },
    ],
    answer: "a",
    explanation:
      "Shared memory between threads is the whole point — fast communication with no copying — and it's also the entire source of race conditions, since there's no OS-enforced boundary stopping one thread from touching another's data.",
    concepts: ["Process", "Thread"],
  },
  {
    id: "es-conc-002",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 2,
    context:
      "The correctness of a result depends on the unpredictable timing of two or more threads accessing shared data.",
    prompt: "What is this called? (Two words.)",
    answers: ["race condition"],
    typoTolerance: true,
    explanation:
      "A race condition. The classic example is two threads both reading, incrementing, and writing back a shared counter — if both read before either writes, one increment is silently lost, and the bug reproduces rarely enough to slip through casual testing.",
    concepts: ["Race condition"],
  },
  {
    id: "es-conc-003",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 2,
    prompt: "What does locking a mutex around a block of code guarantee?",
    options: [
      { id: "a", text: "Only one thread can execute that block at a time; others block until it's unlocked" },
      { id: "b", text: "The code runs faster than it would unprotected" },
      { id: "c", text: "The code can never crash" },
      { id: "d", text: "Every other thread is paused entirely, system-wide" },
    ],
    answer: "a",
    explanation:
      "A mutex enforces mutual exclusion on the protected region specifically — other threads keep running, they just block if they try to enter the same locked region until it's released.",
    concepts: ["Mutex", "Mutual exclusion"],
  },
  {
    id: "es-conc-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 3,
    prompt: "How does a semaphore differ from a mutex in general?",
    options: [
      {
        id: "a",
        text: "A semaphore holds a count and can allow up to N threads in at once, or signal between threads; a mutex is a single lock/unlock state for exclusion",
      },
      { id: "b", text: "A semaphore can only be used between processes, never threads" },
      { id: "c", text: "They are functionally identical in every implementation" },
      { id: "d", text: "A mutex can be held by multiple threads simultaneously; a semaphore cannot" },
    ],
    answer: "a",
    explanation:
      "A mutex is binary: locked or unlocked, typically owned by whoever locked it. A semaphore generalises that to a count, which is what lets it either gate access to N interchangeable resources or act as a signal between threads rather than strictly a lock.",
    concepts: ["Semaphore", "Mutex"],
  },
  {
    id: "es-conc-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 3,
    context: "Thread A holds lock 1 and waits for lock 2. Thread B holds lock 2 and waits for lock 1.",
    prompt: "What is this situation called?",
    options: [
      { id: "a", text: "Deadlock — neither thread can ever proceed" },
      { id: "b", text: "Race condition" },
      { id: "c", text: "Priority inversion" },
      { id: "d", text: "Starvation" },
    ],
    answer: "a",
    explanation:
      "A deadlock: each thread holds what the other needs and neither will release it, so both wait forever. The standard prevention is a consistent lock ordering — every thread that needs both locks always acquires them in the same order.",
    concepts: ["Deadlock", "Lock ordering"],
  },
  {
    id: "es-conc-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 4,
    context: "A low-priority thread holds a lock a high-priority thread needs. A medium-priority thread, needing neither lock, keeps preempting the low-priority one.",
    prompt: "What is this scenario, and what's the standard fix?",
    options: [
      {
        id: "a",
        text: "Priority inversion — fixed by priority inheritance, temporarily raising the low-priority thread's priority while it holds the contested lock",
      },
      { id: "b", text: "A race condition, fixed by adding a second mutex" },
      { id: "c", text: "A deadlock, fixed by killing the medium-priority thread" },
      { id: "d", text: "Normal scheduler behaviour that needs no fix" },
    ],
    answer: "a",
    explanation:
      "This is priority inversion — famous for contributing to the Mars Pathfinder's watchdog resets in 1997. Priority inheritance temporarily boosts the lock-holding thread to the waiting thread's priority so the medium-priority thread can't keep cutting in line, letting the lock get released promptly.",
    concepts: ["Priority inversion", "Priority inheritance"],
  },
  {
    id: "es-conc-007",
    type: "multi",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 3,
    prompt: "Which of these are legitimate forms of inter-process communication (IPC)? Select all that apply.",
    options: [
      { id: "a", text: "Pipes" },
      { id: "b", text: "Shared memory segments" },
      { id: "c", text: "Sockets" },
      { id: "d", text: "Directly dereferencing a pointer from another process's address space" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Pipes, shared memory, and sockets are all real, OS-provided IPC mechanisms — each trading off differently between speed and safety (shared memory is fastest and reintroduces the same races threads have, deliberately). A pointer from another process's address space is meaningless outside it — processes don't share an address space, which is the whole reason IPC mechanisms exist.",
    concepts: ["Inter-process communication", "Shared memory"],
  },
  {
    id: "es-conc-008",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-concurrency",
    difficulty: 2,
    context: "Code that behaves correctly no matter how multiple threads happen to interleave through it.",
    prompt: "What property is this called? (Two words.)",
    answers: ["thread safe", "thread-safe", "thread safety"],
    typoTolerance: true,
    explanation:
      "Thread safety. It's not automatic — shared mutable state needs deliberate protection (a mutex, or avoiding the sharing entirely) to earn that property, which is exactly why 'is this thread-safe?' is one of the first questions to ask about any function touching shared data.",
    concepts: ["Thread safety"],
  },
  {
    id: "es-linux-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-linux",
    difficulty: 1,
    prompt: "What is a system call?",
    options: [
      { id: "a", text: "A controlled request from user-space code asking the kernel to do something on its behalf" },
      { id: "b", text: "A function call between two files in the same program" },
      { id: "c", text: "A call made over the network to a remote system" },
      { id: "d", text: "A compiler-generated call inserted automatically at every function return" },
    ],
    answer: "a",
    explanation:
      "System calls (read, write, open, socket, fork, and many more) are the only doorway between unprivileged user-space code and the privileged kernel. A program never touches hardware directly — it asks the kernel to, through this checked interface.",
    concepts: ["System call", "Kernel"],
  },
  {
    id: "es-linux-002",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-linux",
    difficulty: 2,
    prompt: "Why does a security appliance often run embedded Linux instead of a bare-metal loop?",
    options: [
      {
        id: "a",
        text: "It inherits a mature, tested TCP/IP stack, drivers, and process isolation, rather than requiring all of that to be written from scratch",
      },
      { id: "b", text: "Linux is required by law for any device that connects to a network" },
      { id: "c", text: "Bare-metal code cannot process network packets at all" },
      { id: "d", text: "Linux uses less memory than bare-metal firmware in every case" },
    ],
    answer: "a",
    explanation:
      "A networking appliance's core job — moving and inspecting traffic — is exactly the part of an OS that's most mature in Linux. The tradeoff is size and less deterministic timing than a purpose-built RTOS, which is why the hardest real-time paths in this space often get pushed to dedicated hardware instead.",
    concepts: ["Embedded Linux", "Real-time operating system"],
  },
  {
    id: "es-linux-003",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-linux",
    difficulty: 2,
    context: "The small integer the kernel returns for an open file, socket, or pipe, used by every subsequent read/write/close call on it.",
    prompt: "What is this called? (Two words.)",
    answers: ["file descriptor"],
    typoTolerance: true,
    explanation:
      "A file descriptor. The fact that sockets are file descriptors too — not a separate concept — is why so much of the networking API reads exactly like ordinary file I/O: the kernel deliberately unified the interface.",
    concepts: ["File descriptor"],
  },
  {
    id: "es-linux-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-linux",
    difficulty: 3,
    prompt: "What's the effect of calling `fork()`?",
    options: [
      { id: "a", text: "It creates a near-exact copy of the calling process, returning twice — once in each" },
      { id: "b", text: "It replaces the current process's memory with a new program" },
      { id: "c", text: "It creates a new thread within the same process" },
      { id: "d", text: "It terminates the calling process" },
    ],
    answer: "a",
    explanation:
      "fork() duplicates the calling process; both the parent and the new child continue executing from the same point, distinguished by fork's return value (0 in the child, the child's PID in the parent). Following it with exec() to load a different program is literally how a shell launches the commands you type.",
    concepts: ["fork()", "exec()", "Process"],
  },
  {
    id: "es-linux-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-linux",
    difficulty: 4,
    prompt: "Why is a bug in a kernel module more dangerous than the same bug in a user-space process?",
    options: [
      {
        id: "a",
        text: "Kernel modules run inside the kernel with no process isolation, so a bug there can crash or corrupt the entire system, not just one process",
      },
      { id: "b", text: "There's no actual difference — both run in the same protection domain" },
      { id: "c", text: "Kernel modules cannot access hardware, so they're inherently safer" },
      { id: "d", text: "User-space bugs are always more severe because they're closer to the application" },
    ],
    answer: "a",
    explanation:
      "The user/kernel privilege split is exactly what protects one process from another. A kernel module lives inside the kernel itself, outside that isolation — which is the tradeoff a device driver author accepts by writing kernel-space code instead of a user-space daemon talking to the hardware through a narrower interface.",
    concepts: ["Kernel module", "Privilege level"],
  },
  {
    id: "es-linux-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-linux",
    difficulty: 2,
    prompt: "What uniquely identifies a running process to the kernel?",
    options: [
      { id: "a", text: "Its process ID (PID)" },
      { id: "b", text: "Its file descriptor number" },
      { id: "c", text: "Its variable names" },
      { id: "d", text: "Its memory address" },
    ],
    answer: "a",
    explanation:
      "Every process gets a unique PID from the kernel at creation, used for everything from sending it a signal to reading its status in /proc. File descriptors, by contrast, are scoped to a single process, not global identifiers.",
    concepts: ["Process ID"],
  },
  {
    id: "es-debug-001",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-debugging",
    difficulty: 1,
    prompt: "What does a segmentation fault mean?",
    options: [
      { id: "a", text: "The program tried to access memory it isn't permitted to access, and the OS killed it" },
      { id: "b", text: "The program ran out of CPU time" },
      { id: "c", text: "A network segment was unreachable" },
      { id: "d", text: "The compiler found a syntax error" },
    ],
    answer: "a",
    explanation:
      "The hardware's memory-protection mechanism caught an invalid access — a null or wild pointer, reading past an array into unmapped memory, writing to read-only memory — and the OS terminated the process before it could do more damage. It's actually a relatively friendly failure mode: loud and immediate, near the real bug.",
    concepts: ["Segmentation fault"],
  },
  {
    id: "es-debug-002",
    type: "short",
    track: "embedded-systems",
    topic: "embedded-debugging",
    difficulty: 1,
    context: "A loop condition uses <= instead of < against an array's length, reading one element past the end.",
    prompt: "What is this class of bug commonly called? (Three words, hyphenated.)",
    answers: ["off-by-one error", "off by one error", "off-by-one"],
    typoTolerance: true,
    explanation:
      "An off-by-one error. Worth checking first whenever a symptom is 'the last element is wrong' or 'this reads one past where it should.'",
    concepts: ["Off-by-one error"],
  },
  {
    id: "es-debug-003",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-debugging",
    difficulty: 2,
    prompt: "What is a core dump?",
    options: [
      { id: "a", text: "A snapshot of a crashed process's memory at the moment it died, loadable into a debugger afterward" },
      { id: "b", text: "A backup of the entire filesystem taken every hour" },
      { id: "c", text: "The compiled binary of a program before optimisation" },
      { id: "d", text: "A log of every system call a process made" },
    ],
    answer: "a",
    explanation:
      "A core dump captures memory and register state at the moment of a crash. It's especially valuable when the crash isn't reliably reproducible and a debugger session live, watching it happen, isn't an option.",
    concepts: ["Core dump", "Debugger"],
  },
  {
    id: "es-debug-004",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-debugging",
    difficulty: 3,
    prompt: "Reading a stack trace from a crash, top to bottom — what does the top frame tell you?",
    options: [
      {
        id: "a",
        text: "Where execution actually failed, though the real bug can sometimes be further down if the top frame is a symptom of earlier corruption",
      },
      { id: "b", text: "The very first function the program called, i.e. main" },
      { id: "c", text: "Nothing useful — stack traces should be read bottom-up only" },
      { id: "d", text: "The function that will run next if execution continued" },
    ],
    answer: "a",
    explanation:
      "The top frame is where the crash occurred. It's usually where the bug is too, but not always — a pointer corrupted three calls earlier can crash somewhere entirely unrelated when it's finally dereferenced, which is why the trace is a starting point for investigation, not an automatic answer.",
    concepts: ["Stack trace", "Debugging"],
  },
  {
    id: "es-debug-005",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-debugging",
    difficulty: 3,
    prompt: "Why is a small buffer overflow that stays within mapped memory often worse to debug than one that segfaults?",
    options: [
      {
        id: "a",
        text: "Nothing stops the program at the moment of the bug, so the corruption's effect can surface much later, far from its actual cause",
      },
      { id: "b", text: "It's actually easier, because the program keeps running and gives you more time to observe it" },
      { id: "c", text: "Small overflows are always caught by the compiler at build time" },
      { id: "d", text: "There's no meaningful difference between the two" },
    ],
    answer: "a",
    explanation:
      "A segfault fails loudly and immediately, right where the bad access happened. Corruption that lands inside memory that's still mapped doesn't trigger any protection — the program keeps running with quietly wrong state, and the eventual visible failure can be far removed in time and code from the actual cause.",
    concepts: ["Memory corruption", "Buffer overflow"],
  },
  {
    id: "es-debug-006",
    type: "mcq",
    track: "embedded-systems",
    topic: "embedded-debugging",
    difficulty: 2,
    prompt: "A crash reports a null pointer dereference. What's the first thing worth checking?",
    options: [
      {
        id: "a",
        text: "Everywhere that pointer could have been assigned, especially anything that can legitimately return null (a failed malloc, a failed lookup)",
      },
      { id: "b", text: "Whether the compiler was run with optimisations enabled" },
      { id: "c", text: "The network connection, since null pointers are a networking issue" },
      { id: "d", text: "Nothing — null pointer dereferences cannot be debugged, only prevented" },
    ],
    answer: "a",
    explanation:
      "A null pointer dereference is the most common crash in C and C++ for a reason: something returned null (malloc under memory pressure, a failed lookup, an uninitialised pointer) and the caller didn't check before using it. Tracing back to where the pointer was last assigned is almost always the fastest path to the actual bug.",
    concepts: ["Null pointer dereference"],
  },
];
