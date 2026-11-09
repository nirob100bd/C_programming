import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed CForge.");

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

type StepSeed = {
  order: number;
  kind: string;
  title: string;
  body: string;
  starterCode?: string;
  expectedOutput?: string;
  testInput?: string;
  quizOptions?: string[];
  quizAnswer?: string;
  hints?: string[];
  skillKeys?: string[];
  xpReward?: number;
};

type LessonSeed = {
  slug: string;
  title: string;
  world: string;
  worldOrder: number;
  order: number;
  summary: string;
  objectives: string[];
  prerequisites: string[];
  steps: StepSeed[];
};

const SKILLS = [
  ["ct.algorithm", "Algorithm concept", "World 0 — Computational Thinking"],
  ["ct.decomposition", "Problem decomposition", "World 0 — Computational Thinking"],
  ["ct.compilation", "Compilation and execution", "World 0 — Computational Thinking"],
  ["c.variables", "Variables and data types", "World 1 — C Fundamentals"],
  ["c.operators", "Operators and expressions", "World 1 — C Fundamentals"],
  ["c.io", "Input and output", "World 1 — C Fundamentals"],
  ["c.conditionals", "Conditional statements", "World 1 — C Fundamentals"],
  ["c.loops", "Loops", "World 1 — C Fundamentals"],
  ["c.arrays", "Arrays", "World 2 — Arrays and Strings"],
  ["c.strings", "Strings", "World 2 — Arrays and Strings"],
  ["c.sorting", "Sorting", "World 2 — Arrays and Strings"],
  ["c.searching", "Searching", "World 2 — Arrays and Strings"],
  ["c.functions", "Functions", "World 3 — Functions and Recursion"],
  ["c.recursion", "Recursion", "World 3 — Functions and Recursion"],
  ["c.scope", "Scope and storage duration", "World 3 — Functions and Recursion"],
  ["c.pointers.basic", "Pointer fundamentals", "World 4 — Advanced Pointers"],
  ["c.pointers.arithmetic", "Pointer arithmetic", "World 4 — Advanced Pointers"],
  ["c.pointers.arrays", "Pointers and arrays", "World 4 — Advanced Pointers"],
  ["c.pointers.strings", "Pointers and strings", "World 4 — Advanced Pointers"],
  ["c.pointers.functions", "Pointers as function arguments", "World 4 — Advanced Pointers"],
  ["c.pointers.double", "Double pointers", "World 4 — Advanced Pointers"],
  ["c.pointers.function", "Function pointers", "World 4 — Advanced Pointers"],
  ["c.pointers.void", "Void pointers", "World 4 — Advanced Pointers"],
  ["c.pointers.const", "Const correctness", "World 4 — Advanced Pointers"],
  ["c.structs", "Structures", "World 5 — Structures"],
  ["c.structs.nested", "Nested structures", "World 5 — Structures"],
  ["c.structs.pointers", "Structure pointers", "World 5 — Structures"],
  ["c.typedef", "typedef", "World 5 — Structures"],
  ["c.enums", "Enumerations", "World 5 — Structures"],
  ["c.unions", "Unions", "World 5 — Structures"],
  ["c.alignment", "Padding and alignment", "World 5 — Structures"],
  ["c.memory.stack", "Stack vs heap", "World 6 — Dynamic Memory"],
  ["c.memory.malloc", "malloc and calloc", "World 6 — Dynamic Memory"],
  ["c.memory.realloc", "realloc", "World 6 — Dynamic Memory"],
  ["c.memory.free", "free and ownership", "World 6 — Dynamic Memory"],
  ["c.memory.leaks", "Leaks and use-after-free", "World 6 — Dynamic Memory"],
  ["c.memory.dynamic_array", "Dynamic arrays", "World 6 — Dynamic Memory"],
  ["c.files", "File I/O", "World 7 — Files and Professional C"],
  ["c.preprocessor", "Preprocessor and macros", "World 7 — Files and Professional C"],
  ["c.linking", "Compilation, linking, headers", "World 7 — Files and Professional C"],
  ["c.debugging", "Debugging and warnings", "World 7 — Files and Professional C"],
  ["c.undefined", "Undefined behavior", "World 7 — Files and Professional C"],
  ["ds.linked_list", "Linked lists", "World 8 — Data Structures"],
  ["ds.stack_queue", "Stacks and queues", "World 8 — Data Structures"],
  ["ds.hash", "Hash tables", "World 8 — Data Structures"],
  ["ds.tree", "Trees", "World 8 — Data Structures"],
  ["ds.heap", "Heaps", "World 8 — Data Structures"],
  ["ds.graph", "Graphs", "World 8 — Data Structures"],
  ["ds.dsu", "Disjoint set union", "World 8 — Data Structures"],
  ["ds.trie", "Tries", "World 8 — Data Structures"],
  ["algo.complexity", "Complexity analysis", "World 9 — Algorithms"],
  ["algo.sorting", "Sorting algorithms", "World 9 — Algorithms"],
  ["algo.binary_search", "Binary search", "World 9 — Algorithms"],
  ["algo.divide_conquer", "Divide and conquer", "World 9 — Algorithms"],
  ["algo.greedy", "Greedy algorithms", "World 9 — Algorithms"],
  ["algo.backtracking", "Backtracking", "World 9 — Algorithms"],
  ["algo.dp", "Dynamic programming", "World 9 — Algorithms"],
  ["algo.graph_algo", "Graph algorithms", "World 9 — Algorithms"],
  ["algo.number_theory", "Number theory", "World 9 — Algorithms"],
  ["algo.bit_manipulation", "Bit manipulation", "World 9 — Algorithms"],
  ["algo.strings", "String algorithms", "World 9 — Algorithms"],
  ["cp.two_pointers", "Two pointers and sliding window", "World 10 — Competitive Programming"],
  ["cp.prefix_sums", "Prefix sums", "World 10 — Competitive Programming"],
  ["cp.binary_search_answer", "Binary search on answer", "World 10 — Competitive Programming"],
  ["cp.fenwick", "Fenwick trees", "World 10 — Competitive Programming"],
  ["cp.segment", "Segment trees", "World 10 — Competitive Programming"],
  ["cp.monotonic", "Monotonic stacks and queues", "World 10 — Competitive Programming"],
  ["cp.dp_advanced", "Advanced DP", "World 10 — Competitive Programming"],
  ["sys.object_model", "C object representation", "World 11 — Systems C"],
  ["sys.atomic", "Atomic operations", "World 11 — Systems C"],
  ["sys.posix", "POSIX and syscalls", "World 11 — Systems C"],
  ["sys.sockets", "Sockets and networking", "World 11 — Systems C"],
  ["sys.profiling", "Profiling and optimization", "World 11 — Systems C"],
  ["sys.secure", "Secure C development", "World 11 — Systems C"],
  ["se.testing", "Testing and assertions", "World 12 — Software Engineering"],
  ["se.build", "Build systems and Makefiles", "World 12 — Software Engineering"],
  ["se.git", "Git fundamentals", "World 12 — Software Engineering"],
  ["se.review", "Code review and refactoring", "World 12 — Software Engineering"]
] as const;

const ACHIEVEMENTS = [
  ["first.program", "First Program", "Run your first C program.", "rocket"],
  ["first.accepted", "First Accepted", "Solve your first judged problem.", "check"],
  ["first.pointer", "Pointer Awakening", "Solve a pointer challenge.", "arrow-right"],
  ["first.dynamic_memory", "Memory Architect", "Correctly allocate and free heap memory.", "layers"],
  ["first.debug", "Bug Slayer", "Fix a broken program.", "bug"],
  ["optimal.o1", "O(1) Insight", "Rewrite an O(n) solution to O(1).", "zap"],
  ["first.linked_list", "Linked Up", "Implement a linked list.", "link"],
  ["first.graph", "Graph Explorer", "Solve a graph traversal problem.", "share-2"],
  ["ten.accepted", "Steady Hands", "Earn 10 accepted submissions.", "award"],
  ["fifty.accepted", "Sharp Shooter", "Earn 50 accepted submissions.", "target"],
  ["elephant.master", "Elephant Master", "Solve Elephant with the O(1) solution.", "elephant"],
  ["streak.7", "7-Day Streak", "Learn for 7 consecutive days.", "calendar"]
] as const;

const REFERENCE = [
  {
    slug: "printf",
    category: "stdio",
    title: "printf",
    body: "int printf(const char *format, ...); writes formatted output to stdout. It returns the number of characters printed or a negative value on error. Common specifiers include %d for int, %u for unsigned, %ld for long, %f for double, %c for char, %s for a string, %p for a pointer, %x for hexadecimal, and %% for a literal percent. Use %zu for size_t.",
    examples: ['printf("%d\\n", 42);', 'printf("%zu\\n", sizeof(int));']
  },
  {
    slug: "scanf",
    category: "stdio",
    title: "scanf",
    body: "int scanf(const char *format, ...); reads formatted input from stdin. It returns the number of successfully matched items, or EOF on failure. Always check the return value. Width limits prevent overflow, for example %99s for a 100-byte buffer.",
    examples: ['int x; if (scanf("%d", &x) != 1) return 1;']
  },
  {
    slug: "malloc",
    category: "stdlib",
    title: "malloc",
    body: "void *malloc(size_t size); allocates uninitialized memory and returns NULL on failure. The returned pointer must eventually be passed to free. Use sizeof on the pointed-to expression rather than a hardcoded byte count.",
    examples: ["int *a = malloc(n * sizeof *a);", "if (!a) return 1;"]
  },
  {
    slug: "calloc",
    category: "stdlib",
    title: "calloc",
    body: "void *calloc(size_t count, size_t size); allocates count elements and initializes every byte to zero. Check for NULL and free the allocation exactly once. calloc can detect some count-times-size overflow that a manual multiplication may miss.",
    examples: ["int *a = calloc(n, sizeof *a);", "if (a == NULL) return 1;"]
  },
  {
    slug: "realloc",
    category: "stdlib",
    title: "realloc",
    body: "void *realloc(void *ptr, size_t new_size); changes an allocation's size and may move it. On failure it returns NULL while the original allocation remains valid. Assign to a temporary pointer so a failure does not leak the original block.",
    examples: ["int *next = realloc(a, new_n * sizeof *a);", "if (next) a = next;"]
  },
  {
    slug: "free",
    category: "stdlib",
    title: "free",
    body: "void free(void *ptr); releases allocated memory. Calling free on NULL is safe. Double-free and use-after-free are undefined behavior. Clearing a sole owner after free can help prevent accidental reuse, but aliases remain dangling.",
    examples: ["free(a);", "a = NULL;"]
  },
  {
    slug: "pointers",
    category: "language",
    title: "Pointers",
    body: "A pointer stores a memory address. The & operator takes an address and * dereferences a pointer. Pointer arithmetic is scaled by the pointed-to type. Never dereference null, uninitialized, one-past-the-end, or dangling pointers.",
    examples: ["int x = 1;", "int *p = &x;", "*p = 2;"]
  },
  {
    slug: "arrays",
    category: "language",
    title: "Arrays",
    body: "An array is a fixed-size contiguous sequence. Valid indices run from 0 through length minus one. In most expressions an array converts to a pointer to its first element, but an array and a pointer are not the same type or object. C performs no automatic bounds checks.",
    examples: ["int a[4] = {1, 2, 3, 4};", "size_t n = sizeof a / sizeof a[0];"]
  },
  {
    slug: "strings",
    category: "language",
    title: "C strings",
    body: "A C string is an array of char terminated by a zero byte. The terminator consumes storage and must be present before string library functions are used. Track capacity, limit input, and distinguish byte length from array capacity.",
    examples: ['char word[6] = "hello";', "size_t length = strlen(word);"]
  },
  {
    slug: "big-o",
    category: "algorithms",
    title: "Big-O complexity",
    body: "Big-O describes asymptotic growth. O(1) is constant, O(log n) logarithmic, O(n) linear, O(n log n) typical of efficient comparison sorting, O(n²) quadratic, O(2ⁿ) exponential, and O(n!) factorial. Space complexity counts additional storage. Analyze operation counts rather than one benchmark.",
    examples: ["(x + 4) / 5 is O(1).", "A loop over x positions is O(x)."]
  },
  {
    slug: "undefined-behavior",
    category: "language",
    title: "Undefined behavior",
    body: "Undefined behavior means the C standard imposes no requirements. Examples include signed overflow, out-of-bounds access, use-after-free, null dereference, invalid shifts, and unsequenced conflicting modifications. Code with UB can appear correct and then change under optimization. Warnings and sanitizers help find it.",
    examples: ["int a[3];", "a[3] = 0; /* undefined behavior */"]
  },
  {
    slug: "compiler-warnings",
    category: "tooling",
    title: "Compiler warnings",
    body: "Compile learning and production code with a strict warning baseline such as -std=c17 -Wall -Wextra -Wpedantic. Treat every warning as information about a likely defect. Add -Wconversion deliberately when implicit numeric conversions matter.",
    examples: ["gcc -std=c17 -Wall -Wextra -Wpedantic main.c -o main"]
  }
];

const LESSONS: LessonSeed[] = [
  {
    slug: "w0-what-is-programming",
    title: "What is programming?",
    world: "World 0 — Computational Thinking",
    worldOrder: 0,
    order: 1,
    summary: "Programs are precise instructions. Computers execute them literally.",
    objectives: ["Explain what a program is", "Distinguish source from an executable", "Describe an algorithm"],
    prerequisites: [],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Programs are instructions",
        body: "A program is an ordered set of precise instructions. A CPU executes those instructions exactly as represented. If an instruction or assumption is wrong, the machine does not repair the idea for you. Programming begins by turning an informal goal into an unambiguous process.",
        skillKeys: ["ct.algorithm"]
      },
      {
        order: 2,
        kind: "quiz",
        title: "Check your model",
        body: "Which statement best describes a program?",
        quizOptions: ["A random collection of text", "An ordered set of instructions a computer can execute", "A video file", "A saved web page"],
        quizAnswer: "An ordered set of instructions a computer can execute",
        skillKeys: ["ct.algorithm"]
      }
    ]
  },
  {
    slug: "w0-decomposition",
    title: "Decompose a problem",
    world: "World 0 — Computational Thinking",
    worldOrder: 0,
    order: 2,
    summary: "Break a vague goal into inputs, transformations, outputs, and cases.",
    objectives: ["Identify inputs and outputs", "Split work into ordered subproblems", "Find edge cases before coding"],
    prerequisites: ["w0-what-is-programming"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Input, process, output",
        body: "Before syntax, write down what enters the program, what must be computed, and what leaves. Then identify constraints and cases. For a temperature converter: input is a Celsius number, process is F = C × 9/5 + 32, and output is Fahrenheit. This decomposition makes implementation mechanical.",
        skillKeys: ["ct.decomposition"]
      },
      {
        order: 2,
        kind: "quiz",
        title: "Choose the first question",
        body: "You need a program that reports the largest of three numbers. What should you identify first?",
        quizOptions: ["The editor color", "The inputs, required output, and tie behavior", "A recursive function", "The executable file name"],
        quizAnswer: "The inputs, required output, and tie behavior",
        skillKeys: ["ct.decomposition"]
      }
    ]
  },
  {
    slug: "w0-compilation",
    title: "From source to executable",
    world: "World 0 — Computational Thinking",
    worldOrder: 0,
    order: 3,
    summary: "See how C source becomes a running native program.",
    objectives: ["Name the compilation stages", "Explain linking", "Run a first C program"],
    prerequisites: ["w0-decomposition"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "The compilation pipeline",
        body: "C source (.c) moves through preprocessing, compilation, assembly, and linking. The preprocessor handles directives. The compiler translates C to assembly. The assembler creates object code. The linker combines object files and libraries into an executable. GCC can drive every stage.",
        skillKeys: ["ct.compilation"]
      },
      {
        order: 2,
        kind: "code",
        title: "Your first C program",
        body: "Complete the program so it prints exactly: Hello, CForge!",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    // Print the greeting.\n    return 0;\n}\n",
        expectedOutput: "Hello, CForge!",
        hints: ["printf writes formatted output.", "Remember the newline escape sequence: \\n."],
        skillKeys: ["ct.compilation", "c.io"],
        xpReward: 15
      }
    ]
  },
  {
    slug: "w1-variables",
    title: "Variables and types",
    world: "World 1 — C Fundamentals",
    worldOrder: 1,
    order: 1,
    summary: "Represent integers, real numbers, and characters with explicit types.",
    objectives: ["Declare int, double, and char", "Choose format specifiers", "Use sizeof"],
    prerequisites: ["w0-compilation"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Values have types",
        body: "A declaration gives an object a type and name. int represents an implementation-defined integer range, double represents floating-point values, and char occupies one byte. Types control representation, operations, and printf format specifiers. sizeof reports storage in bytes.",
        skillKeys: ["c.variables"]
      },
      {
        order: 2,
        kind: "code",
        title: "Print a variable",
        body: "Declare int answer = 42 and print it on its own line.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int answer = 42;\n    // Print answer.\n    return 0;\n}\n",
        expectedOutput: "42",
        skillKeys: ["c.variables", "c.io"],
        xpReward: 15
      }
    ]
  },
  {
    slug: "w1-input-operators",
    title: "Input and expressions",
    world: "World 1 — C Fundamentals",
    worldOrder: 1,
    order: 2,
    summary: "Read values safely and combine them with typed operators.",
    objectives: ["Check scanf results", "Apply arithmetic precedence", "Recognize integer division"],
    prerequisites: ["w1-variables"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Read, then verify",
        body: "scanf returns the count of successful conversions. Check it before using an input object. Integer division discards the fractional part: 7 / 2 is 3. Cast or use a floating operand when a fractional result is required. Parentheses make intended precedence explicit.",
        skillKeys: ["c.io", "c.operators"]
      },
      {
        order: 2,
        kind: "code",
        title: "A safe average",
        body: "Read two integers and print their arithmetic mean with one digit after the decimal point.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 1;\n    // Compute without accidental integer division.\n    return 0;\n}\n",
        testInput: "3 4",
        expectedOutput: "3.5",
        hints: ["At least one operand must be floating-point.", "printf uses %.1f for one decimal digit."],
        skillKeys: ["c.io", "c.operators"]
      }
    ]
  },
  {
    slug: "w1-conditionals",
    title: "Conditionals",
    world: "World 1 — C Fundamentals",
    worldOrder: 1,
    order: 3,
    summary: "Select behavior with if, else, switch, and boolean expressions.",
    objectives: ["Write if/else chains", "Use comparison operators", "Understand integer truth values"],
    prerequisites: ["w1-input-operators"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Control follows a condition",
        body: "C treats zero as false and nonzero as true. Use == to compare and = to assign. Logical && and || short-circuit from left to right. Braces are strongly recommended even around one statement because they make later edits safer.",
        skillKeys: ["c.conditionals"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sign classifier",
        body: "Read an integer. Print positive, negative, or zero.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    // Classify n.\n    return 0;\n}\n",
        testInput: "0",
        expectedOutput: "zero",
        skillKeys: ["c.conditionals"]
      }
    ]
  },
  {
    slug: "w1-loops",
    title: "Loops",
    world: "World 1 — C Fundamentals",
    worldOrder: 1,
    order: 4,
    summary: "Repeat work with for, while, and do/while without off-by-one mistakes.",
    objectives: ["Write counting loops", "Choose loop bounds", "Use break and continue deliberately"],
    prerequisites: ["w1-conditionals"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "State, condition, progress",
        body: "A terminating loop needs state, a continuation condition, and progress toward making that condition false. for makes these parts visible for counting. while is natural when the iteration count is unknown. do/while runs its body at least once.",
        skillKeys: ["c.loops"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sum 1 through n",
        body: "Read n and use a loop to print 1 + 2 + ... + n.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    long long sum = 0;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    // Add every integer from 1 through n.\n    printf(\"%lld\\n\", sum);\n    return 0;\n}\n",
        testInput: "10",
        expectedOutput: "55",
        skillKeys: ["c.loops"]
      }
    ]
  },
  {
    slug: "w2-arrays",
    title: "Arrays and bounds",
    world: "World 2 — Arrays and Strings",
    worldOrder: 2,
    order: 1,
    summary: "Store fixed-size contiguous sequences and index them safely.",
    objectives: ["Declare arrays", "Iterate over valid indices", "Recognize out-of-bounds access"],
    prerequisites: ["w1-loops"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Contiguous objects",
        body: "An array stores equal-typed elements contiguously. For length n, valid indices are 0 through n - 1. C does not insert a bounds check. Reading or writing beyond the array is undefined behavior, even when nearby memory appears accessible.",
        skillKeys: ["c.arrays"]
      },
      {
        order: 2,
        kind: "code",
        title: "Reverse an array",
        body: "Read n and then n integers. Print the values in reverse order, separated by spaces.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int n, a[100];\n    if (scanf(\"%d\", &n) != 1 || n < 0 || n > 100) return 1;\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    // Print from the final valid index to zero.\n    return 0;\n}\n",
        testInput: "3\n1 2 3",
        expectedOutput: "3 2 1 ",
        hints: ["The final valid index is n - 1.", "A descending loop can stop after index 0."],
        skillKeys: ["c.arrays"]
      }
    ]
  },
  {
    slug: "w2-strings",
    title: "Null-terminated strings",
    world: "World 2 — Arrays and Strings",
    worldOrder: 2,
    order: 2,
    summary: "Treat text as bounded character arrays with a terminating zero byte.",
    objectives: ["Explain null termination", "Read a bounded line", "Avoid buffer overflow"],
    prerequisites: ["w2-arrays"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "A string needs a terminator",
        body: "A C string is a char array ending in '\\0'. strlen scans until that byte and does not know the array capacity. If the terminator is absent, string operations read beyond the object. fgets accepts a capacity and is safer than unbounded input.",
        skillKeys: ["c.strings"]
      },
      {
        order: 2,
        kind: "code",
        title: "Length without strlen",
        body: "Read one line and print its length, excluding a trailing newline.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    char s[200];\n    if (!fgets(s, sizeof s, stdin)) return 1;\n    int length = 0;\n    // Count until newline or null terminator.\n    printf(\"%d\\n\", length);\n    return 0;\n}\n",
        testInput: "hello\n",
        expectedOutput: "5",
        skillKeys: ["c.strings"]
      }
    ]
  },
  {
    slug: "w3-functions",
    title: "Functions and contracts",
    world: "World 3 — Functions and Recursion",
    worldOrder: 3,
    order: 1,
    summary: "Decompose behavior into typed functions with explicit contracts.",
    objectives: ["Declare and call functions", "Explain call by value", "Use pointers for caller mutation"],
    prerequisites: ["w2-strings"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "C passes values",
        body: "C always passes arguments by value. A parameter starts as a copy. To let a function modify a caller's object, pass that object's address and dereference the pointer. A useful function contract states valid inputs, effects, and return meaning.",
        skillKeys: ["c.functions", "c.pointers.basic"]
      },
      {
        order: 2,
        kind: "code",
        title: "Swap through pointers",
        body: "Implement swap so it exchanges two integers in the caller.",
        starterCode: "#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // Exchange *a and *b.\n}\n\nint main(void) {\n    int x, y;\n    if (scanf(\"%d %d\", &x, &y) != 2) return 1;\n    swap(&x, &y);\n    printf(\"%d %d\\n\", x, y);\n    return 0;\n}\n",
        testInput: "1 2",
        expectedOutput: "2 1",
        skillKeys: ["c.functions", "c.pointers.basic"]
      }
    ]
  },
  {
    slug: "w3-recursion",
    title: "Recursion and stack frames",
    world: "World 3 — Functions and Recursion",
    worldOrder: 3,
    order: 2,
    summary: "Define a problem using smaller instances and a mandatory base case.",
    objectives: ["Identify a base case", "Prove recursive progress", "Relate calls to stack use"],
    prerequisites: ["w3-functions"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Base case, then progress",
        body: "A recursive function must stop at a base case and every recursive path must move toward it. Each active call consumes a stack frame. Deep recursion can overflow the stack, so iteration is often safer when depth scales with large input.",
        skillKeys: ["c.recursion"]
      },
      {
        order: 2,
        kind: "code",
        title: "Recursive factorial",
        body: "Implement factorial for 0 ≤ n ≤ 12.",
        starterCode: "#include <stdio.h>\n\nlong factorial(int n) {\n    // Base case and recursive case.\n    return 1;\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    printf(\"%ld\\n\", factorial(n));\n    return 0;\n}\n",
        testInput: "5",
        expectedOutput: "120",
        skillKeys: ["c.recursion"]
      }
    ]
  },
  {
    slug: "w4-pointers-basics",
    title: "Pointer fundamentals",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 1,
    summary: "Distinguish an object, its address, and a pointer that stores that address.",
    objectives: ["Use & and *", "Initialize pointers", "Recognize invalid dereferences"],
    prerequisites: ["w3-functions"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Address versus value",
        body: "&x produces x's address. A compatible pointer can store that address. *p designates the object at the stored address. Never dereference an uninitialized pointer, NULL, a one-past pointer, or a pointer whose object lifetime ended.",
        skillKeys: ["c.pointers.basic"]
      },
      {
        order: 2,
        kind: "code",
        title: "Increment through a pointer",
        body: "Read x, use p to increment x through indirection, and print x.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    int *p = &x;\n    // Increment the pointed-to integer.\n    printf(\"%d\\n\", x);\n    return 0;\n}\n",
        testInput: "7",
        expectedOutput: "8",
        skillKeys: ["c.pointers.basic"]
      }
    ]
  },
  {
    slug: "w4-pointer-arithmetic",
    title: "Pointer arithmetic",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 2,
    summary: "Traverse arrays with scaled pointer operations and valid ranges.",
    objectives: ["Explain scaling by sizeof", "Use one-past as a sentinel", "Subtract pointers within one array"],
    prerequisites: ["w4-pointers-basics"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Movement is scaled",
        body: "For int *p, p + 1 advances to the next int, not the next byte. Pointer arithmetic is only defined within one array object and one position past its end. The one-past pointer is useful for comparison but must not be dereferenced.",
        skillKeys: ["c.pointers.arithmetic", "c.pointers.arrays"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sum with a pointer walk",
        body: "Read n integers and sum them by advancing a pointer from a to a + n.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int n, a[100];\n    if (scanf(\"%d\", &n) != 1 || n < 0 || n > 100) return 1;\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    int sum = 0;\n    // Walk with int *p.\n    printf(\"%d\\n\", sum);\n    return 0;\n}\n",
        testInput: "3\n1 2 3",
        expectedOutput: "6",
        skillKeys: ["c.pointers.arithmetic", "c.pointers.arrays"]
      }
    ]
  },
  {
    slug: "w4-double-pointers",
    title: "Double pointers",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 3,
    summary: "Use a pointer to a pointer when a function must replace a caller's pointer.",
    objectives: ["Explain two levels of indirection", "Modify a caller pointer", "Read declarations inside out"],
    prerequisites: ["w4-pointer-arithmetic"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Changing the pointer itself",
        body: "Passing int *p copies the pointer, so assigning p inside the function does not retarget the caller's variable. Pass &p instead. The callee receives int **pp and assigns *pp to replace the caller's pointer value.",
        skillKeys: ["c.pointers.double"]
      },
      {
        order: 2,
        kind: "code",
        title: "Retarget with int **",
        body: "Implement set_ptr so the caller's p points to b, then print *p.",
        starterCode: "#include <stdio.h>\n\nvoid set_ptr(int **p, int *target) {\n    // Retarget the caller's pointer.\n}\n\nint main(void) {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 1;\n    int *p = &a;\n    set_ptr(&p, &b);\n    printf(\"%d\\n\", *p);\n    return 0;\n}\n",
        testInput: "3 9",
        expectedOutput: "9",
        skillKeys: ["c.pointers.double"]
      }
    ]
  },
  {
    slug: "w5-structs",
    title: "Structures",
    world: "World 5 — Structures",
    worldOrder: 5,
    order: 1,
    summary: "Group related fields and choose value or pointer semantics.",
    objectives: ["Declare and initialize structs", "Use . and ->", "Pass structs by value or address"],
    prerequisites: ["w4-pointers-basics"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "One object, several fields",
        body: "struct Point { int x; int y; }; defines a compound type. Use . with a struct object and -> with a pointer to one. Passing a struct by value copies every field. Passing its address can avoid a copy and can permit mutation.",
        skillKeys: ["c.structs", "c.typedef"]
      },
      {
        order: 2,
        kind: "code",
        title: "Distance squared",
        body: "Read x1 y1 x2 y2 and print (x2 - x1)² + (y2 - y1)².",
        starterCode: "#include <stdio.h>\n\ntypedef struct { int x, y; } Point;\n\nint main(void) {\n    Point a, b;\n    if (scanf(\"%d %d %d %d\", &a.x, &a.y, &b.x, &b.y) != 4) return 1;\n    // Compute squared distance.\n    return 0;\n}\n",
        testInput: "0 0 3 4",
        expectedOutput: "25",
        skillKeys: ["c.structs", "c.typedef"]
      }
    ]
  },
  {
    slug: "w6-malloc",
    title: "Dynamic memory",
    world: "World 6 — Dynamic Memory",
    worldOrder: 6,
    order: 1,
    summary: "Acquire heap storage, establish ownership, and release it exactly once.",
    objectives: ["Allocate and check failure", "Free every owned allocation", "Avoid use-after-free"],
    prerequisites: ["w5-structs"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Lifetime is now your responsibility",
        body: "malloc returns suitably aligned uninitialized storage or NULL. calloc zeroes allocated bytes. realloc may move a block. Every successful allocation needs a clear owner and one eventual free. Access after free, double-free, and losing the final pointer are serious defects.",
        skillKeys: ["c.memory.malloc", "c.memory.free", "c.memory.leaks"]
      },
      {
        order: 2,
        kind: "code",
        title: "Allocate an integer array",
        body: "Read n and n integers, allocate the array with malloc, print the sum, and free it.",
        starterCode: "#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0) return 1;\n    int *a = malloc((size_t)n * sizeof *a);\n    if (a == NULL) return 1;\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    int sum = 0;\n    // Sum before releasing ownership.\n    printf(\"%d\\n\", sum);\n    free(a);\n    return 0;\n}\n",
        testInput: "4\n10 20 30 40",
        expectedOutput: "100",
        skillKeys: ["c.memory.malloc", "c.memory.free"]
      }
    ]
  },
  {
    slug: "w7-files",
    title: "Streams and files",
    world: "World 7 — Files and Professional C",
    worldOrder: 7,
    order: 1,
    summary: "Read streams safely, report failures, and close resources.",
    objectives: ["Open and close files", "Read bounded lines", "Check I/O errors"],
    prerequisites: ["w6-malloc"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Files are streams",
        body: "fopen returns FILE * or NULL. Modes include r, w, a and binary variants. Check every open, distinguish end-of-file from error when needed, and close each successfully opened stream. stdin, stdout, and stderr are already-open standard streams.",
        skillKeys: ["c.files"]
      },
      {
        order: 2,
        kind: "code",
        title: "Count input lines",
        body: "Use fgets to count lines from stdin and print the count.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    char buffer[1024];\n    int lines = 0;\n    while (fgets(buffer, sizeof buffer, stdin) != NULL) {\n        // Count this line.\n    }\n    printf(\"%d\\n\", lines);\n    return 0;\n}\n",
        testInput: "a\nb\nc\n",
        expectedOutput: "3",
        skillKeys: ["c.files"]
      }
    ]
  },
  {
    slug: "w8-linked-list",
    title: "Linked lists",
    world: "World 8 — Data Structures",
    worldOrder: 8,
    order: 1,
    summary: "Connect dynamically allocated nodes without losing ownership.",
    objectives: ["Build a singly linked list", "Traverse from a stable head", "Free every node"],
    prerequisites: ["w6-malloc"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Nodes and links",
        body: "A singly linked node stores a value and a pointer to the next node. Head insertion is O(1). Traversal is O(n). Keep the head pointer stable or use a separate cursor. To destroy the list, preserve next before freeing the current node.",
        skillKeys: ["ds.linked_list"]
      },
      {
        order: 2,
        kind: "code",
        title: "Push, print, free",
        body: "Read n values, push each at the head, print the resulting list, and free all nodes.",
        starterCode: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node { int value; struct Node *next; };\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    struct Node *head = NULL;\n    for (int i = 0; i < n; ++i) {\n        int value; scanf(\"%d\", &value);\n        // Allocate and push.\n    }\n    // Print, then free.\n    return 0;\n}\n",
        testInput: "3\n1 2 3",
        expectedOutput: "3 2 1 ",
        skillKeys: ["ds.linked_list", "c.memory.malloc", "c.memory.free"]
      }
    ]
  },
  {
    slug: "w9-complexity",
    title: "Complexity analysis",
    world: "World 9 — Algorithms",
    worldOrder: 9,
    order: 1,
    summary: "Describe how time and extra space scale with input size.",
    objectives: ["Identify common growth classes", "Analyze nested loops", "Separate worst case from one benchmark"],
    prerequisites: ["w8-linked-list"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Growth dominates constants",
        body: "O(1) does not grow with n. O(log n) repeatedly reduces the search space. O(n) scans once. O(n log n) appears in efficient comparison sorting. O(n²) often comes from two nested n-sized loops. Analyze both time and additional storage.",
        skillKeys: ["algo.complexity"]
      },
      {
        order: 2,
        kind: "quiz",
        title: "A single full scan",
        body: "What is the time complexity of: for (int i = 0; i < n; ++i) sum += a[i];",
        quizOptions: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        quizAnswer: "O(n)",
        skillKeys: ["algo.complexity"]
      }
    ]
  },
  {
    slug: "w10-elephant",
    title: "The elephant problem",
    world: "World 10 — Competitive Programming",
    worldOrder: 10,
    order: 1,
    summary: "Replace a correct simulation with a proved O(1) greedy formula.",
    objectives: ["Derive a lower bound", "Show the bound is achievable", "Use integer ceiling division"],
    prerequisites: ["w9-complexity"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Statement and lower bound",
        body: "An elephant starts at 0 and must reach positive coordinate x. One move advances 1 through 5 positions. Because one move covers at most 5, every solution needs at least ceil(x / 5) moves.",
        skillKeys: ["algo.greedy", "algo.complexity"]
      },
      {
        order: 2,
        kind: "code",
        title: "Correct O(x) simulation",
        body: "Implement the direct greedy simulation. It is correct, but its loop count grows with x.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    int position = 0, moves = 0;\n    while (position < x) {\n        for (int step = 5; step >= 1; --step) {\n            if (position + step <= x) { position += step; break; }\n        }\n        ++moves;\n    }\n    printf(\"%d\\n\", moves);\n    return 0;\n}\n",
        testInput: "12",
        expectedOutput: "3",
        skillKeys: ["algo.greedy"]
      },
      {
        order: 3,
        kind: "optimize",
        title: "O(1) ceiling formula",
        body: "The lower bound is achievable by taking full steps of 5 and one remainder step when needed. For nonnegative x, ceil(x / 5) is (x + 4) / 5 with integer arithmetic. Run the constant-time implementation.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    printf(\"%d\\n\", (x + 4) / 5);\n    return 0;\n}\n",
        testInput: "12",
        expectedOutput: "3",
        skillKeys: ["algo.greedy", "algo.complexity"],
        xpReward: 20
      }
    ]
  }
];

const PROBLEMS = [
  {
    slug: "elephant",
    title: "Elephant",
    difficulty: "easy",
    tags: ["greedy", "math"],
    description: "An elephant starts at coordinate 0 and must reach coordinate x. In one move it can advance by 1, 2, 3, 4, or 5 positions. Find the minimum number of moves.",
    inputSpec: "A single integer x (1 ≤ x ≤ 1,000,000).",
    outputSpec: "Print the minimum number of moves.",
    constraints: "1 ≤ x ≤ 1,000,000.",
    examples: [{ input: "12", output: "3" }, { input: "5", output: "1" }, { input: "6", output: "2" }],
    starterCode: "#include <stdio.h>\n\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    // Compute the minimum moves.\n    return 0;\n}\n",
    referenceCode: "#include <stdio.h>\n\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    printf(\"%d\\n\", (x + 4) / 5);\n    return 0;\n}\n",
    editorial: "One move covers at most 5 positions, so at least ceil(x / 5) moves are necessary. This bound is achievable by taking as many full steps of 5 as possible and one final remainder step when x is not divisible by 5. For positive integers, ceil(x / 5) equals (x + 4) / 5 under integer division. A position-by-position greedy simulation is correct but O(x); this formula is O(1).",
    skillKeys: ["algo.greedy", "algo.complexity"],
    expectedComplexity: "O(1) time, O(1) space",
    tests: [
      { input: "1", expected: "1", hidden: false, order: 1 },
      { input: "5", expected: "1", hidden: false, order: 2 },
      { input: "6", expected: "2", hidden: false, order: 3 },
      { input: "12", expected: "3", hidden: true, order: 4 },
      { input: "999999", expected: "200000", hidden: true, order: 5 },
      { input: "1000000", expected: "200000", hidden: true, order: 6 }
    ]
  },
  {
    slug: "sum-1-n",
    title: "Sum 1 through n",
    difficulty: "introductory",
    tags: ["loops", "math"],
    description: "Read n and print 1 + 2 + ... + n.",
    inputSpec: "A single integer n (1 ≤ n ≤ 1,000,000).",
    outputSpec: "Print the sum as an integer.",
    constraints: "1 ≤ n ≤ 1,000,000. The answer can exceed a 32-bit signed int.",
    examples: [{ input: "10", output: "55" }],
    starterCode: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    // Compute and print the sum.\n    return 0;\n}\n",
    referenceCode: "#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    printf(\"%lld\\n\", (long long)n * (n + 1) / 2);\n    return 0;\n}\n",
    editorial: "The closed form n(n + 1) / 2 computes the sum in O(1). Convert to long long before multiplication so n near one million does not overflow a 32-bit int. A loop is also correct in O(n).",
    skillKeys: ["c.loops", "algo.complexity"],
    expectedComplexity: "O(1) time, O(1) space",
    tests: [
      { input: "1", expected: "1", hidden: false, order: 1 },
      { input: "10", expected: "55", hidden: false, order: 2 },
      { input: "100", expected: "5050", hidden: true, order: 3 },
      { input: "1000000", expected: "500000500000", hidden: true, order: 4 }
    ]
  }
];

async function seedSkills() {
  for (const [key, name, world] of SKILLS) {
    await prisma.skill.upsert({
      where: { key },
      update: { name, world },
      create: { key, name, world }
    });
  }
}

async function seedAchievements() {
  for (const [key, name, description, icon] of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key },
      update: { name, description, icon },
      create: { key, name, description, icon }
    });
  }
}

async function seedReference() {
  for (const entry of REFERENCE) {
    await prisma.referenceEntry.upsert({
      where: { slug: entry.slug },
      update: {
        category: entry.category,
        title: entry.title,
        body: entry.body,
        examples: entry.examples
      },
      create: {
        slug: entry.slug,
        category: entry.category,
        title: entry.title,
        body: entry.body,
        examples: entry.examples
      }
    });
  }
}

async function seedLessons() {
  for (const item of LESSONS) {
    const lesson = await prisma.lesson.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        world: item.world,
        worldOrder: item.worldOrder,
        order: item.order,
        summary: item.summary,
        objectives: item.objectives,
        prerequisites: item.prerequisites
      },
      create: {
        slug: item.slug,
        title: item.title,
        world: item.world,
        worldOrder: item.worldOrder,
        order: item.order,
        summary: item.summary,
        objectives: item.objectives,
        prerequisites: item.prerequisites
      }
    });

    for (const step of item.steps) {
      const data = {
        kind: step.kind,
        title: step.title,
        body: step.body,
        starterCode: step.starterCode ?? "",
        expectedOutput: step.expectedOutput ?? null,
        testInput: step.testInput ?? null,
        quizOptions: step.quizOptions === undefined
          ? Prisma.JsonNull
          : step.quizOptions,
        quizAnswer: step.quizAnswer ?? null,
        hints: step.hints ?? [],
        skillKeys: step.skillKeys ?? [],
        xpReward: step.xpReward ?? 10
      };
      await prisma.lessonStep.upsert({
        where: { lessonId_order: { lessonId: lesson.id, order: step.order } },
        update: data,
        create: { lessonId: lesson.id, order: step.order, ...data }
      });
    }
  }
}

async function seedProblems() {
  for (const item of PROBLEMS) {
    const problem = await prisma.problem.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        difficulty: item.difficulty,
        tags: item.tags,
        description: item.description,
        inputSpec: item.inputSpec,
        outputSpec: item.outputSpec,
        constraints: item.constraints,
        examples: item.examples,
        starterCode: item.starterCode,
        referenceCode: item.referenceCode,
        editorial: item.editorial,
        skillKeys: item.skillKeys,
        expectedComplexity: item.expectedComplexity
      },
      create: {
        slug: item.slug,
        title: item.title,
        difficulty: item.difficulty,
        tags: item.tags,
        description: item.description,
        inputSpec: item.inputSpec,
        outputSpec: item.outputSpec,
        constraints: item.constraints,
        examples: item.examples,
        starterCode: item.starterCode,
        referenceCode: item.referenceCode,
        editorial: item.editorial,
        skillKeys: item.skillKeys,
        expectedComplexity: item.expectedComplexity
      }
    });

    for (const test of item.tests) {
      const existing = await prisma.testCase.findFirst({
        where: { problemId: problem.id, order: test.order }
      });
      if (existing) {
        await prisma.testCase.update({
          where: { id: existing.id },
          data: { input: test.input, expected: test.expected, hidden: test.hidden }
        });
      } else {
        await prisma.testCase.create({ data: { problemId: problem.id, ...test } });
      }
    }
  }
}

async function main() {
  await seedSkills();
  await seedAchievements();
  await seedReference();
  await seedLessons();
  await seedProblems();
  console.log(`Seed complete: ${SKILLS.length} skills, ${LESSONS.length} lessons, ${PROBLEMS.length} problems.`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
