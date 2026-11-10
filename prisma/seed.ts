import "dotenv/config";

/**
 * Tagged template for readable multi-line C snippets. Source is authored with
 * the surrounding indentation, and this helper strips exactly that shared
 * indentation so snippets stay aligned with the seed file while producing the
 * string an editor would show. Content inside the template is literal: a `\n`
 * written inside a C string stays a backslash and an `n`, which is what GCC
 * must receive.
 */
function c(strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = strings.raw;
  let text = raw[0];
  for (let index = 0; index < values.length; index += 1) {
    text += String(values[index]) + raw[index + 1];
  }
  const lines = text.split("\n");
  if (lines.length > 0 && lines[0].trim() === "") lines.shift();
  const indents = lines
    .filter((line) => line.trim() !== "")
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);
  const shared = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(shared).replace(/[ \t]+$/, "")).join("\n");
}

export type StepSeed = {
  order: number;
  kind: string;
  title: string;
  body: string;
  starterCode?: string;
  /**
   * A complete, compiling program for the exercise. It is never persisted and
   * never leaves the seeder: `scripts/verify-seed.ts` compiles it with GCC and
   * checks that `testInput` produces `expectedOutput`.
   */
  solutionCode?: string;
  expectedOutput?: string;
  testInput?: string;
  quizOptions?: string[];
  quizAnswer?: string;
  hints?: string[];
  skillKeys?: string[];
  xpReward?: number;
};

export type LessonSeed = {
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

export type ProblemSeed = {
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  description: string;
  inputSpec: string;
  outputSpec: string;
  constraints: string;
  examples: { input: string; output: string }[];
  starterCode: string;
  referenceCode: string;
  editorial: string;
  skillKeys: string[];
  expectedComplexity: string;
  tests: { input: string; expected: string; hidden: boolean; order: number }[];
};

export const SKILLS = [
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

export const ACHIEVEMENTS = [
  ["first.program", "First Program", "Run your first C program.", "rocket"],
  ["first.lesson", "First Lesson", "Finish every step of a lesson.", "book-open"],
  ["first.quiz", "Concept Check", "Answer a lesson quiz correctly.", "help-circle"],
  ["code.25", "Muscle Memory", "Pass 25 lesson code steps.", "dumbbell"],
  ["first.accepted", "First Accepted", "Solve your first judged problem.", "check"],
  ["five.accepted", "High Five", "Solve 5 distinct problems.", "hand"],
  ["ten.accepted", "Steady Hands", "Earn 10 accepted submissions.", "award"],
  ["fifty.accepted", "Sharp Shooter", "Earn 50 accepted submissions.", "target"],
  ["first.end_to_end", "End to End", "Solve a problem without hints in independent mode.", "compass"],
  ["first.pointer", "Pointer Awakening", "Solve a judged problem that tests pointer skills.", "arrow-right"],
  ["first.dynamic_memory", "Memory Architect", "Solve a judged problem that requires heap memory.", "layers"],
  ["trace.master", "Trace Master", "Pass two trace or prediction steps.", "activity"],
  ["first.debug", "Bug Slayer", "Pass a debugging step with a real compiler run.", "bug"],
  ["optimal.o1", "O(1) Insight", "Pass a step in the optimize tier.", "zap"],
  ["first.linked_list", "Linked Up", "Solve a problem that builds a linked list.", "link"],
  ["first.graph", "Graph Explorer", "Solve a problem that traverses a graph.", "share-2"],
  ["first.recursion", "Recursive Mind", "Solve a recursion problem.", "repeat"],
  ["first.binary_search", "Half the World", "Solve a binary search problem.", "search"],
  ["first.dp", "Pattern Seeker", "Solve a dynamic programming problem.", "grid"],
  ["array.lord", "Array Architect", "Solve an array-focused problem.", "list"],
  ["string.weaver", "String Weaver", "Solve a string-focused problem.", "type"],
  ["math.wizard", "Math Wizard", "Solve a math or number theory problem.", "calculator"],
  ["sort.savant", "Sort Savant", "Solve a sorting-based problem.", "sort"],
  ["elephant.master", "Elephant Master", "Solve Elephant with the O(1) solution.", "elephant"],
  ["hard.first", "Climb the Wall", "Solve an advanced or expert problem.", "mountain"],
  ["polymath", "Polymath", "Reach an Independent mastery state in 10 skills.", "network"],
  ["xp.500", "500 XP", "Bank 500 experience points.", "sparkles"],
  ["xp.2000", "2000 XP", "Bank 2000 experience points.", "gem"],
  ["streak.3", "Three in a Row", "Learn for 3 consecutive days.", "calendar-check"],
  ["streak.7", "7-Day Streak", "Learn for 7 consecutive days.", "calendar"],
  ["rank.problem_solver", "Problem Solver", "Reach the Problem Solver rank.", "medal"],
  ["night.owl", "Night Owl", "Submit a run between midnight and 4 AM.", "moon"],
  ["collector.reference", "Reference Collector", "Keep 5 notes or bookmarks across the curriculum.", "bookmark"],
  ["early.bird", "Early Bird", "Submit a run between 5 AM and 7 AM.", "sunrise"],
  ["builder.projects", "Builder", "Create a project in the IDE workspace.", "hammer"],
  ["completionist.world1", "Foundations Forged", "Finish every World 1 lesson.", "flag"]
] as const;


export const REFERENCE = [
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
  },
  {
    slug: "strcpy",
    category: "string",
    title: "strcpy",
    body: "char *strcpy(char *dest, const char *src); copies src including its terminating null byte into dest and returns dest. It performs no bounds check, so dest must have room for strlen(src) + 1 bytes. Copying from a longer string into a shorter buffer is a classic stack overflow; prefer snprintf or your own bounded copy when lengths are not already known.",
    examples: ['char name[16];\nstrcpy(name, "CForge");', "size_t need = strlen(src) + 1; /* capacity check first */"]
  },
  {
    slug: "strncpy",
    category: "string",
    title: "strncpy",
    body: "char *strncpy(char *dest, const char *src, size_t n); copies at most n bytes of src. If src is shorter than n the remainder is zero-filled; if src is at least n bytes long the result is not null-terminated. That asymmetry makes strncpy a footgun for ordinary strings: usually you want a bounded copy followed by an explicit dest[n - 1] = '\\0'.",
    examples: ['strncpy(dest, src, sizeof dest - 1);', "dest[sizeof dest - 1] = '\\0';"]
  },
  {
    slug: "strcat",
    category: "string",
    title: "strcat",
    body: "char *strcat(char *dest, const char *src); appends src to the end of dest, overwriting dest's terminator, and returns dest. dest must already be a null-terminated string and must have space for both strings plus the new terminator. There is no bounds check, so track remaining capacity yourself or build with snprintf.",
    examples: ['char path[64] = "/tmp/";\nstrcat(path, "file.txt");']
  },
  {
    slug: "strncat",
    category: "string",
    title: "strncat",
    body: "char *strncat(char *dest, const char *src, size_t n); appends at most n bytes of src and always writes a terminator, but n bounds only the copied bytes, not the total length of dest. You must still guarantee dest has n + 1 free bytes. A safer idiom is snprintf(dest + strlen(dest), sizeof dest - strlen(dest), \"%s\", src).",
    examples: ['strncat(dest, src, sizeof dest - strlen(dest) - 1);']
  },
  {
    slug: "strcmp",
    category: "string",
    title: "strcmp",
    body: "int strcmp(const char *a, const char *b); compares two strings byte by byte as unsigned char. It returns a negative value if a is less than b, zero if they are equal, and a positive value otherwise. The sign is specified but not the magnitude. Never compare strings with ==, which compares pointer values.",
    examples: ['if (strcmp(command, "quit") == 0) { /* exact match */ }']
  },
  {
    slug: "strncmp",
    category: "string",
    title: "strncmp",
    body: "int strncmp(const char *a, const char *b, size_t n); compares at most n bytes. It is the natural way to test a prefix: strncmp(line, \"GET \", 4) == 0. As with strcmp, the return value's sign is the portable information.",
    examples: ['if (strncmp(line, "GET ", 4) == 0) { /* HTTP method */ }']
  },
  {
    slug: "strlen",
    category: "string",
    title: "strlen",
    body: "size_t strlen(const char *s); returns the number of bytes before the first null byte. It scans linearly, so calling it inside a loop condition turns a linear algorithm into a quadratic one. strlen never checks array capacity, so an unterminated buffer leads to an out-of-bounds read. The result type is size_t, an unsigned type.",
    examples: ['size_t length = strlen(s);', "for (size_t i = 0; i < length; ++i) { /* ... */ }"]
  },
  {
    slug: "strchr",
    category: "string",
    title: "strchr",
    body: "char *strchr(const char *s, int c); returns a pointer to the first occurrence of the byte c, or NULL when absent. The terminating null byte counts as part of the string for this search. Because the argument is const-ish in practice, the return type still exposes a mutable pointer; cast carefully and keep const-correctness in your own wrappers.",
    examples: ['char *dot = strchr(filename, \'.\');', 'if (dot) printf("extension: %s\\n", dot + 1);']
  },
  {
    slug: "strrchr",
    category: "string",
    title: "strrchr",
    body: "char *strrchr(const char *s, int c); returns a pointer to the last occurrence of the byte c, or NULL. It is the usual way to take a file extension or a Windows-style path base name.",
    examples: ['char *base = strrchr(path, \'/\');', 'printf("%s\\n", base ? base + 1 : path);']
  },
  {
    slug: "strstr",
    category: "string",
    title: "strstr",
    body: "char *strstr(const char *haystack, const char *needle); returns a pointer to the first occurrence of the substring needle, or NULL if it does not occur. An empty needle matches at the start. Typical implementations are O(n·m); use a rolling-hash or KMP approach when both strings are large.",
    examples: ['if (strstr(message, "error")) { /* contains the word */ }']
  },
  {
    slug: "strtok",
    category: "string",
    title: "strtok",
    body: "char *strtok(char *s, const char *delimiters); splits s into tokens by replacing delimiters with null bytes. The first call passes the string; later calls pass NULL to continue. It keeps hidden state, so it is not reentrant or thread-safe, and it modifies its input. Prefer strtok_r where available.",
    examples: ['for (char *tok = strtok(line, ", "); tok; tok = strtok(NULL, ", ")) puts(tok);']
  },
  {
    slug: "strspn",
    category: "string",
    title: "strspn",
    body: "size_t strspn(const char *s, const char *accept); returns the length of the initial segment of s consisting only of bytes from accept. Its companion strcspn(s, reject) returns the length of the initial segment containing none of the reject bytes. Together they tokenize without modifying the input.",
    examples: ['size_t digits = strspn(text, "0123456789");']
  },
  {
    slug: "fgets",
    category: "stdio",
    title: "fgets",
    body: "char *fgets(char *s, int size, FILE *stream); reads at most size - 1 bytes, stops after a newline, and always null-terminates. It returns s or NULL at end-of-file or on error. Unlike gets, which was removed from the standard, fgets cannot overflow the buffer. A line longer than the buffer arrives in pieces, so check for a trailing newline when whole lines matter.",
    examples: ['char line[256];', 'while (fgets(line, sizeof line, stdin)) { /* handle line */ }']
  },
  {
    slug: "fputs",
    category: "stdio",
    title: "fputs",
    body: "int fputs(const char *s, FILE *stream); writes a string without its terminator and returns a non-negative value on success or EOF on failure. The companion puts(s) writes s plus a newline to stdout. Neither performs formatting, so they are cheaper than printf when no conversion is needed.",
    examples: ['fputs("done\\n", stdout);', "puts(\"done\");"]
  },
  {
    slug: "fopen",
    category: "stdio",
    title: "fopen",
    body: "FILE *fopen(const char *path, const char *mode); opens a file and returns a stream, or NULL on failure. Modes are \"r\", \"w\", \"a\", \"r+\", \"w+\", \"a+\" with an optional \"b\" for binary on platforms that distinguish them. Always test for NULL and check errno or perror for the cause.",
    examples: ['FILE *f = fopen("data.txt", "r");', 'if (!f) { perror("data.txt"); return 1; }']
  },
  {
    slug: "fclose",
    category: "stdio",
    title: "fclose",
    body: "int fclose(FILE *stream); flushes buffered output and releases the stream. It returns 0 on success or EOF if a write failed during the flush, so closing an output file after writes is a real error-checking point. Close every stream you open exactly once.",
    examples: ['if (fclose(f) != 0) { perror("fclose"); }']
  },
  {
    slug: "fread",
    category: "stdio",
    title: "fread",
    body: "size_t fread(void *ptr, size_t size, size_t count, FILE *stream); reads up to count objects of size bytes and returns how many were read completely. Short counts mean end-of-file or error; use feof and ferror to distinguish. Binary records should be read with fread rather than scanned text.",
    examples: ['int buffer[64];', 'size_t got = fread(buffer, sizeof buffer[0], 64, f);']
  },
  {
    slug: "fwrite",
    category: "stdio",
    title: "fwrite",
    body: "size_t fwrite(const void *ptr, size_t size, size_t count, FILE *stream); writes count objects of size bytes and returns the number fully written. A short count signals a write error such as a full disk. Match fread and fwrite pairs with the same element size, and remember that raw structs contain padding.",
    examples: ['fwrite(buffer, sizeof buffer[0], 64, f);']
  },
  {
    slug: "snprintf",
    category: "stdio",
    title: "snprintf",
    body: "int snprintf(char *s, size_t n, const char *format, ...); formats into at most n - 1 characters plus a terminator. It returns the length the full output would have needed, so a return value of n or more means truncation. That makes snprintf the safest way to assemble or copy strings with known buffers.",
    examples: ['snprintf(dest, sizeof dest, "%s/%s", dir, name);', "int need = snprintf(NULL, 0, \"%d\", value);"]
  },
  {
    slug: "sscanf",
    category: "stdio",
    title: "sscanf",
    body: "int sscanf(const char *s, const char *format, ...); parses values out of an existing string. It returns the number of assignments, so check it just like scanf. Width limits and %n let you validate incremental parsing without reading past the buffer.",
    examples: ['int h, m;', 'if (sscanf(clock, "%d:%d", &h, &m) != 2) return 1;']
  },
  {
    slug: "memset",
    category: "string",
    title: "memset",
    body: "void *memset(void *s, int c, size_t n); fills n bytes with the byte value c and returns s. It works on bytes, not elements: memset(a, 1, sizeof a) on an int array does not set each element to 1, it sets every byte to 0x01. Use 0 for zeroing and use a loop or calloc for other element values.",
    examples: ['char buffer[64];', 'memset(buffer, 0, sizeof buffer);']
  },
  {
    slug: "memcpy",
    category: "string",
    title: "memcpy",
    body: "void *memcpy(void *dest, const void *src, size_t n); copies n bytes. The regions must not overlap; use memmove when they might. memcpy is the fastest general copy primitive and is what compilers lower array copies to. The byte count is your responsibility, so prefer sizeof expression forms.",
    examples: ['int copy[8];', 'memcpy(copy, original, sizeof copy);']
  },
  {
    slug: "memmove",
    category: "string",
    title: "memmove",
    body: "void *memmove(void *dest, const void *src, size_t n); copies n bytes, handling overlap correctly by choosing a copy direction. Shifting elements inside one array, such as deleting from the middle or rotating a buffer, requires memmove rather than memcpy.",
    examples: ['memmove(a + i, a + i + 1, (size_t)(n - i - 1) * sizeof *a);']
  },
  {
    slug: "memcmp",
    category: "string",
    title: "memcmp",
    body: "int memcmp(const void *a, const void *b, size_t n); compares n bytes as unsigned char and returns a negative value, zero, or a positive value. It is the correct comparator for binary data and for fixed-width buffers that may contain null bytes, where strcmp would stop early.",
    examples: ['if (memcmp(&header, "CFG1", 4) != 0) return 1;']
  },
  {
    slug: "qsort",
    category: "stdlib",
    title: "qsort",
    body: "void qsort(void *base, size_t count, size_t size, int (*compar)(const void *, const void *)); sorts an array in place. The comparator must return a negative value, zero, or a positive value describing the order of two elements, and must never overflow a subtraction. qsort is not stable; sort by an index tiebreaker when stability matters.",
    examples: ['static int cmp_int(const void *a, const void *b) {', '  int x = *(const int *)a, y = *(const int *)b;', '  return (x > y) - (x < y);', '}', 'qsort(a, (size_t)n, sizeof *a, cmp_int);']
  },
  {
    slug: "bsearch",
    category: "stdlib",
    title: "bsearch",
    body: "void *bsearch(const void *key, const void *base, size_t count, size_t size, int (*compar)(const void *, const void *)); searches a sorted array and returns a pointer to a matching element or NULL. The comparator receives the key as its first argument. Because the standard does not define which duplicate is returned, take the result as \"some match\" and scan neighbours when you need the first or last.",
    examples: ['int *found = bsearch(&key, a, (size_t)n, sizeof *a, cmp_int);', 'if (found) printf("found %d\\n", *found);']
  },
  {
    slug: "atoi",
    category: "stdlib",
    title: "atoi",
    body: "int atoi(const char *s); converts an initial numeric prefix to int. It reports no error: \"abc\" becomes 0, overflow is undefined behavior, and partial parses silently succeed. Use strtol for real input validation. atoi remains useful only in throwaway code paths where the input is already trusted.",
    examples: ["int n = atoi(\"42\"); /* no error reporting */"]
  },
  {
    slug: "strtol",
    category: "stdlib",
    title: "strtol",
    body: "long strtol(const char *s, char **end, int base); converts text with full error reporting. It skips leading whitespace, stops at end (when non-NULL), sets errno to ERANGE on overflow, and accepts base 0 to auto-detect decimal, hex, and octal. This is the correct routine for parsing untrusted numeric input.",
    examples: ['char *end;', 'errno = 0;', 'long value = strtol(text, &end, 10);', 'if (errno || end == text || *end != \'\\0\') return 1;']
  },
  {
    slug: "abs",
    category: "stdlib",
    title: "abs, labs, llabs",
    body: "int abs(int n); long labs(long n); long long llabs(long long n); return the absolute value. The result is undefined when the argument is the most negative value of its type, because the magnitude does not fit. Choose the variant that matches your type instead of relying on implicit conversions.",
    examples: ['int distance = abs(a - b);', 'long long magnitude = llabs(x);']
  },
  {
    slug: "exit",
    category: "stdlib",
    title: "exit",
    body: "void exit(int status); terminates the program normally, flushing and closing open streams, and reports status to the environment. status 0 or EXIT_SUCCESS means success; EXIT_FAILURE or another nonzero value signals failure. Returning from main is equivalent to calling exit. Registration through atexit runs handlers in reverse order of registration.",
    examples: ['if (!config) exit(EXIT_FAILURE);', 'atexit(cleanup);']
  },
  {
    slug: "assert",
    category: "assert",
    title: "assert",
    body: "void assert(expression); from <assert.h> aborts the program with a diagnostic if the expression is false. It documents invariants that must always hold and disappears entirely when NDEBUG is defined, so never put side effects inside an assert. Use it for programmer errors; validate external input with real runtime checks.",
    examples: ['#include <assert.h>', 'assert(size > 0);']
  },
  {
    slug: "isdigit",
    category: "ctype",
    title: "isdigit, isalpha, isspace",
    body: "The <ctype.h> predicates classify one character and return nonzero for true. isdigit(c), isalpha(c), isalnum(c), isspace(c), isupper(c), and islower(c) are the common ones. Pass an unsigned char value or EOF: passing a negative char (such as a high-bit byte) is undefined behavior. The matching tolower and toupper return the converted character or the input unchanged.",
    examples: ['unsigned char c = (unsigned char)text[i];', 'if (isdigit(c)) ++digits;']
  },
  {
    slug: "sqrt",
    category: "math",
    title: "sqrt, pow, fabs",
    body: "The <math.h> functions compute floating-point mathematics: sqrt(x), pow(x, y), fabs(x), floor(x), ceil(x), and fmod(x, y). Link with -lm on most Unix toolchains. sqrt of a negative value returns NaN rather than failing loudly, so validate the domain before calling.",
    examples: ['#include <math.h>', 'double root = sqrt((double)value);', 'gcc -std=c17 main.c -lm']
  },
  {
    slug: "time",
    category: "time",
    title: "time and clock",
    body: "time_t time(time_t *out); returns the current calendar time in seconds since the epoch. clock() measures processor time used by the process, scaled by CLOCKS_PER_SEC, which makes it the usual way to time a computation. Both return (time_t)-1 or -1 to report failure and require <time.h>.",
    examples: ['time_t start = time(NULL);', 'clock_t ticks = clock();', 'double seconds = (double)(clock() - ticks) / CLOCKS_PER_SEC;']
  },
  {
    slug: "rand",
    category: "stdlib",
    title: "rand and srand",
    body: "int rand(void); returns a pseudo-random integer between 0 and RAND_MAX inclusive; void srand(unsigned seed); seeds the sequence. The generator is implementation-defined and unsuitable for anything security related. rand() % n is biased toward small values when n does not divide RAND_MAX + 1; use rejection sampling if the bias matters.",
    examples: ['srand((unsigned)time(NULL));', 'int roll = rand() % 6 + 1;']
  },
  {
    slug: "errno",
    category: "errno",
    title: "errno and perror",
    body: "errno is a thread-local integer set by failing library calls. Always clear it before a call you intend to check and read it only when the call reports failure. perror(prefix) and strerror(errno) turn the number into a message. No library function ever resets errno to zero for you.",
    examples: ['errno = 0;', 'FILE *f = fopen(path, "r");', 'if (!f) perror(path);']
  },
  {
    slug: "const",
    category: "language",
    title: "const",
    body: "const qualifies a type so that writes through that path are rejected by the compiler. const char *s is a pointer to read-only characters; char *const s is a read-only pointer to mutable characters. Use const on every parameter a function does not modify: it documents intent and lets callers pass string literals safely.",
    examples: ['size_t count(const char *text);', 'void reset(int *const cursor);']
  },
  {
    slug: "static",
    category: "language",
    title: "static",
    body: "At file scope, static gives a function or object internal linkage so other translation units cannot see it. Inside a function, static gives an object static storage duration: it is initialized once and keeps its value between calls. Both uses trade a little coupling and hidden state for encapsulation, so document them.",
    examples: ['static int calls;', 'static int helper(int x) { return x * 2; }']
  }
];

export const LESSONS: LessonSeed[] = [
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
        solutionCode: "#include <stdio.h>\n\nint main(void) {\n    printf(\"Hello, CForge!\\n\");\n    return 0;\n}",
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
    objectives: ["Declare int, double, and char", "Choose format specifiers", "Use sizeof", "Recognize integer overflow"],
    prerequisites: ["w0-compilation"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Values have types",
        body: "A declaration gives an object a type and a name. int represents an integer whose width the implementation chooses (32 bits on virtually every judge), double represents floating-point values with about 15 significant digits, and char occupies exactly one byte. The type controls the representation, which operations are legal, and which printf specifier reads the value correctly. sizeof reports storage in bytes and has type size_t, so print it with %zu. Initializing every object removes an entire class of undefined behavior: an uninitialized local holds whatever bytes happened to be there.",
        hints: ["Read declarations right to left: `int *p` is a pointer to int."],
        skillKeys: ["c.variables"]
      },
      {
        order: 2,
        kind: "code",
        title: "Print values with the right specifiers",
        body: "Print the int 42 and the double 2.5 on one line separated by a single space. The expected output is exactly `42 2.5`.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int answer = 42;
    double ratio = 2.5;
    // Print both values on one line, separated by one space.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int answer = 42;\n    double ratio = 2.5;\n    printf(\"%d %.1f\\n\", answer, ratio);\n    return 0;\n}",
        testInput: "",
        expectedOutput: "42 2.5",
        hints: ["%d prints an int, %.1f prints a double with one decimal digit.", "Matching the specifier to the type is not optional: %f with an int is undefined behavior."],
        skillKeys: ["c.variables", "c.io"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Doubling without overflow",
        body: "Read one integer n whose double may exceed the range of a 32-bit int, then print 2 × n. Reading and multiplying in long long keeps the value exact.",
        starterCode: c`#include <stdio.h>

int main(void) {
    long long n;
    if (scanf("%lld", &n) != 1) return 1;
    // Print twice n using 64-bit arithmetic.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    long long n;\n    if (scanf(\"%lld\", &n) != 1) return 1;\n    printf(\"%lld\\n\", 2 * n);\n    return 0;\n}",
        testInput: "2000000000",
        expectedOutput: "4000000000",
        hints: ["scanf uses %lld for long long and printf uses %lld too.", "Signed overflow is undefined behavior, not a wraparound guarantee."],
        skillKeys: ["c.variables", "c.operators"],
        xpReward: 15
      },
      {
        order: 4,
        kind: "quiz",
        title: "Sizes and ranges",
        body: "What does sizeof(char) guarantee on every conforming C implementation?",
        quizOptions: ["It is 1 byte", "It depends on the platform", "It is 4 bytes", "It equals sizeof(int)"],
        quizAnswer: "It is 1 byte",
        hints: ["sizeof(char) is the definition of a byte in C; CHAR_BIT may be larger than 8, but sizeof(char) is always 1."],
        skillKeys: ["c.variables"]
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
    objectives: ["Check scanf results", "Apply arithmetic precedence", "Recognize integer division", "Convert between numeric types"],
    prerequisites: ["w1-variables"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Read, then verify",
        body: "scanf returns the number of successful conversions. Check that value before using an input object; a failed read leaves the target unchanged. Integer division truncates toward zero, so 7 / 2 is 3 and -7 / 2 is -3. The % operator requires integer operands and follows the same truncation rule. To get a fractional result, make at least one operand floating-point by casting or writing 9.0 / 5.0. Precedence follows the usual arithmetic order: unary, multiplicative, additive, relational, equality, logical AND, logical OR, then assignment. Parentheses make intent explicit and cost nothing at run time.",
        skillKeys: ["c.io", "c.operators"]
      },
      {
        order: 2,
        kind: "code",
        title: "A safe average",
        body: "Read two integers and print their arithmetic mean with exactly one digit after the decimal point.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 1;
    // Compute the mean without accidental integer division.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 1;\n    printf(\"%.1f\\n\", (a + b) / 2.0);\n    return 0;\n}",
        testInput: "3 4",
        expectedOutput: "3.5",
        hints: ["At least one operand of the division must be floating-point.", "printf uses %.1f for one decimal digit."],
        skillKeys: ["c.io", "c.operators"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Celsius to Fahrenheit",
        body: "Read an integer temperature in Celsius and print the Fahrenheit equivalent with one decimal digit, using F = C × 9 / 5 + 32.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int celsius;
    if (scanf("%d", &celsius) != 1) return 1;
    // Convert and print with one decimal digit.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int celsius;\n    if (scanf(\"%d\", &celsius) != 1) return 1;\n    printf(\"%.1f\\n\", celsius * 9.0 / 5.0 + 32.0);\n    return 0;\n}",
        testInput: "32",
        expectedOutput: "89.6",
        hints: ["Write 9.0 / 5.0 rather than 9 / 5.", "Multiplication and division share precedence and evaluate left to right."],
        skillKeys: ["c.operators", "c.io"]
      },
      {
        order: 4,
        kind: "quiz",
        title: "Integer division",
        body: "For int operands, what does 7 / 2 evaluate to, and what does 7 % 2 evaluate to?",
        quizOptions: ["3 and 1", "3.5 and 1", "3 and 0.5", "4 and -1"],
        quizAnswer: "3 and 1",
        hints: ["Integer division discards the fractional part; the remainder operator reports what was left over."],
        skillKeys: ["c.operators"]
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
    objectives: ["Write if/else chains", "Use comparison operators", "Understand integer truth values", "Avoid assignment-in-condition bugs"],
    prerequisites: ["w1-input-operators"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Control follows a condition",
        body: "C treats zero as false and any nonzero value as true. Comparisons produce exactly 0 or 1. Use == to compare and = to assign; writing if (x = 0) assigns zero and then tests the result, which is always false. Logical && and || short-circuit from left to right, so put cheap or guarding checks first: if (p != NULL && *p == 'x'). switch selects on an integer expression, falls through without break, and needs a default label for complete reasoning. Braces are strongly recommended even around one statement because they make later edits safe and diffs small.",
        skillKeys: ["c.conditionals"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sign classifier",
        body: "Read an integer and print positive, negative, or zero. Test a negative input, a positive input, and 0 before you move on.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Classify n.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    if (n > 0) puts(\"positive\");\n    else if (n < 0) puts(\"negative\");\n    else puts(\"zero\");\n    return 0;\n}",
        testInput: "0",
        expectedOutput: "zero",
        hints: ["An if/else chain tests conditions in order and stops at the first true one.", "puts appends a newline; printf needs an explicit \\n."],
        skillKeys: ["c.conditionals"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Letter grade",
        body: "Read an integer score from 0 to 100 and print a letter grade: 90 or more is A, 80 or more is B, 70 or more is C, 60 or more is D, and anything lower is F.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int score;
    if (scanf("%d", &score) != 1) return 1;
    // Print A, B, C, D, or F.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int score;\n    if (scanf(\"%d\", &score) != 1) return 1;\n    if (score >= 90) putchar('A');\n    else if (score >= 80) putchar('B');\n    else if (score >= 70) putchar('C');\n    else if (score >= 60) putchar('D');\n    else putchar('F');\n    putchar('\\n');\n    return 0;\n}",
        testInput: "87",
        expectedOutput: "B",
        hints: ["Order the tests from the strictest condition to the loosest.", "Only the first matching branch runs."],
        skillKeys: ["c.conditionals"],
        xpReward: 15
      },
      {
        order: 4,
        kind: "quiz",
        title: "Spot the assignment",
        body: "What is wrong with: if (status = 0) { report_error(); }",
        quizOptions: [
          "It assigns 0 to status, so the branch never runs",
          "Nothing; it compares status with 0",
          "It always runs the branch",
          "It is a syntax error"
        ],
        quizAnswer: "It assigns 0 to status, so the branch never runs",
        hints: ["A single = is assignment. The value of the assignment is the value stored, here 0, which is false."],
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
    objectives: ["Write counting loops", "Choose loop bounds", "Use break and continue deliberately", "Write nested loops"],
    prerequisites: ["w1-conditionals"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "State, condition, progress",
        body: "A terminating loop needs state, a continuation condition, and progress toward making that condition false. for groups those three parts on one line and is the natural choice for a known iteration count. while suits an unknown count such as reading until end-of-file. do/while runs its body at least once. For a loop over n elements the two standard bounds are 0 <= i < n and 1 <= i <= n. Choose one and keep it; mixing them in the same function is where off-by-one defects come from. break leaves the nearest enclosing loop or switch, continue jumps to the next iteration, and both are best used sparingly so the loop condition stays honest.",
        skillKeys: ["c.loops"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sum 1 through n",
        body: "Read n and use a loop to print 1 + 2 + ... + n.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    long long sum = 0;
    if (scanf("%d", &n) != 1) return 1;
    // Add every integer from 1 through n.
    printf("%lld\n", sum);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n;\n    long long sum = 0;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    for (int i = 1; i <= n; ++i) sum += i;\n    printf(\"%lld\\n\", sum);\n    return 0;\n}",
        testInput: "10",
        expectedOutput: "55",
        hints: ["Accumulate into sum inside the loop body.", "Start at 1 and continue while i <= n."],
        skillKeys: ["c.loops"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Count the digits",
        body: "Read a nonnegative integer and print how many decimal digits it has. Zero has one digit, which is exactly the case a do/while handles naturally.",
        starterCode: c`#include <stdio.h>

int main(void) {
    long long n;
    if (scanf("%lld", &n) != 1 || n < 0) return 1;
    int digits = 0;
    // Count digits without building a string.
    printf("%d\n", digits);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    long long n;\n    if (scanf(\"%lld\", &n) != 1 || n < 0) return 1;\n    int digits = 0;\n    do {\n        ++digits;\n        n /= 10;\n    } while (n > 0);\n    printf(\"%d\\n\", digits);\n    return 0;\n}",
        testInput: "9042",
        expectedOutput: "4",
        hints: ["Dividing by 10 removes the last digit.", "A do/while body runs once even when n is 0."],
        skillKeys: ["c.loops"],
        xpReward: 15
      },
      {
        order: 4,
        kind: "code",
        title: "A star triangle",
        body: "Read the number of rows n (1 ≤ n ≤ 20) and print a left-aligned triangle: row i contains exactly i stars, and there is no trailing space.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 20) return 1;
    // Print n rows; row i has i stars.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 20) return 1;\n    for (int row = 1; row <= n; ++row) {\n        for (int col = 1; col <= row; ++col) putchar('*');\n        putchar('\\n');\n    }\n    return 0;\n}",
        testInput: "4",
        expectedOutput: "*\n**\n***\n****",
        hints: ["The outer loop chooses the row, the inner loop books the columns.", "The inner loop bound depends on the outer loop variable."],
        skillKeys: ["c.loops"],
        xpReward: 20
      },
      {
        order: 5,
        kind: "quiz",
        title: "break and continue",
        body: "Inside a for loop over 1..10, what does continue do when i reaches 5?",
        quizOptions: [
          "It skips the rest of that iteration and continues with i = 6",
          "It exits the loop entirely",
          "It restarts the loop from i = 1",
          "It runs the update expression twice"
        ],
        quizAnswer: "It skips the rest of that iteration and continues with i = 6",
        hints: ["break exits the loop, continue skips the remaining body of the current iteration."],
        skillKeys: ["c.loops"]
      }
    ]
  },
  {
    slug: "w1-io-formatting",
    title: "Formatted I/O and clean input",
    world: "World 1 — C Fundamentals",
    worldOrder: 1,
    order: 5,
    summary: "Control field widths, read whole lines, and treat input failures as real cases.",
    objectives: ["Use printf width and precision", "Read a line with fgets", "Strip the newline", "Explain why gets and unbounded reads are unsafe"],
    prerequisites: ["w1-loops"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Format is a contract",
        body: "A printf conversion looks like %[flags][width][.precision][length]specifier. %5d prints an int right-aligned in five columns, %-5d left-aligns it, %05d pads with zeros, and %.2f prints two decimals. Width and precision are also accepted as * arguments, as in printf(\"%*d\", width, value). For input, scanf skips leading whitespace but leaves the newline in the stream, which is why a following fgets can read an empty line: consume the newline deliberately or read whole lines consistently. fgets(buffer, size, stdin) copies at most size - 1 bytes and always terminates, so it is the safe line reader. gets has no way to bound the copy and was removed from C11.",
        skillKeys: ["c.io", "c.strings"]
      },
      {
        order: 2,
        kind: "code",
        title: "Aligned columns",
        body: "Read two integers and print each in a field of width 5, separated by one space.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 1;
    // Print both values with width 5 and a single space between them.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 1;\n    printf(\"%5d %5d\\n\", a, b);\n    return 0;\n}",
        testInput: "7 12",
        expectedOutput: "    7    12",
        hints: ["A width of 5 right-aligns within five columns.", "Width does not insert a space; the format string does."],
        skillKeys: ["c.io"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Greet a whole line",
        body: "Read one line with fgets, remove the trailing newline if present, and print Hello, NAME! where NAME is the line content.",
        starterCode: c`#include <stdio.h>
#include <string.h>

int main(void) {
    char name[100];
    if (fgets(name, sizeof name, stdin) == NULL) return 1;
    // Remove a trailing newline.
    printf("Hello, %s!\n", name);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char name[100];\n    if (fgets(name, sizeof name, stdin) == NULL) return 1;\n    size_t length = strlen(name);\n    if (length > 0 && name[length - 1] == '\\n') name[length - 1] = '\\0';\n    printf(\"Hello, %s!\\n\", name);\n    return 0;\n}",
        testInput: "Ada Lovelace\n",
        expectedOutput: "Hello, Ada Lovelace!",
        hints: ["strlen counts the characters before the terminator.", "Overwrite the newline with a null byte instead of printing around it."],
        skillKeys: ["c.io", "c.strings"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "Why fgets instead of gets",
        body: "What is the fundamental safety difference between fgets and the removed gets function?",
        quizOptions: [
          "fgets takes a buffer size and never writes more than that many bytes",
          "fgets is faster",
          "gets strips newlines",
          "fgets can read binary data"
        ],
        quizAnswer: "fgets takes a buffer size and never writes more than that many bytes",
        hints: ["gets has no capacity parameter, so it cannot know where the buffer ends."],
        skillKeys: ["c.io", "c.strings"]
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
    objectives: ["Declare arrays", "Iterate over valid indices", "Recognize out-of-bounds access", "Understand array-to-pointer decay"],
    prerequisites: ["w1-loops"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Contiguous objects",
        body: "An array stores equal-typed elements contiguously. For length n, valid indices are 0 through n - 1, and the compiler does not insert a bounds check. Reading or writing beyond the array is undefined behavior even when nearby memory happens to be accessible. In most expressions an array name converts to a pointer to its first element, which is why sizeof a is the whole array only where the array type is still visible. Inside a function parameter the array has already decayed, so always pass the length separately and prefer sizeof expression forms such as `malloc(n * sizeof *a)`.",
        skillKeys: ["c.arrays"]
      },
      {
        order: 2,
        kind: "code",
        title: "Reverse an array",
        body: "Read n and then n integers. Print the values in reverse order separated by single spaces.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n, a[100];
    if (scanf("%d", &n) != 1 || n < 0 || n > 100) return 1;
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    // Print from the final valid index down to zero.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n, a[100];\n    if (scanf(\"%d\", &n) != 1 || n < 0 || n > 100) return 1;\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    for (int i = n - 1; i >= 0; --i) printf(\"%d \", a[i]);\n    printf(\"\\n\");\n    return 0;\n}",
        testInput: "3\n1 2 3",
        expectedOutput: "3 2 1",
        hints: ["The final valid index is n - 1.", "A descending loop can stop after index 0."],
        skillKeys: ["c.arrays"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Minimum, maximum, and total",
        body: "Read n (1 ≤ n ≤ 1000) and then n integers. Print the minimum, the maximum, and the sum, separated by single spaces.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 1000) return 1;
    int values[1000];
    for (int i = 0; i < n; ++i) scanf("%d", &values[i]);
    // Compute the minimum, maximum, and sum.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 1000) return 1;\n    int values[1000];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &values[i]);\n    int smallest = values[0], largest = values[0];\n    long long sum = 0;\n    for (int i = 0; i < n; ++i) {\n        if (values[i] < smallest) smallest = values[i];\n        if (values[i] > largest) largest = values[i];\n        sum += values[i];\n    }\n    printf(\"%d %d %lld\\n\", smallest, largest, sum);\n    return 0;\n}",
        testInput: "5\n3 1 4 1 5",
        expectedOutput: "1 5 14",
        hints: ["Seed both extremes with the first element, not with 0.", "Accumulate the sum in long long so large inputs cannot overflow."],
        skillKeys: ["c.arrays", "c.loops"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "The last valid index",
        body: "For `int a[10];`, which expression reads outside the array?",
        quizOptions: ["a[0]", "a[9]", "a[10]", "a[10 - 1]"],
        quizAnswer: "a[10]",
        hints: ["Indexing starts at 0, so ten elements occupy indices 0 through 9."],
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
    objectives: ["Explain null termination", "Read a bounded line", "Avoid buffer overflow", "Scan characters safely"],
    prerequisites: ["w2-arrays"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "A string needs a terminator",
        body: "A C string is a char array ending in a '\\0' byte. strlen scans until that byte and knows nothing about the array capacity, so an unterminated buffer turns every string function into an out-of-bounds read. The terminator consumes storage: \"hello\" needs six bytes. Track two numbers in your head at all times, the current length and the capacity, and make sure length + 1 never exceeds capacity. <string.h> provides the tools: strlen, strcmp, strcpy, strncpy, strcat, snprintf, and memcpy. The <ctype.h> predicates classify bytes but require an unsigned char argument.",
        skillKeys: ["c.strings"]
      },
      {
        order: 2,
        kind: "code",
        title: "Length without strlen",
        body: "Read one line and print its length, excluding a trailing newline.",
        starterCode: c`#include <stdio.h>

int main(void) {
    char s[200];
    if (!fgets(s, sizeof s, stdin)) return 1;
    int length = 0;
    // Count until newline or null terminator.
    printf("%d\n", length);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    char s[200];\n    if (!fgets(s, sizeof s, stdin)) return 1;\n    int length = 0;\n    while (s[length] != '\\0' && s[length] != '\\n') ++length;\n    printf(\"%d\\n\", length);\n    return 0;\n}",
        testInput: "hello\n",
        expectedOutput: "5",
        hints: ["Stop at the terminator and at the newline.", "Both conditions belong in the same loop condition."],
        skillKeys: ["c.strings"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Count the vowels",
        body: "Read one line of text and count uppercase and lowercase vowels (a, e, i, o, u). Ignore the newline.",
        starterCode: c`#include <stdio.h>
#include <ctype.h>

int main(void) {
    char line[500];
    if (!fgets(line, sizeof line, stdin)) return 1;
    int vowels = 0;
    // Count vowels in line.
    printf("%d\n", vowels);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\n#include <ctype.h>\n\nint main(void) {\n    char line[500];\n    if (!fgets(line, sizeof line, stdin)) return 1;\n    int vowels = 0;\n    for (int i = 0; line[i] != '\\0'; ++i) {\n        char ch = (char)tolower((unsigned char)line[i]);\n        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') ++vowels;\n    }\n    printf(\"%d\\n\", vowels);\n    return 0;\n}",
        testInput: "Programming in C\n",
        expectedOutput: "4",
        hints: ["tolower returns the lowercase form of a character.", "Cast to unsigned char before calling ctype functions."],
        skillKeys: ["c.strings", "c.loops"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "Capacity and length",
        body: "Why is `strcpy(dest, src)` dangerous when dest is a fixed-size buffer?",
        quizOptions: [
          "It copies without knowing dest's capacity, so a long src overflows it",
          "It allocates memory that is never freed",
          "It always copies exactly 256 bytes",
          "It stops at the first space"
        ],
        quizAnswer: "It copies without knowing dest's capacity, so a long src overflows it",
        hints: ["strcpy's signature has no size parameter at all."],
        skillKeys: ["c.strings"]
      }
    ]
  },
  {
    slug: "w2-sorting",
    title: "Sorting",
    world: "World 2 — Arrays and Strings",
    worldOrder: 2,
    order: 3,
    summary: "Order data with hand-written sorts and with qsort comparators.",
    objectives: ["Implement selection sort", "Write a qsort comparator", "Compare O(n²) with O(n log n)", "Keep sorts stable when it matters"],
    prerequisites: ["w2-arrays"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Ordering is a comparison contract",
        body: "Sorting rearranges values so that each pair is in order according to a comparator. Selection sort finds the smallest remaining element and swaps it into place: simple, O(n²), and not stable. Insertion sort is O(n²) worst case but close to O(n) on nearly sorted data. qsort from <stdlib.h> is a general O(n log n) library sort. Its comparator receives two const void * pointers and returns a negative value, zero, or a positive value. Never build a comparator from a subtraction: b - a overflows for large ints, and for strings you need strcmp anyway.",
        skillKeys: ["c.sorting", "algo.sorting"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sort ascending with qsort",
        body: "Read n (1 ≤ n ≤ 1000) and n integers. Print them in ascending order separated by single spaces.",
        starterCode: c`#include <stdio.h>
#include <stdlib.h>

static int compare_int(const void *left, const void *right) {
    // Return a negative value, zero, or a positive value.
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 1000) return 1;
    int a[1000];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    qsort(a, (size_t)n, sizeof a[0], compare_int);
    for (int i = 0; i < n; ++i) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\n#include <stdlib.h>\n\nstatic int compare_int(const void *left, const void *right) {\n    int a = *(const int *)left;\n    int b = *(const int *)right;\n    return (a > b) - (a < b);\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 1000) return 1;\n    int a[1000];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    qsort(a, (size_t)n, sizeof a[0], compare_int);\n    for (int i = 0; i < n; ++i) printf(\"%d \", a[i]);\n    printf(\"\\n\");\n    return 0;\n}",
        testInput: "5\n5 3 9 1 7",
        expectedOutput: "1 3 5 7 9",
        hints: ["Cast each const void * to const int * before dereferencing.", "(a > b) - (a < b) yields 1, 0, or -1 without overflow."],
        skillKeys: ["c.sorting", "c.pointers.void"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "code",
        title: "Selection sort by hand",
        body: "Read n (1 ≤ n ≤ 500) and n integers. Sort them ascending using selection sort, then print them. The judge only compares output, but the loop structure is the lesson.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 500) return 1;
    int a[500];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    // Selection sort: find the smallest remainder, then swap it into place.
    for (int i = 0; i < n; ++i) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 500) return 1;\n    int a[500];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    for (int i = 0; i < n; ++i) {\n        int smallest = i;\n        for (int j = i + 1; j < n; ++j) {\n            if (a[j] < a[smallest]) smallest = j;\n        }\n        int temporary = a[i];\n        a[i] = a[smallest];\n        a[smallest] = temporary;\n    }\n    for (int i = 0; i < n; ++i) printf(\"%d \", a[i]);\n    printf(\"\\n\");\n    return 0;\n}",
        testInput: "4\n4 1 3 2",
        expectedOutput: "1 2 3 4",
        hints: ["Track the index of the smallest element, not its value.", "Swap only after the inner scan finishes."],
        skillKeys: ["c.sorting", "algo.sorting"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "Stability",
        body: "A sort is stable when equal elements keep their original relative order. Which statement is true?",
        quizOptions: [
          "qsort is not guaranteed to be stable",
          "qsort is always stable",
          "Selection sort is stable",
          "Stability changes the asymptotic running time"
        ],
        quizAnswer: "qsort is not guaranteed to be stable",
        hints: ["The C standard promises ordering, not stability. Add a tiebreaker to the comparator when order among equals matters."],
        skillKeys: ["c.sorting", "algo.sorting"]
      }
    ]
  },
  {
    slug: "w2-searching",
    title: "Searching",
    world: "World 2 — Arrays and Strings",
    worldOrder: 2,
    order: 4,
    summary: "Find values with linear and binary search and reason about the precondition.",
    objectives: ["Implement linear search", "Implement binary search safely", "State the sorted-array precondition", "Compare O(n) with O(log n)"],
    prerequisites: ["w2-sorting"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Half the world each step",
        body: "Linear search checks every element and is O(n); it works on any data and is the right choice for one-off lookups in small arrays. Binary search requires sorted data and repeatedly halves the remaining range, giving O(log n). Write the loop as `while (low <= high)` with `mid = low + (high - low) / 2`, then move `low = mid + 1` or `high = mid - 1`. Using (low + high) / 2 can overflow when the indices are large, and forgetting the +1 or -1 in a branch creates an infinite loop. If duplicates exist, a plain binary search returns an arbitrary match; a lower-bound loop that never exits early finds the first one.",
        skillKeys: ["c.searching", "algo.binary_search"]
      },
      {
        order: 2,
        kind: "code",
        title: "Binary search index",
        body: "Read n (1 ≤ n ≤ 1000), then n integers in ascending order, then a target. Print the zero-based index of the target, or -1 if it does not appear.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 1000) return 1;
    int a[1000];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    int target;
    if (scanf("%d", &target) != 1) return 1;
    int low = 0, high = n - 1, found = -1;
    // Binary search for target.
    printf("%d\n", found);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 1000) return 1;\n    int a[1000];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    int target;\n    if (scanf(\"%d\", &target) != 1) return 1;\n    int low = 0, high = n - 1, found = -1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (a[mid] == target) { found = mid; break; }\n        if (a[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    printf(\"%d\\n\", found);\n    return 0;\n}",
        testInput: "5\n1 3 5 7 9\n7",
        expectedOutput: "3",
        hints: ["Shrink the range with mid + 1 or mid - 1, never with mid.", "Exit as soon as a[mid] equals the target."],
        skillKeys: ["c.searching", "algo.binary_search"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "code",
        title: "First occurrence",
        body: "Read n, n sorted integers that may contain duplicates, and a target. Print the index of the first occurrence, or -1. Keep searching left after a match instead of breaking.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 1000) return 1;
    int a[1000];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    int target;
    if (scanf("%d", &target) != 1) return 1;
    int low = 0, high = n - 1, answer = -1;
    // Lower-bound search.
    printf("%d\n", answer);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 1000) return 1;\n    int a[1000];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    int target;\n    if (scanf(\"%d\", &target) != 1) return 1;\n    int low = 0, high = n - 1, answer = -1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (a[mid] == target) { answer = mid; high = mid - 1; }\n        else if (a[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    printf(\"%d\\n\", answer);\n    return 0;\n}",
        testInput: "6\n2 4 4 4 6 8\n4",
        expectedOutput: "1",
        hints: ["Record the match, then continue on the left half.", "The loop must terminate even after a match."],
        skillKeys: ["c.searching", "algo.binary_search"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "The precondition",
        body: "Binary search on an unsorted array can return -1 even when the target is present. Why?",
        quizOptions: [
          "It discards half the range based on an order assumption that is false",
          "It only works for strings",
          "It needs the array to be null-terminated",
          "It stops after 32 comparisons"
        ],
        quizAnswer: "It discards half the range based on an order assumption that is false",
        hints: ["Sort first, then search, or use linear search on unsorted data."],
        skillKeys: ["c.searching", "algo.binary_search"]
      }
    ]
  },
  {
    slug: "w2-2d-arrays",
    title: "Two-dimensional arrays",
    world: "World 2 — Arrays and Strings",
    worldOrder: 2,
    order: 5,
    summary: "Model grids with row-major arrays and nested traversal.",
    objectives: ["Declare a 2D array", "Traverse rows and columns", "Explain row-major layout", "Print a transposed grid"],
    prerequisites: ["w2-strings"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Grids are arrays of arrays",
        body: "`int grid[3][4]` is an array of three elements, each an array of four ints. Index it as grid[row][column]. Storage is row-major: the whole first row sits before the second, so the element at grid[r][c] lives r * 4 + c ints after the start. That layout makes row-wise traversal cache friendly and column-wise traversal slower on large grids. Function parameters lose the outer dimension but must keep the inner one: `void f(int grid[][4], int rows)`.",
        skillKeys: ["c.arrays"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sum a matrix",
        body: "Read rows r and columns c (1 ≤ r, c ≤ 100), then r × c integers, and print their sum.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int r, c;
    if (scanf("%d %d", &r, &c) != 2 || r <= 0 || c <= 0 || r > 100 || c > 100) return 1;
    int grid[100][100];
    // Read the matrix and accumulate the sum.
    long long sum = 0;
    printf("%lld\n", sum);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2 || r <= 0 || c <= 0 || r > 100 || c > 100) return 1;\n    int grid[100][100];\n    long long sum = 0;\n    for (int i = 0; i < r; ++i) {\n        for (int j = 0; j < c; ++j) {\n            if (scanf(\"%d\", &grid[i][j]) != 1) return 1;\n            sum += grid[i][j];\n        }\n    }\n    printf(\"%lld\\n\", sum);\n    return 0;\n}",
        testInput: "2 3\n1 2 3\n4 5 6",
        expectedOutput: "21",
        hints: ["The outer loop walks rows, the inner loop walks columns.", "scanf ignores the line breaks in the input, so only the order matters."],
        skillKeys: ["c.arrays", "c.loops"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "code",
        title: "Print the transpose",
        body: "Read r and c, then the matrix. Print the transposed matrix: c rows, each with r values separated by single spaces.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int r, c;
    if (scanf("%d %d", &r, &c) != 2 || r <= 0 || c <= 0 || r > 50 || c > 50) return 1;
    int grid[50][50];
    for (int i = 0; i < r; ++i)
        for (int j = 0; j < c; ++j)
            if (scanf("%d", &grid[i][j]) != 1) return 1;
    // Print the transpose: swap the loop order.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2 || r <= 0 || c <= 0 || r > 50 || c > 50) return 1;\n    int grid[50][50];\n    for (int i = 0; i < r; ++i)\n        for (int j = 0; j < c; ++j)\n            if (scanf(\"%d\", &grid[i][j]) != 1) return 1;\n    for (int j = 0; j < c; ++j) {\n        for (int i = 0; i < r; ++i) printf(\"%d \", grid[i][j]);\n        printf(\"\\n\");\n    }\n    return 0;\n}",
        testInput: "2 3\n1 2 3\n4 5 6",
        expectedOutput: "1 4 \n2 5 \n3 6 ",
        hints: ["The transpose has c rows of r values.", "Swap which index is the outer loop variable."],
        skillKeys: ["c.arrays"],
        xpReward: 25
      },
      {
        order: 4,
        kind: "quiz",
        title: "Row-major layout",
        body: "In row-major order, which element of `int a[3][4]` is stored immediately after a[0][3]?",
        quizOptions: ["a[1][0]", "a[0][4]", "a[3][0]", "a[1][3]"],
        quizAnswer: "a[1][0]",
        hints: ["The first row is stored completely, then the second row begins."],
        skillKeys: ["c.arrays"]
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
    objectives: ["Declare and call functions", "Explain call by value", "Use pointers for caller mutation", "Write a function contract"],
    prerequisites: ["w2-strings"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "C passes values",
        body: "C always passes arguments by value: a parameter starts as a copy, and assigning to it cannot affect the caller. To let a function modify a caller's object, pass that object's address and dereference the pointer. A useful function contract states the valid inputs, the effects, and the meaning of the return value. Prototypes exist so the compiler can check argument types before linking; a call to an undeclared function is an error in modern C. Mark helpers `static` unless another translation unit needs them, and mark parameters `const` when the function does not write through them.",
        skillKeys: ["c.functions", "c.pointers.basic"]
      },
      {
        order: 2,
        kind: "code",
        title: "Swap through pointers",
        body: "Implement swap so it exchanges two integers in the caller.",
        starterCode: c`#include <stdio.h>

void swap(int *a, int *b) {
    // Exchange *a and *b.
}

int main(void) {
    int x, y;
    if (scanf("%d %d", &x, &y) != 2) return 1;
    swap(&x, &y);
    printf("%d %d\n", x, y);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nvoid swap(int *a, int *b) {\n    int temporary = *a;\n    *a = *b;\n    *b = temporary;\n}\n\nint main(void) {\n    int x, y;\n    if (scanf(\"%d %d\", &x, &y) != 2) return 1;\n    swap(&x, &y);\n    printf(\"%d %d\\n\", x, y);\n    return 0;\n}",
        testInput: "1 2",
        expectedOutput: "2 1",
        hints: ["Save one value before overwriting it.", "Write through the pointers, not through the pointer variables."],
        skillKeys: ["c.functions", "c.pointers.basic"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Two results from one function",
        body: "Implement `void min_max(const int *a, int n, int *min_out, int *max_out)` and use it to print the minimum and maximum of the input.",
        starterCode: c`#include <stdio.h>

void min_max(const int *a, int n, int *min_out, int *max_out) {
    // Write the smallest and largest values through the out parameters.
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 1000) return 1;
    int values[1000];
    for (int i = 0; i < n; ++i) scanf("%d", &values[i]);
    int lo = 0, hi = 0;
    min_max(values, n, &lo, &hi);
    printf("%d %d\n", lo, hi);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nvoid min_max(const int *a, int n, int *min_out, int *max_out) {\n    int smallest = a[0], largest = a[0];\n    for (int i = 1; i < n; ++i) {\n        if (a[i] < smallest) smallest = a[i];\n        if (a[i] > largest) largest = a[i];\n    }\n    *min_out = smallest;\n    *max_out = largest;\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 1000) return 1;\n    int values[1000];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &values[i]);\n    int lo = 0, hi = 0;\n    min_max(values, n, &lo, &hi);\n    printf(\"%d %d\\n\", lo, hi);\n    return 0;\n}",
        testInput: "4\n5 2 9 1",
        expectedOutput: "1 9",
        hints: ["Out parameters are ordinary pointer writes: *min_out = value.", "The const on the input array promises the function will not modify it."],
        skillKeys: ["c.functions", "c.pointers.functions"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "Why declare a prototype",
        body: "What is the main reason to declare a function prototype before its first call?",
        quizOptions: [
          "It lets the compiler check argument count and types at the call site",
          "It makes the function run faster",
          "It allocates storage for the parameters",
          "It is required only for recursive functions"
        ],
        quizAnswer: "It lets the compiler check argument count and types at the call site",
        hints: ["Without a visible declaration, the compiler cannot verify the call."],
        skillKeys: ["c.functions"]
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
    objectives: ["Identify a base case", "Prove recursive progress", "Relate calls to stack use", "Replace exponential recursion with memoization"],
    prerequisites: ["w3-functions"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Base case, then progress",
        body: "A recursive function must stop at a base case, and every recursive path must move toward it. Each active call consumes a stack frame holding its parameters and locals, so recursion depth is bounded by the stack, typically a few thousand frames. Two recursive calls per level produce a call tree that grows exponentially: naive Fibonacci is O(2ⁿ). Storing already computed answers, or rewriting the recurrence bottom-up, restores linear time. Any recursion can be expressed as iteration with an explicit stack, which is often the right move when depth scales with input size.",
        skillKeys: ["c.recursion", "algo.complexity"]
      },
      {
        order: 2,
        kind: "code",
        title: "Recursive factorial",
        body: "Implement factorial recursively for 0 ≤ n ≤ 12 and print the result.",
        starterCode: c`#include <stdio.h>

long factorial(int n) {
    // Base case and recursive case.
    return 1;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 12) return 1;
    printf("%ld\n", factorial(n));
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nlong factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n < 0 || n > 12) return 1;\n    printf(\"%ld\\n\", factorial(n));\n    return 0;\n}",
        testInput: "5",
        expectedOutput: "120",
        hints: ["0! and 1! are both 1.", "Each call multiplies n by the result for n - 1."],
        skillKeys: ["c.recursion"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Fibonacci with a cache",
        body: "Read n (0 ≤ n ≤ 60) and print the n-th Fibonacci number, with F(0) = 0 and F(1) = 1. The naive double recursion is too slow and overflows for n = 60, so cache values in an array of long long.",
        starterCode: c`#include <stdio.h>

long long fib(int n) {
    // Memoized or iterative Fibonacci.
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 60) return 1;
    printf("%lld\n", fib(n));
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nlong long fib(int n) {\n    long long cache[61];\n    cache[0] = 0;\n    if (n >= 1) cache[1] = 1;\n    for (int i = 2; i <= n; ++i) cache[i] = cache[i - 1] + cache[i - 2];\n    return cache[n];\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n < 0 || n > 60) return 1;\n    printf(\"%lld\\n\", fib(n));\n    return 0;\n}",
        testInput: "10",
        expectedOutput: "55",
        hints: ["F(60) needs 64 bits; int overflows long before that.", "Compute each value exactly once, from the two previous ones."],
        skillKeys: ["c.recursion", "algo.complexity"],
        xpReward: 25
      },
      {
        order: 4,
        kind: "quiz",
        title: "Missing progress",
        body: "A recursive function has a correct base case but calls itself with the same argument it received. What happens?",
        quizOptions: [
          "It recurses until the stack is exhausted and the process crashes",
          "It returns the base case value",
          "The compiler rejects the function",
          "It behaves like a loop and terminates"
        ],
        quizAnswer: "It recurses until the stack is exhausted and the process crashes",
        hints: ["Termination needs both a base case and progress toward it."],
        skillKeys: ["c.recursion"]
      }
    ]
  },
  {
    slug: "w3-scope",
    title: "Scope, storage, and lifetimes",
    world: "World 3 — Functions and Recursion",
    worldOrder: 3,
    order: 3,
    summary: "Reason about where names are visible and how long their objects live.",
    objectives: ["Distinguish block scope from file scope", "Use static locals deliberately", "Recognize and remove shadowing", "Explain automatic storage duration"],
    prerequisites: ["w3-functions"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Visibility is not the same as lifetime",
        body: "Scope is where a name is visible; storage duration is how long the object exists. A local has automatic storage duration and dies at the end of its block, so returning its address produces a dangling pointer. A `static` local has static storage duration: it is initialized once, keeps its value across calls, and is created before main runs. Shadowing happens when an inner declaration reuses an outer name; the inner one wins for the rest of that block, which is a common source of \"I assigned it but nothing changed\" bugs. Compile with -Wshadow to let the compiler point these out.",
        skillKeys: ["c.scope"]
      },
      {
        order: 2,
        kind: "code",
        title: "A static counter",
        body: "Implement `int next_id(void)` so each call returns one more than the previous call, starting at 1, using a static local. The calls print 1 2 3.",
        starterCode: c`#include <stdio.h>

int next_id(void) {
    // Use static storage so the counter survives between calls.
    return 0;
}

int main(void) {
    printf("%d %d %d\n", next_id(), next_id(), next_id());
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint next_id(void) {\n    static int counter = 0;\n    return ++counter;\n}\n\nint main(void) {\n    int first = next_id();\n    int second = next_id();\n    int third = next_id();\n    printf(\"%d %d %d\\n\", first, second, third);\n    return 0;\n}",
        testInput: "",
        expectedOutput: "1 2 3",
        hints: ["static int counter = 0; initializes once, not on every call.", "Function argument evaluation order is unspecified, so sequence the calls in separate statements."],
        skillKeys: ["c.scope"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "debug",
        title: "Fix the shadowed variable",
        body: "This program should print the sum 6 of the array but prints 0. Find the shadowing bug: the accumulator is redeclared inside the loop block, so the outer total never changes. Keep the outer object and assign to it.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int values[3] = {1, 2, 3};
    int total = 0;
    for (int i = 0; i < 3; ++i) {
        int total = 0;
        total += values[i];
    }
    printf("%d\n", total);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int values[3] = {1, 2, 3};\n    int total = 0;\n    for (int i = 0; i < 3; ++i) {\n        total += values[i];\n    }\n    printf(\"%d\\n\", total);\n    return 0;\n}",
        testInput: "",
        expectedOutput: "6",
        hints: ["Declare the accumulator once, before the loop.", "-Wshadow would have reported this immediately."],
        skillKeys: ["c.scope", "c.debugging"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "Static local lifetime",
        body: "When is a static local variable inside a function created?",
        quizOptions: [
          "Before the program starts, and it keeps its value between calls",
          "Each time the function is called",
          "When the function first returns",
          "Only if the function is recursive"
        ],
        quizAnswer: "Before the program starts, and it keeps its value between calls",
        hints: ["Static storage duration means one object for the whole run of the program."],
        skillKeys: ["c.scope"]
      }
    ]
  },
  {
    slug: "w3-out-parameters",
    title: "Out parameters and error reporting",
    world: "World 3 — Functions and Recursion",
    worldOrder: 3,
    order: 4,
    summary: "Return a status code and hand results back through pointers.",
    objectives: ["Separate result from status", "Use pointer out parameters", "Propagate failure to main", "Choose between structs and out parameters"],
    prerequisites: ["w3-scope"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "One return value is not always enough",
        body: "A C function returns at most one value, and that value is often best spent on success or failure. The common contract is `int do_work(input, output_pointer)`: return 0 on success and a nonzero error code otherwise, and write the result only when returning 0. Callers then check every call. An alternative is returning a struct by value; that is clean for small results and lets the compiler copy efficiently. What you should not do is return a pointer to a local or signal errors with a magic value such as -1 that could also be a legitimate result.",
        skillKeys: ["c.functions", "c.pointers.functions"]
      },
      {
        order: 2,
        kind: "code",
        title: "Division with a status code",
        body: "Implement `int safe_divide(int a, int b, int *out)` returning 0 on success and 1 when b is zero. Print the quotient on success and the word error otherwise.",
        starterCode: c`#include <stdio.h>

int safe_divide(int a, int b, int *out) {
    // Write a / b through out and return 0, or return 1 without writing.
    return 1;
}

int main(void) {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 1;
    int quotient = 0;
    if (safe_divide(a, b, &quotient) == 0) printf("%d\n", quotient);
    else puts("error");
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint safe_divide(int a, int b, int *out) {\n    if (b == 0) return 1;\n    *out = a / b;\n    return 0;\n}\n\nint main(void) {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 1;\n    int quotient = 0;\n    if (safe_divide(a, b, &quotient) == 0) printf(\"%d\\n\", quotient);\n    else puts(\"error\");\n    return 0;\n}",
        testInput: "7 2",
        expectedOutput: "3",
        hints: ["Check b before dividing; integer division by zero is undefined behavior.", "Only write *out on the success path."],
        skillKeys: ["c.functions", "c.pointers.functions"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "code",
        title: "Propagate a parse failure",
        body: "Read an integer inside a loop until a valid value arrives, but treat a non-numeric token as an error: implement a helper that returns 1 on a failed scan and then write the error message. For this exercise, print ok followed by the value when the first read succeeds, and error when it fails.",
        starterCode: c`#include <stdio.h>

int read_int(int *out) {
    // Return 0 on success, 1 on failure, writing through out only on success.
    return 1;
}

int main(void) {
    int value = 0;
    if (read_int(&value) != 0) {
        puts("error");
        return 0;
    }
    printf("ok %d\n", value);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint read_int(int *out) {\n    int temporary;\n    if (scanf(\"%d\", &temporary) != 1) return 1;\n    *out = temporary;\n    return 0;\n}\n\nint main(void) {\n    int value = 0;\n    if (read_int(&value) != 0) {\n        puts(\"error\");\n        return 0;\n    }\n    printf(\"ok %d\\n\", value);\n    return 0;\n}",
        testInput: "41",
        expectedOutput: "ok 41",
        hints: ["Scan into a temporary so a failure cannot corrupt the caller's object.", "Return values are the normal way to report failure in C."],
        skillKeys: ["c.functions", "c.io"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "Returning a local address",
        body: "Why is `int *make(void) { int x = 5; return &x; }` wrong?",
        quizOptions: [
          "x is destroyed when the function returns, so the pointer dangles",
          "The pointer type is wrong",
          "x must be declared static to be returned",
          "It leaks memory"
        ],
        quizAnswer: "x is destroyed when the function returns, so the pointer dangles",
        hints: ["Automatic storage duration ends with the block that declared the object."],
        skillKeys: ["c.scope", "c.pointers.basic"]
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
    objectives: ["Use & and *", "Initialize pointers", "Recognize invalid dereferences", "Explain NULL"],
    prerequisites: ["w3-functions"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Address versus value",
        body: "&x produces x's address. A compatible pointer stores that address, and *p designates the object at the stored address. A pointer has its own type: int * and double * have different sizes and very different arithmetic. The `int *` in a declaration binds to the name, so `int *a, b;` declares one pointer and one int. Never dereference an uninitialized pointer, NULL, a one-past pointer, or a pointer whose object lifetime has ended. Storing an address does not extend a lifetime: after a block ends, every pointer into it is dangling even if the bytes still look unchanged.",
        skillKeys: ["c.pointers.basic"]
      },
      {
        order: 2,
        kind: "code",
        title: "Increment through a pointer",
        body: "Read x, use p to increment x through indirection, and print x.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int x;
    if (scanf("%d", &x) != 1) return 1;
    int *p = &x;
    // Increment the pointed-to integer.
    printf("%d\n", x);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    int *p = &x;\n    *p = *p + 1;\n    printf(\"%d\\n\", x);\n    return 0;\n}",
        testInput: "7",
        expectedOutput: "8",
        hints: ["*p is the object, so *p = *p + 1 modifies x.", "Writing p + 1 would move the pointer, not the value."],
        skillKeys: ["c.pointers.basic"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Write through a pointer parameter",
        body: "Implement `void set_zero(int *value)` so the caller's integer becomes 0.",
        starterCode: c`#include <stdio.h>

void set_zero(int *value) {
    // Make the caller's object zero.
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    set_zero(&n);
    printf("%d\n", n);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nvoid set_zero(int *value) {\n    *value = 0;\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    set_zero(&n);\n    printf(\"%d\\n\", n);\n    return 0;\n}",
        testInput: "5",
        expectedOutput: "0",
        hints: ["Assign through the pointer: *value = 0.", "Assigning value = 0 only re-points the local copy."],
        skillKeys: ["c.pointers.basic", "c.functions"],
        xpReward: 15
      },
      {
        order: 4,
        kind: "quiz",
        title: "What NULL means",
        body: "What is guaranteed about the macro NULL in C?",
        quizOptions: [
          "It is a null pointer constant that compares unequal to any object's address",
          "It is the address 0x0 at run time on every machine",
          "It is a pointer to a read-only byte",
          "It equals the empty string"
        ],
        quizAnswer: "It is a null pointer constant that compares unequal to any object's address",
        hints: ["The standard guarantees the comparison behaviour, not a particular bit pattern."],
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
    objectives: ["Explain scaling by sizeof", "Use one-past as a sentinel", "Subtract pointers within one array", "Use two pointers to meet in the middle"],
    prerequisites: ["w4-pointers-basics"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Movement is scaled",
        body: "For `int *p`, p + 1 advances to the next int, not the next byte: the compiler multiplies by sizeof(int). Pointer arithmetic is defined only within one array object plus one position past its end. The one-past pointer is a legitimate sentinel for comparisons such as `while (p != end)`, but dereferencing it is undefined behavior. Subtracting two pointers into the same array yields a ptrdiff_t element count. Void pointers and function pointers do not support this arithmetic in standard C.",
        skillKeys: ["c.pointers.arithmetic", "c.pointers.arrays"]
      },
      {
        order: 2,
        kind: "code",
        title: "Sum with a pointer walk",
        body: "Read n integers and sum them by advancing a pointer from a to a + n.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n, a[100];
    if (scanf("%d", &n) != 1 || n < 0 || n > 100) return 1;
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    int sum = 0;
    // Walk with int *p.
    printf("%d\n", sum);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n, a[100];\n    if (scanf(\"%d\", &n) != 1 || n < 0 || n > 100) return 1;\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    int sum = 0;\n    for (int *p = a; p != a + n; ++p) sum += *p;\n    printf(\"%d\\n\", sum);\n    return 0;\n}",
        testInput: "3\n1 2 3",
        expectedOutput: "6",
        hints: ["a + n is the one-past pointer, a valid sentinel to compare against.", "Dereference with *p after checking the loop condition."],
        skillKeys: ["c.pointers.arithmetic", "c.pointers.arrays"],
        xpReward: 15
      },
      {
        order: 3,
        kind: "code",
        title: "Reverse in place with two pointers",
        body: "Read n and n integers. Reverse the array in place using two pointers that walk toward each other, then print the result separated by single spaces.",
        starterCode: c`#include <stdio.h>

int main(void) {
    int n, a[100];
    if (scanf("%d", &n) != 1 || n < 0 || n > 100) return 1;
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    // Reverse in place with pointers.
    for (int i = 0; i < n; ++i) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int n, a[100];\n    if (scanf(\"%d\", &n) != 1 || n < 0 || n > 100) return 1;\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    for (int *left = a, *right = a + n - 1; left < right; ++left, --right) {\n        int temporary = *left;\n        *left = *right;\n        *right = temporary;\n    }\n    for (int i = 0; i < n; ++i) printf(\"%d \", a[i]);\n    printf(\"\\n\");\n    return 0;\n}",
        testInput: "5\n1 2 3 4 5",
        expectedOutput: "5 4 3 2 1",
        hints: ["Start right at a + n - 1, the last element.", "Stop when left >= right so the middle element is not swapped with itself."],
        skillKeys: ["c.pointers.arithmetic", "cp.two_pointers"],
        xpReward: 25
      },
      {
        order: 4,
        kind: "quiz",
        title: "Distance in ints",
        body: "If `int a[10]; int *p = &a[2], *q = &a[7];`, what is the value of q - p?",
        quizOptions: ["5", "20", "1", "Undefined"],
        quizAnswer: "5",
        hints: ["Pointer subtraction reports a count of elements, not bytes."],
        skillKeys: ["c.pointers.arithmetic"]
      }
    ]
  },
  {
    slug: "w4-pointer-arrays",
    title: "Pointers and arrays",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 3,
    summary: "Rely on decay, pass arrays with their length, and see what sizeof really measures.",
    objectives: ["Explain array-to-pointer decay", "Use a[i] and *(a + i) interchangeably", "Pass arrays with an explicit length", "Avoid sizeof on a decayed parameter"],
    prerequisites: ["w4-pointer-arithmetic"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "An array name is not a pointer",
        body: "In most expressions an array converts to a pointer to its first element, which is why a[i] and *(a + i) mean the same thing and why `&a[0] == a`. An array is still a distinct type: it knows its length through sizeof, and it cannot be assigned. Passing an array to a function passes only the address, so the length must travel separately. Inside that function `sizeof a` is sizeof a pointer, not the array. That is the single most common sizeof bug in C.",
        skillKeys: ["c.pointers.arrays", "c.arrays"]
      },
      {
        order: 2,
        kind: "code",
        title: "strlen by hand",
        body: "Read one line of text and print its length using pointer arithmetic only. Do not call strlen.",
        starterCode: c`#include <stdio.h>

int main(void) {
    char line[300];
    if (!fgets(line, sizeof line, stdin)) return 1;
    const char *p = line;
    // Advance p until the terminator or the newline.
    printf("%d\n", (int)(p - line));
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nint main(void) {\n    char line[300];\n    if (!fgets(line, sizeof line, stdin)) return 1;\n    const char *p = line;\n    while (*p != '\\0' && *p != '\\n') ++p;\n    printf(\"%d\\n\", (int)(p - line));\n    return 0;\n}",
        testInput: "pointers\n",
        expectedOutput: "8",
        hints: ["*p is the current character; ++p moves one char forward.", "Subtracting the start pointer gives the character count."],
        skillKeys: ["c.pointers.arrays", "c.pointers.strings"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "code",
        title: "Double every element",
        body: "Implement `void double_all(int *values, int n)` that multiplies each element by two, then print the doubled array.",
        starterCode: c`#include <stdio.h>

void double_all(int *values, int n) {
    // Modify the caller's array through the pointer.
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 100) return 1;
    int a[100];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    double_all(a, n);
    for (int i = 0; i < n; ++i) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nvoid double_all(int *values, int n) {\n    for (int i = 0; i < n; ++i) values[i] *= 2;\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 100) return 1;\n    int a[100];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    double_all(a, n);\n    for (int i = 0; i < n; ++i) printf(\"%d \", a[i]);\n    printf(\"\\n\");\n    return 0;\n}",
        testInput: "3\n1 2 3",
        expectedOutput: "2 4 6",
        hints: ["The parameter receives the address of a[0], so writes are visible to the caller.", "n is not optional: the function cannot recover the length from the pointer."],
        skillKeys: ["c.pointers.arrays", "c.functions"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "sizeof inside a function",
        body: "For `void f(int a[10])`, what does sizeof(a) evaluate to?",
        quizOptions: [
          "The size of a pointer, because the parameter decayed",
          "40 bytes on every platform",
          "The size of the caller's array",
          "It is a compile error"
        ],
        quizAnswer: "The size of a pointer, because the parameter decayed",
        hints: ["Array parameters are adjusted to pointer parameters before the body is compiled."],
        skillKeys: ["c.pointers.arrays"]
      }
    ]
  },
  {
    slug: "w4-double-pointers",
    title: "Double pointers",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 4,
    summary: "Use a pointer to a pointer when a function must replace a caller's pointer.",
    objectives: ["Explain two levels of indirection", "Modify a caller pointer", "Allocate inside a function", "Read declarations inside out"],
    prerequisites: ["w4-pointer-arrays"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Changing the pointer itself",
        body: "Passing `int *p` copies the pointer, so assigning p inside the function does not retarget the caller's variable. Pass &p instead. The callee receives `int **pp`, and `*pp = target` replaces the caller's pointer value. Two levels of indirection are also how a function returns a freshly allocated buffer: `int allocate(int **out, size_t n)` writes the new pointer through *out. Read such declarations inside out: `int **pp` is a pointer to (pointer to int).",
        skillKeys: ["c.pointers.double"]
      },
      {
        order: 2,
        kind: "code",
        title: "Retarget with int **",
        body: "Implement set_ptr so the caller's p points to b, then print *p.",
        starterCode: c`#include <stdio.h>

void set_ptr(int **p, int *target) {
    // Retarget the caller's pointer.
}

int main(void) {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 1;
    int *p = &a;
    set_ptr(&p, &b);
    printf("%d\n", *p);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nvoid set_ptr(int **p, int *target) {\n    *p = target;\n}\n\nint main(void) {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 1;\n    int *p = &a;\n    set_ptr(&p, &b);\n    printf(\"%d\\n\", *p);\n    return 0;\n}",
        testInput: "3 9",
        expectedOutput: "9",
        hints: ["*p has type int *, which is exactly what you want to assign.", "Writing p = target only changes the local copy of the pointer."],
        skillKeys: ["c.pointers.double"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "code",
        title: "Allocate inside a function",
        body: "Implement `int make_array(int **out, int n)` that allocates n ints with calloc, returns 1 on allocation failure, and writes the pointer through out. Sum the values and free the block.",
        starterCode: c`#include <stdio.h>
#include <stdlib.h>

int make_array(int **out, int n) {
    // Allocate n ints, write the pointer through out, return 0 on success.
    return 1;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 1000) return 1;
    int *values = NULL;
    if (make_array(&values, n) != 0) return 1;
    long long sum = 0;
    for (int i = 0; i < n; ++i) {
        if (scanf("%d", &values[i]) != 1) { free(values); return 1; }
        sum += values[i];
    }
    printf("%lld\n", sum);
    free(values);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\n#include <stdlib.h>\n\nint make_array(int **out, int n) {\n    int *block = calloc((size_t)n, sizeof *block);\n    if (block == NULL) return 1;\n    *out = block;\n    return 0;\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 1000) return 1;\n    int *values = NULL;\n    if (make_array(&values, n) != 0) return 1;\n    long long sum = 0;\n    for (int i = 0; i < n; ++i) {\n        if (scanf(\"%d\", &values[i]) != 1) { free(values); return 1; }\n        sum += values[i];\n    }\n    printf(\"%lld\\n\", sum);\n    free(values);\n    return 0;\n}",
        testInput: "3\n1 2 3",
        expectedOutput: "6",
        hints: ["*out = block publishes the allocation to the caller.", "Check calloc's result before using it, and free exactly once."],
        skillKeys: ["c.pointers.double", "c.memory.malloc", "c.memory.free"],
        xpReward: 30
      },
      {
        order: 4,
        kind: "quiz",
        title: "Reading int **",
        body: "Given `int **pp;`, what type is the expression *pp?",
        quizOptions: ["int *", "int", "int **", "int *const"],
        quizAnswer: "int *",
        hints: ["Each dereference removes one level of indirection."],
        skillKeys: ["c.pointers.double"]
      }
    ]
  },
  {
    slug: "w4-function-pointers",
    title: "Function pointers",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 5,
    summary: "Store behavior in a variable and pass it to library functions.",
    objectives: ["Declare a function pointer", "Select behavior at run time", "Pass a comparator to qsort", "Use a dispatch table"],
    prerequisites: ["w4-double-pointers"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Functions have addresses too",
        body: "A function pointer stores the address of a function with a specific signature. `int (*op)(int, int)` is a pointer to a function taking two ints and returning an int; the parentheses around *op are required, because `int *op(int, int)` declares a function returning int *. A function name decays to its address, so you can assign add directly. Function pointers give C callbacks, dispatch tables, and library hooks such as qsort's comparator. Keep the signature exact: a mismatch passed to qsort is a runtime disaster that the compiler cannot see through void *.",
        skillKeys: ["c.pointers.function"]
      },
      {
        order: 2,
        kind: "code",
        title: "Dispatch on an operator",
        body: "Read two integers and one character (either + or *) and print the result, selecting the operation through a function pointer rather than a long if chain.",
        starterCode: c`#include <stdio.h>

static int add(int a, int b) { return a + b; }
static int multiply(int a, int b) { return a * b; }

int main(void) {
    int a, b;
    char op;
    if (scanf("%d %d %c", &a, &b, &op) != 3) return 1;
    // Choose add or multiply through a function pointer and print the result.
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nstatic int add(int a, int b) { return a + b; }\nstatic int multiply(int a, int b) { return a * b; }\n\nint main(void) {\n    int a, b;\n    char op;\n    if (scanf(\"%d %d %c\", &a, &b, &op) != 3) return 1;\n    int (*operation)(int, int) = (op == '+') ? add : multiply;\n    printf(\"%d\\n\", operation(a, b));\n    return 0;\n}",
        testInput: "3 4 +",
        expectedOutput: "7",
        hints: ["`int (*operation)(int, int)` needs the parentheses around *operation.", "Call through the pointer exactly like a function name."],
        skillKeys: ["c.pointers.function"],
        xpReward: 25
      },
      {
        order: 3,
        kind: "code",
        title: "A qsort comparator for structs",
        body: "Read n, then n lines each containing a name and an age. Sort by age ascending, then by name ascending, and print name and age separated by a space. The comparator receives two const void * that each point to an element of the array.",
        starterCode: c`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[32];
    int age;
} Person;

static int by_age_then_name(const void *left, const void *right) {
    // Compare ages; break ties with strcmp on the names.
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 100) return 1;
    Person people[100];
    for (int i = 0; i < n; ++i) scanf("%31s %d", people[i].name, &people[i].age);
    qsort(people, (size_t)n, sizeof people[0], by_age_then_name);
    for (int i = 0; i < n; ++i) printf("%s %d\n", people[i].name, people[i].age);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\ntypedef struct {\n    char name[32];\n    int age;\n} Person;\n\nstatic int by_age_then_name(const void *left, const void *right) {\n    const Person *a = left;\n    const Person *b = right;\n    if (a->age != b->age) return (a->age > b->age) - (a->age < b->age);\n    return strcmp(a->name, b->name);\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 100) return 1;\n    Person people[100];\n    for (int i = 0; i < n; ++i) scanf(\"%31s %d\", people[i].name, &people[i].age);\n    qsort(people, (size_t)n, sizeof people[0], by_age_then_name);\n    for (int i = 0; i < n; ++i) printf(\"%s %d\\n\", people[i].name, people[i].age);\n    return 0;\n}",
        testInput: "3\nAda 36\nGrace 36\nLinus 24",
        expectedOutput: "Linus 24\nAda 36\nGrace 36",
        hints: ["Cast each void pointer to const Person * before using ->.", "strcmp already returns negative, zero, or positive, so it can be returned directly."],
        skillKeys: ["c.pointers.function", "c.sorting"],
        xpReward: 30
      },
      {
        order: 4,
        kind: "quiz",
        title: "Declaration syntax",
        body: "Which declaration defines a pointer to a function taking two ints and returning an int?",
        quizOptions: ["int (*op)(int, int);", "int *op(int, int);", "int (op)(int, int);", "int op*(int, int);"],
        quizAnswer: "int (*op)(int, int);",
        hints: ["Without the parentheses, the * binds to the return type: int *op(int, int) is a function returning int *."],
        skillKeys: ["c.pointers.function"]
      }
    ]
  },
  {
    slug: "w4-void-pointers",
    title: "Void pointers and generic code",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 6,
    summary: "Move untyped addresses safely and understand where void * must stop.",
    objectives: ["Convert to and from void *", "Explain why void * arithmetic is not standard", "Write a generic swap", "Keep types honest through a cast"],
    prerequisites: ["w4-function-pointers"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "The untyped address",
        body: "`void *` holds any object address and converts to and from other object pointer types without a cast. That makes it the currency of generic APIs: malloc returns void *, qsort takes void * and a size. What void * cannot do is be dereferenced or participate in pointer arithmetic, because the compiler has no element size. Cast to the real type first, then read. Function pointers are not required to convert to void *, so do not smuggle callbacks through it.",
        skillKeys: ["c.pointers.void"]
      },
      {
        order: 2,
        kind: "code",
        title: "Generic swap",
        body: "Implement `void swap_bytes(void *a, void *b, size_t size)` and use it to swap two ints. Work one unsigned char at a time.",
        starterCode: c`#include <stdio.h>
#include <stddef.h>

void swap_bytes(void *a, void *b, size_t size) {
    // Swap size bytes at a and b.
}

int main(void) {
    int x, y;
    if (scanf("%d %d", &x, &y) != 2) return 1;
    swap_bytes(&x, &y, sizeof x);
    printf("%d %d\n", x, y);
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\n#include <stddef.h>\n\nvoid swap_bytes(void *a, void *b, size_t size) {\n    unsigned char *left = a;\n    unsigned char *right = b;\n    for (size_t i = 0; i < size; ++i) {\n        unsigned char temporary = left[i];\n        left[i] = right[i];\n        right[i] = temporary;\n    }\n}\n\nint main(void) {\n    int x, y;\n    if (scanf(\"%d %d\", &x, &y) != 2) return 1;\n    swap_bytes(&x, &y, sizeof x);\n    printf(\"%d %d\\n\", x, y);\n    return 0;\n}",
        testInput: "1 2",
        expectedOutput: "2 1",
        hints: ["Convert the void pointers to unsigned char * before indexing.", "sizeof x is the correct byte count for the generic version."],
        skillKeys: ["c.pointers.void", "c.functions"],
        xpReward: 25
      },
      {
        order: 3,
        kind: "code",
        title: "Sum a block of any integer type",
        body: "Implement `long long sum_values(const void *base, size_t count, size_t size, long long (*read)(const void *))` is too much for now: instead, sum an array of int through a void pointer cast, then print the total. Read n, the values, and print the sum produced by the helper.",
        starterCode: c`#include <stdio.h>
#include <stddef.h>

long long sum_ints(const void *base, size_t count) {
    // Cast to const int * before reading.
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 100) return 1;
    int a[100];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    printf("%lld\n", sum_ints(a, (size_t)n));
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\n#include <stddef.h>\n\nlong long sum_ints(const void *base, size_t count) {\n    const int *values = base;\n    long long total = 0;\n    for (size_t i = 0; i < count; ++i) total += values[i];\n    return total;\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 100) return 1;\n    int a[100];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    printf(\"%lld\\n\", sum_ints(a, (size_t)n));\n    return 0;\n}",
        testInput: "5\n10 20 30 40 50",
        expectedOutput: "150",
        hints: ["Assigning void * to const int * needs no cast in C.", "Index the typed pointer, never the void pointer."],
        skillKeys: ["c.pointers.void", "c.arrays"],
        xpReward: 25
      },
      {
        order: 4,
        kind: "quiz",
        title: "What void * cannot do",
        body: "Why is `p + 1` invalid when p has type void *?",
        quizOptions: [
          "The compiler does not know the size of the pointed-to object",
          "void pointers are always const",
          "It is valid in C and means one byte",
          "It is valid only for char pointers"
        ],
        quizAnswer: "The compiler does not know the size of the pointed-to object",
        hints: ["GCC allows this as an extension, but standard C has no void pointer arithmetic."],
        skillKeys: ["c.pointers.void", "c.pointers.arithmetic"]
      }
    ]
  },
  {
    slug: "w4-const-pointers",
    title: "Const correctness",
    world: "World 4 — Advanced Pointers",
    worldOrder: 4,
    order: 7,
    summary: "Express which part of a pointer relationship is read-only.",
    objectives: ["Distinguish pointer-to-const from const pointer", "Annotate parameters", "Avoid discarding const", "Read complex declarations"],
    prerequisites: ["w4-void-pointers"],
    steps: [
      {
        order: 1,
        kind: "read",
        title: "Two things can be const",
        body: "`const int *p` is a pointer to an int you must not write through p; the pointer itself can be reassigned. `int *const p` is a fixed pointer to a mutable int; p cannot be reassigned but *p can be written. `const int *const p` locks both. Read the declaration from the identifier outward. Annotating parameters makes the contract machine-checked and lets callers pass read-only data such as string literals. Discarding const, for example casting it away or assigning to a plain pointer, is a sign that an interface is wrong, not that a cast is needed.",
        skillKeys: ["c.pointers.const"]
      },
      {
        order: 2,
        kind: "code",
        title: "A const-correct copy",
        body: "Implement `void copy_ints(int *dest, const int *src, int n)` so the source cannot be modified, then print the copy.",
        starterCode: c`#include <stdio.h>

void copy_ints(int *dest, const int *src, int n) {
    // Copy n values from src into dest.
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0 || n > 100) return 1;
    int source[100], copy[100];
    for (int i = 0; i < n; ++i) scanf("%d", &source[i]);
    copy_ints(copy, source, n);
    for (int i = 0; i < n; ++i) printf("%d ", copy[i]);
    printf("\n");
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nvoid copy_ints(int *dest, const int *src, int n) {\n    for (int i = 0; i < n; ++i) dest[i] = src[i];\n}\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0 || n > 100) return 1;\n    int source[100], copy[100];\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &source[i]);\n    copy_ints(copy, source, n);\n    for (int i = 0; i < n; ++i) printf(\"%d \", copy[i]);\n    printf(\"\\n\");\n    return 0;\n}",
        testInput: "3\n4 5 6",
        expectedOutput: "4 5 6",
        hints: ["const on the source parameter is a promise to the caller.", "The compiler now rejects any accidental write to src."],
        skillKeys: ["c.pointers.const", "c.functions"],
        xpReward: 20
      },
      {
        order: 3,
        kind: "debug",
        title: "Fix the discarded const",
        body: "This program tries to modify a string literal through a char * and is undefined behavior. Make the parameter const and print the text without modifying it. The expected output is simply the given word.",
        starterCode: c`#include <stdio.h>

static void shout(char *text) {
    text[0] = text[0];
    printf("%s\n", text);
}

int main(void) {
    shout("quiet");
    return 0;
}
`,
        solutionCode: "#include <stdio.h>\nstatic void shout(const char *text) {\n    printf(\"%s\\n\", text);\n}\n\nint main(void) {\n    shout(\"quiet\");\n    return 0;\n}",
        testInput: "",
        expectedOutput: "quiet",
        hints: ["String literals may live in read-only memory.", "Accept `const char *` when a function only reads the text."],
        skillKeys: ["c.pointers.const", "c.undefined"],
        xpReward: 20
      },
      {
        order: 4,
        kind: "quiz",
        title: "Which part is fixed",
        body: "In `int *const p = &x;`, what is const?",
        quizOptions: [
          "The pointer p, which cannot be reassigned",
          "The integer x, which cannot be modified",
          "Both the pointer and the integer",
          "Neither; it is a syntax error"
        ],
        quizAnswer: "The pointer p, which cannot be reassigned",
        hints: ["const after the * qualifies the pointer itself."],
        skillKeys: ["c.pointers.const"]
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
        hints: ["Subtract the coordinates, then square each difference.", "Use a long long if the coordinates can be large."],
        solutionCode: "#include <stdio.h>\n\ntypedef struct { int x, y; } Point;\n\nint main(void) {\n    Point a, b;\n    if (scanf(\"%d %d %d %d\", &a.x, &a.y, &b.x, &b.y) != 4) return 1;\n    int dx = b.x - a.x;\n    int dy = b.y - a.y;\n    printf(\"%d\\n\", dx * dx + dy * dy);\n    return 0;\n}",
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
        solutionCode: "#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1 || n <= 0) return 1;\n    int *a = malloc((size_t)n * sizeof *a);\n    if (a == NULL) return 1;\n    for (int i = 0; i < n; ++i) scanf(\"%d\", &a[i]);\n    int sum = 0;\n    for (int i = 0; i < n; ++i) sum += a[i];\n    printf(\"%d\\n\", sum);\n    free(a);\n    return 0;\n}",
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
        solutionCode: "#include <stdio.h>\nint main(void) {\n    char buffer[1024];\n    int lines = 0;\n    while (fgets(buffer, sizeof buffer, stdin) != NULL) ++lines;\n    printf(\"%d\\n\", lines);\n    return 0;\n}",
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
        solutionCode: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node { int value; struct Node *next; };\n\nint main(void) {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 1;\n    struct Node *head = NULL;\n    for (int i = 0; i < n; ++i) {\n        int value;\n        scanf(\"%d\", &value);\n        struct Node *node = malloc(sizeof *node);\n        if (node == NULL) return 1;\n        node->value = value;\n        node->next = head;\n        head = node;\n    }\n    for (struct Node *cursor = head; cursor != NULL; cursor = cursor->next) {\n        printf(\"%d \", cursor->value);\n    }\n    printf(\"\\n\");\n    while (head != NULL) {\n        struct Node *next = head->next;\n        free(head);\n        head = next;\n    }\n    return 0;\n}",
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
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    int position = 0, moves = 0;\n    while (position < x) {\n        for (int step = 5; step >= 1; --step) {\n            if (position + step <= x) { position += step; break; }\n        }\n        ++moves;\n    }\n    printf(\"%d\\n\", moves);\n    return 0;\n}",
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
        solutionCode: "#include <stdio.h>\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    printf(\"%d\\n\", (x + 4) / 5);\n    return 0;\n}",
        body: "The lower bound is achievable by taking full steps of 5 and one remainder step when needed. For nonnegative x, ceil(x / 5) is (x + 4) / 5 with integer arithmetic. Run the constant-time implementation.",
        starterCode: "#include <stdio.h>\n\nint main(void) {\n    int x;\n    if (scanf(\"%d\", &x) != 1) return 1;\n    printf(\"%d\\n\", (x + 4) / 5);\n    return 0;\n}\n",
        testInput: "12",
        expectedOutput: "3",
        skillKeys: ["algo.greedy", "algo.complexity"],
        xpReward: 20
      }
    ]
  },
];

export const PROBLEMS: ProblemSeed[] = [
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
    starterCode: c`#include <stdio.h>

int main(void) {
    int x;
    if (scanf("%d", &x) != 1) return 1;
    // Compute the minimum moves.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int x;
    if (scanf("%d", &x) != 1) return 1;
    printf("%d\n", (x + 4) / 5);
    return 0;
}
`,
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
    starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Compute and print the sum.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    printf("%lld\n", (long long)n * (n + 1) / 2);
    return 0;
}
`,
    editorial: "The closed form n(n + 1) / 2 computes the sum in O(1). Convert to long long before multiplication so n near one million does not overflow a 32-bit int. A loop is also correct in O(n).",
    skillKeys: ["c.loops", "algo.complexity"],
    expectedComplexity: "O(1) time, O(1) space",
    tests: [
      { input: "1", expected: "1", hidden: false, order: 1 },
      { input: "10", expected: "55", hidden: false, order: 2 },
      { input: "100", expected: "5050", hidden: true, order: 3 },
      { input: "1000000", expected: "500000500000", hidden: true, order: 4 }
    ]
  },
  {
    slug: "reverse-array",
    title: "Reverse an array",
    difficulty: "introductory",
    tags: ["arrays", "loops"],
    description: "Read n integers and print them in reverse order.",
    inputSpec: "The first line contains n (1 ≤ n ≤ 1000). The second line contains n integers separated by spaces.",
    outputSpec: "Print the n integers in reverse order, separated by single spaces.",
    constraints: "1 ≤ n ≤ 1000; each value fits in a 32-bit signed integer.",
    examples: [{ input: "3\n1 2 3\n", output: "3 2 1" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    int a[1000];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    // Print the values from the last index down to zero.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    int a[1000];
    for (int i = 0; i < n; ++i) scanf("%d", &a[i]);
    for (int i = n - 1; i >= 0; --i) {
        printf("%d", a[i]);
        if (i > 0) putchar(' ');
    }
    putchar('\n');
    return 0;
}
`,
    editorial: "Store the values in an array, then walk the indices backward. Avoiding a trailing space by printing the separator before every element except the last is a habit worth keeping, because many judges compare output strictly. Time is O(n) and extra space is O(n) for the array.",
    skillKeys: ["c.arrays", "c.loops"],
    expectedComplexity: "O(n) time, O(n) space",
    tests: [
      { input: "3\n1 2 3\n", expected: "3 2 1", hidden: false, order: 1 },
      { input: "1\n42\n", expected: "42", hidden: false, order: 2 },
      { input: "5\n-1 0 7 -3 2\n", expected: "2 -3 7 0 -1", hidden: true, order: 3 },
      { input: "4\n10 10 10 10\n", expected: "10 10 10 10", hidden: true, order: 4 }
    ]
  },
  {
    slug: "count-vowels",
    title: "Count vowels",
    difficulty: "introductory",
    tags: ["strings", "loops"],
    description: "Given one line of text, count how many vowel letters it contains. Both uppercase and lowercase vowels count, and spaces and punctuation are ignored.",
    inputSpec: "A single line of text of at most 500 characters.",
    outputSpec: "Print the number of vowels.",
    constraints: "The line contains at most 500 characters, including the trailing newline.",
    examples: [{ input: "Programming in C\n", output: "4" }],
    starterCode: c`#include <stdio.h>
#include <ctype.h>

int main(void) {
    char line[512];
    if (!fgets(line, sizeof line, stdin)) return 1;
    int vowels = 0;
    // Scan the line and count vowels.
    printf("%d\n", vowels);
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <ctype.h>

int main(void) {
    char line[512];
    if (!fgets(line, sizeof line, stdin)) return 1;
    int vowels = 0;
    for (int i = 0; line[i] != '\0'; ++i) {
        char ch = (char)tolower((unsigned char)line[i]);
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') ++vowels;
    }
    printf("%d\n", vowels);
    return 0;
}
`,
    editorial: "Read the whole line with fgets so embedded spaces survive. Convert each byte with tolower before comparing, which halves the number of cases. Cast to unsigned char before calling any ctype function: passing a negative char is undefined behavior. The scan is O(n) in the line length.",
    skillKeys: ["c.strings", "c.loops", "c.io"],
    expectedComplexity: "O(n) time, O(1) space",
    tests: [
      { input: "Programming in C\n", expected: "4", hidden: false, order: 1 },
      { input: "AEIOU aeiou\n", expected: "10", hidden: false, order: 2 },
      { input: "rhythm\n", expected: "0", hidden: true, order: 3 },
      { input: "The quick brown fox\n", expected: "5", hidden: true, order: 4 }
    ]
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "introductory",
    tags: ["loops", "math", "conditionals"],
    description: "Print the numbers from 1 to n. Multiples of 3 print Fizz, multiples of 5 print Buzz, and multiples of both print FizzBuzz.",
    inputSpec: "A single integer n (1 ≤ n ≤ 1000).",
    outputSpec: "n lines following the FizzBuzz rule.",
    constraints: "1 ≤ n ≤ 1000.",
    examples: [{ input: "5\n", output: "1\n2\nFizz\n4\nBuzz" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Print the sequence.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    for (int i = 1; i <= n; ++i) {
        if (i % 15 == 0) puts("FizzBuzz");
        else if (i % 3 == 0) puts("Fizz");
        else if (i % 5 == 0) puts("Buzz");
        else printf("%d\n", i);
    }
    return 0;
}
`,
    editorial: "Test the most specific condition first: a number divisible by both 3 and 5 is divisible by 15, so checking i % 15 avoids printing Fizz or Buzz alone. Testing divisibility by 3 and then 5 without the combined case is the classic FizzBuzz bug. O(n) time.",
    skillKeys: ["c.loops", "c.conditionals", "c.operators"],
    expectedComplexity: "O(n) time, O(1) space",
    tests: [
      { input: "5\n", expected: "1\n2\nFizz\n4\nBuzz", hidden: false, order: 1 },
      { input: "1\n", expected: "1", hidden: false, order: 2 },
      { input: "15\n", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", hidden: true, order: 3 },
      { input: "3\n", expected: "1\n2\nFizz", hidden: true, order: 4 }
    ]
  },
  {
    slug: "gcd-lcm",
    title: "GCD and LCM",
    difficulty: "beginner",
    tags: ["math", "number-theory"],
    description: "Given two positive integers, print their greatest common divisor and least common multiple.",
    inputSpec: "Two integers a and b on one line (1 ≤ a, b ≤ 1,000,000,000).",
    outputSpec: "Print the GCD and the LCM separated by a single space.",
    constraints: "1 ≤ a, b ≤ 1e9. The LCM can exceed a 32-bit signed int, so compute it in 64 bits.",
    examples: [{ input: "12 18\n", output: "6 36" }],
    starterCode: c`#include <stdio.h>

static long long gcd(long long a, long long b) {
    // Euclid's algorithm.
    return 0;
}

int main(void) {
    long long a, b;
    if (scanf("%lld %lld", &a, &b) != 2) return 1;
    // Print gcd and lcm.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

static long long gcd(long long a, long long b) {
    while (b != 0) {
        long long remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}

int main(void) {
    long long a, b;
    if (scanf("%lld %lld", &a, &b) != 2) return 1;
    long long g = gcd(a, b);
    printf("%lld %lld\n", g, a / g * b);
    return 0;
}
`,
    editorial: "Euclid's algorithm replaces (a, b) with (b, a % b) until b is zero; the remaining value is the GCD, and it runs in O(log min(a, b)) steps. The LCM is a / g * b, computed by dividing before multiplying so the intermediate value stays as small as possible, and in 64-bit arithmetic because a * b can reach 1e18.",
    skillKeys: ["algo.number_theory", "c.functions", "c.loops"],
    expectedComplexity: "O(log min(a, b)) time, O(1) space",
    tests: [
      { input: "12 18\n", expected: "6 36", hidden: false, order: 1 },
      { input: "7 13\n", expected: "1 91", hidden: false, order: 2 },
      { input: "1000000000 1000000000\n", expected: "1000000000 1000000000", hidden: true, order: 3 },
      { input: "999999937 999999929\n", expected: "1 999999866000004473", hidden: true, order: 4 }
    ]
  },
  {
    slug: "palindrome-string",
    title: "Palindrome check",
    difficulty: "beginner",
    tags: ["strings", "two-pointers"],
    description: "Determine whether a word reads the same forward and backward.",
    inputSpec: "A single word of 1 to 200 printable, non-space ASCII characters.",
    outputSpec: "Print yes if the word is a palindrome and no otherwise.",
    constraints: "1 ≤ length ≤ 200. Comparison is case sensitive.",
    examples: [{ input: "level\n", output: "yes" }, { input: "Level\n", output: "no" }],
    starterCode: c`#include <stdio.h>
#include <string.h>

int main(void) {
    char word[256];
    if (scanf("%255s", word) != 1) return 1;
    // Compare characters from both ends.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <string.h>

int main(void) {
    char word[256];
    if (scanf("%255s", word) != 1) return 1;
    int left = 0;
    int right = (int)strlen(word) - 1;
    int palindrome = 1;
    while (left < right) {
        if (word[left] != word[right]) {
            palindrome = 0;
            break;
        }
        ++left;
        --right;
    }
    puts(palindrome ? "yes" : "no");
    return 0;
}
`,
    editorial: "Two indices start at the ends and walk inward, comparing one pair per step. The loop stops when they meet in the middle, which is O(n/2) comparisons and needs no extra storage. The %255s width limit keeps scanf from overflowing a 256-byte buffer. Reversing into a second buffer also works but costs O(n) space for no benefit.",
    skillKeys: ["c.strings", "cp.two_pointers", "algo.strings"],
    expectedComplexity: "O(n) time, O(1) space",
    tests: [
      { input: "level\n", expected: "yes", hidden: false, order: 1 },
      { input: "Level\n", expected: "no", hidden: false, order: 2 },
      { input: "a\n", expected: "yes", hidden: true, order: 3 },
      { input: "abcdefghijjihgfedcba\n", expected: "yes", hidden: true, order: 4 },
      { input: "almost\n", expected: "no", hidden: true, order: 5 }
    ]
  },
  {
    slug: "factorial-20",
    title: "Factorial to twenty",
    difficulty: "beginner",
    tags: ["math", "loops"],
    description: "Compute n! for n up to 20. The result does not fit in a 32-bit int, so accumulate in 64 bits.",
    inputSpec: "A single integer n (0 ≤ n ≤ 20).",
    outputSpec: "Print n! on one line.",
    constraints: "0 ≤ n ≤ 20. 20! equals 2432902008176640000, which fits in a 64-bit signed integer.",
    examples: [{ input: "5\n", output: "120" }, { input: "0\n", output: "1" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Compute n! in a 64-bit accumulator.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    long long result = 1;
    for (int i = 2; i <= n; ++i) result *= i;
    printf("%lld\n", result);
    return 0;
}
`,
    editorial: "Multiply the running product by each integer from 2 through n. Starting at the multiplicative identity handles n = 0 and n = 1 without a special case. The accumulator must be long long: 13! already overflows a 32-bit int, and 20! needs 63 bits. O(n) time.",
    skillKeys: ["c.loops", "c.variables", "algo.number_theory"],
    expectedComplexity: "O(n) time, O(1) space",
    tests: [
      { input: "5\n", expected: "120", hidden: false, order: 1 },
      { input: "0\n", expected: "1", hidden: false, order: 2 },
      { input: "13\n", expected: "6227020800", hidden: true, order: 3 },
      { input: "20\n", expected: "2432902008176640000", hidden: true, order: 4 }
    ]
  },
  {
    slug: "fibonacci-memo",
    title: "Fibonacci with a cache",
    difficulty: "beginner",
    tags: ["recursion", "math", "dynamic-programming"],
    description: "Print the n-th Fibonacci number with F(0) = 0 and F(1) = 1. The naive double recursion is too slow for the larger inputs.",
    inputSpec: "A single integer n (0 ≤ n ≤ 90).",
    outputSpec: "Print F(n).",
    constraints: "0 ≤ n ≤ 90. F(90) equals 2880067194370816120, which fits in a 64-bit signed integer.",
    examples: [{ input: "10\n", output: "55" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Compute F(n) in O(n) time with 64-bit values.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    long long previous = 0, current = 1;
    for (int i = 0; i < n; ++i) {
        long long next = previous + current;
        previous = current;
        current = next;
    }
    printf("%lld\n", previous);
    return 0;
}
`,
    editorial: "The recurrence F(n) = F(n-1) + F(n-2) needs only the last two values, so a rolling pair replaces the cache and reduces the extra space to O(1). The naive recursive definition has overlapping subproblems and costs O(2^n). Both the answer and every intermediate must be 64-bit: F(47) already exceeds a 32-bit signed int.",
    skillKeys: ["c.recursion", "algo.dp", "algo.complexity"],
    expectedComplexity: "O(n) time, O(1) space",
    tests: [
      { input: "10\n", expected: "55", hidden: false, order: 1 },
      { input: "0\n", expected: "0", hidden: false, order: 2 },
      { input: "1\n", expected: "1", hidden: true, order: 3 },
      { input: "50\n", expected: "12586269025", hidden: true, order: 4 },
      { input: "90\n", expected: "2880067194370816120", hidden: true, order: 5 }
    ]
  },
  {
    slug: "two-sum-sorted",
    title: "Two sum on sorted data",
    difficulty: "intermediate",
    tags: ["two-pointers", "arrays", "searching"],
    description: "Given an ascending array and a target, find two indices whose values add up to the target. Exactly one answer exists.",
    inputSpec: "The first line has n (2 ≤ n ≤ 200000). The second line has n ascending integers. The third line has the target value.",
    outputSpec: "Print the two zero-based indices in ascending order separated by a space.",
    constraints: "2 ≤ n ≤ 200000; values and the target fit in a 64-bit signed integer. A unique pair exists.",
    examples: [{ input: "5\n1 3 5 7 9\n10\n", output: "0 4" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 2 || n > 200000) return 1;
    // Allocate n values, read them, then sweep with two pointers.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 2 || n > 200000) return 1;
    long long *a = malloc((size_t)n * sizeof *a);
    if (a == NULL) return 1;
    for (int i = 0; i < n; ++i) {
        if (scanf("%lld", &a[i]) != 1) { free(a); return 1; }
    }
    long long target;
    if (scanf("%lld", &target) != 1) { free(a); return 1; }
    int left = 0, right = n - 1;
    while (left < right) {
        long long sum = a[left] + a[right];
        if (sum == target) break;
        if (sum < target) ++left;
        else --right;
    }
    printf("%d %d\n", left, right);
    free(a);
    return 0;
}
`,
    editorial: "Because the array is sorted, each comparison eliminates one candidate. If a[left] + a[right] is too small, no pair using left can work, so advance left; if it is too large, retreat right. The sweep is O(n) after reading, which beats the O(n^2) double loop and the O(n log n) per-element binary search. A hash table would also be O(n) but needs more memory and does not exploit the given ordering.",
    skillKeys: ["cp.two_pointers", "c.arrays", "algo.complexity"],
    expectedComplexity: "O(n) time, O(n) space",
    tests: [
      { input: "5\n1 3 5 7 9\n10\n", expected: "0 4", hidden: false, order: 1 },
      { input: "2\n4 4\n8\n", expected: "0 1", hidden: false, order: 2 },
      { input: "6\n-5 -1 0 2 3 8\n3\n", expected: "0 5", hidden: true, order: 3 },
      { input: "4\n1 2 3 4\n7\n", expected: "2 3", hidden: true, order: 4 }
    ]
  },
  {
    slug: "prefix-sums",
    title: "Range sum queries",
    difficulty: "intermediate",
    tags: ["prefix-sums", "arrays"],
    description: "Answer q queries, each asking for the sum of a subarray given by one-based inclusive indices.",
    inputSpec: "The first line has n and q (1 ≤ n, q ≤ 200000). The second line has n integers. Each of the next q lines has l and r (1 ≤ l ≤ r ≤ n).",
    outputSpec: "For each query print one line with the sum of elements l through r.",
    constraints: "1 ≤ n, q ≤ 200000; values fit in a 32-bit signed integer, but sums need 64 bits.",
    examples: [{ input: "5 3\n1 2 3 4 5\n1 5\n2 3\n4 4\n", output: "15\n5\n4" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int n, q;
    if (scanf("%d %d", &n, &q) != 2) return 1;
    // Build prefix sums, then answer each query in O(1).
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, q;
    if (scanf("%d %d", &n, &q) != 2 || n < 1 || q < 1 || n > 200000 || q > 200000) return 1;
    long long *prefix = calloc((size_t)n + 1, sizeof *prefix);
    if (prefix == NULL) return 1;
    for (int i = 1; i <= n; ++i) {
        long long value;
        if (scanf("%lld", &value) != 1) { free(prefix); return 1; }
        prefix[i] = prefix[i - 1] + value;
    }
    for (int question = 0; question < q; ++question) {
        int l, r;
        if (scanf("%d %d", &l, &r) != 2) { free(prefix); return 1; }
        printf("%lld\n", prefix[r] - prefix[l - 1]);
    }
    free(prefix);
    return 0;
}
`,
    editorial: "With a prefix array P where P[i] is the sum of the first i elements, the sum of l through r is P[r] - P[l - 1]. Building P costs O(n) and each query is O(1), so the whole program is O(n + q) instead of O(nq). One-based indexing removes the special case at l = 1: P[0] is simply zero.",
    skillKeys: ["cp.prefix_sums", "c.arrays", "algo.complexity"],
    expectedComplexity: "O(n + q) time, O(n) space",
    tests: [
      { input: "5 3\n1 2 3 4 5\n1 5\n2 3\n4 4\n", expected: "15\n5\n4", hidden: false, order: 1 },
      { input: "1 1\n7\n1 1\n", expected: "7", hidden: false, order: 2 },
      { input: "3 2\n-5 10 -2\n1 3\n2 2\n", expected: "3\n10", hidden: true, order: 3 },
      { input: "4 1\n1000000000 1000000000 1000000000 1000000000\n1 4\n", expected: "4000000000", hidden: true, order: 4 }
    ]
  },
  {
    slug: "binary-search-frequency",
    title: "Count occurrences",
    difficulty: "intermediate",
    tags: ["binary-search", "arrays"],
    description: "A sorted array may contain repeated values. Count how many times a target value occurs, or print 0 if it is absent.",
    inputSpec: "The first line has n (1 ≤ n ≤ 200000). The second line has n nondecreasing integers. The third line has the target.",
    outputSpec: "Print the number of occurrences of the target.",
    constraints: "1 ≤ n ≤ 200000; values fit in a 64-bit signed integer.",
    examples: [{ input: "7\n1 2 2 2 5 5 9\n2\n", output: "3" }],
    starterCode: c`#include <stdio.h>

static int lower_bound(const long long *a, int n, long long target) {
    // First index whose value is >= target, or n if none.
    return 0;
}

static int upper_bound(const long long *a, int n, long long target) {
    // First index whose value is > target, or n if none.
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Read the array, then print upper - lower.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <stdlib.h>

static int lower_bound(const long long *a, int n, long long target) {
    int low = 0, high = n;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (a[mid] < target) low = mid + 1;
        else high = mid;
    }
    return low;
}

static int upper_bound(const long long *a, int n, long long target) {
    int low = 0, high = n;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (a[mid] <= target) low = mid + 1;
        else high = mid;
    }
    return low;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 200000) return 1;
    long long *a = malloc((size_t)n * sizeof *a);
    if (a == NULL) return 1;
    for (int i = 0; i < n; ++i) {
        if (scanf("%lld", &a[i]) != 1) { free(a); return 1; }
    }
    long long target;
    if (scanf("%lld", &target) != 1) { free(a); return 1; }
    printf("%d\n", upper_bound(a, n, target) - lower_bound(a, n, target));
    free(a);
    return 0;
}
`,
    editorial: "Count each value by finding the boundaries of its run rather than by scanning. lower_bound returns the first index with a[i] >= target and upper_bound the first index with a[i] > target, so their difference is the number of occurrences. Both loops use a half-open range [low, high) and always shrink it, which avoids the off-by-one traps of a closed-range search. Total cost is O(log n) after reading.",
    skillKeys: ["algo.binary_search", "c.searching", "c.arrays"],
    expectedComplexity: "O(n + log n) time, O(n) space",
    tests: [
      { input: "7\n1 2 2 2 5 5 9\n2\n", expected: "3", hidden: false, order: 1 },
      { input: "7\n1 2 2 2 5 5 9\n4\n", expected: "0", hidden: false, order: 2 },
      { input: "1\n42\n42\n", expected: "1", hidden: true, order: 3 },
      { input: "6\n5 5 5 5 5 5\n5\n", expected: "6", hidden: true, order: 4 },
      { input: "7\n1 2 2 2 5 5 9\n9\n", expected: "1", hidden: true, order: 5 }
    ]
  },
  {
    slug: "sorting-pairs",
    title: "Sort records by score",
    difficulty: "intermediate",
    tags: ["sorting", "structs", "strings"],
    description: "Given a list of names and scores, order them by score descending and break ties by name ascending.",
    inputSpec: "The first line has n (1 ≤ n ≤ 20000). Each of the next n lines has a name without spaces (at most 31 characters) and an integer score.",
    outputSpec: "Print the n records in the required order, each as name and score separated by a single space.",
    constraints: "1 ≤ n ≤ 20000; names have at most 31 characters; scores fit in a 32-bit signed integer.",
    examples: [{ input: "3\nada 90\nlinus 90\ngrace 85\n", output: "ada 90\nlinus 90\ngrace 85" }],
    starterCode: c`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[32];
    int score;
} Record;

static int compare_record(const void *left, const void *right) {
    // Higher score first, then name ascending.
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Read the records, sort, then print.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[32];
    int score;
} Record;

static int compare_record(const void *left, const void *right) {
    const Record *a = left;
    const Record *b = right;
    if (a->score != b->score) return (a->score < b->score) - (a->score > b->score);
    return strcmp(a->name, b->name);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 20000) return 1;
    Record *records = malloc((size_t)n * sizeof *records);
    if (records == NULL) return 1;
    for (int i = 0; i < n; ++i) {
        if (scanf("%31s %d", records[i].name, &records[i].score) != 2) {
            free(records);
            return 1;
        }
    }
    qsort(records, (size_t)n, sizeof *records, compare_record);
    for (int i = 0; i < n; ++i) printf("%s %d\n", records[i].name, records[i].score);
    free(records);
    return 0;
}
`,
    editorial: "Encode the whole ordering in the comparator: compare scores first and invert the result for descending order, then fall back to strcmp for the tiebreak. Return (a < b) - (a > b) rather than a difference, because subtraction can overflow. qsort is not stable, so the explicit name tiebreak is what actually makes ties deterministic. Passing sizeof *records keeps the element size and the pointer type in sync. O(n log n) time.",
    skillKeys: ["c.sorting", "c.pointers.function", "c.structs"],
    expectedComplexity: "O(n log n) time, O(n) space",
    tests: [
      { input: "3\nada 90\nlinus 90\ngrace 85\n", expected: "ada 90\nlinus 90\ngrace 85", hidden: false, order: 1 },
      { input: "1\nsolo 7\n", expected: "solo 7", hidden: false, order: 2 },
      { input: "4\nbob 10\nalice 10\ncarol 20\ndave 5\n", expected: "carol 20\nalice 10\nbob 10\ndave 5", hidden: true, order: 3 },
      { input: "3\na -1\nb -5\nc -1\n", expected: "a -1\nc -1\nb -5", hidden: true, order: 4 }
    ]
  },
  {
    slug: "sieve-primes",
    title: "Count primes up to n",
    difficulty: "intermediate",
    tags: ["math", "number-theory", "arrays"],
    description: "Count how many primes are less than or equal to n. Trial division per number is too slow at the upper limit.",
    inputSpec: "A single integer n (0 ≤ n ≤ 2,000,000).",
    outputSpec: "Print the number of primes at most n.",
    constraints: "0 ≤ n ≤ 2,000,000.",
    examples: [{ input: "10\n", output: "4" }],
    starterCode: c`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Sieve of Eratosthenes.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 2000000) return 1;
    if (n < 2) {
        puts("0");
        return 0;
    }
    unsigned char *composite = calloc((size_t)n + 1, 1);
    if (composite == NULL) return 1;
    int count = 0;
    for (int i = 2; i <= n; ++i) {
        if (composite[i]) continue;
        ++count;
        if ((long long)i * i <= n) {
            for (int multiple = i * i; multiple <= n; multiple += i) composite[multiple] = 1;
        }
    }
    printf("%d\n", count);
    free(composite);
    return 0;
}
`,
    editorial: "The sieve marks multiples of each prime starting from i*i, because every smaller multiple was already marked by a smaller prime. Each composite is marked once per distinct prime factor, giving O(n log log n) total work and O(n) bytes of storage, which is why the flags are unsigned char rather than int. Guard i * i against overflow with a 64-bit comparison before entering the inner loop.",
    skillKeys: ["algo.number_theory", "c.arrays", "c.memory.malloc"],
    expectedComplexity: "O(n log log n) time, O(n) space",
    tests: [
      { input: "10\n", expected: "4", hidden: false, order: 1 },
      { input: "2\n", expected: "1", hidden: false, order: 2 },
      { input: "1\n", expected: "0", hidden: true, order: 3 },
      { input: "100\n", expected: "25", hidden: true, order: 4 },
      { input: "1000000\n", expected: "78498", hidden: true, order: 5 }
    ]
  },
  {
    slug: "matrix-multiply",
    title: "Matrix multiplication",
    difficulty: "advanced",
    tags: ["arrays", "math"],
    description: "Multiply an r1 by c1 matrix by a c1 by c2 matrix and print the product.",
    inputSpec: "The first line has r1, c1, r2, c2. The next r1 × c1 integers describe the first matrix, followed by r2 × c2 integers for the second.",
    outputSpec: "Print r1 lines with c2 integers each, separated by single spaces.",
    constraints: "1 ≤ r1, c2 ≤ 100; 1 ≤ c1, r2 ≤ 100; c1 equals r2; products can exceed a 32-bit signed int.",
    examples: [{ input: "2 3 3 2\n1 2 3\n4 5 6\n7 8\n9 10\n11 12\n", output: "58 64\n139 154" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int r1, c1, r2, c2;
    if (scanf("%d %d %d %d", &r1, &c1, &r2, &c2) != 4) return 1;
    // Read both matrices, multiply, then print the result.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int r1, c1, r2, c2;
    if (scanf("%d %d %d %d", &r1, &c1, &r2, &c2) != 4) return 1;
    if (r1 < 1 || c1 < 1 || r2 < 1 || c2 < 1) return 1;
    if (r1 > 100 || c1 > 100 || r2 > 100 || c2 > 100 || c1 != r2) return 1;
    static long long a[100][100], b[100][100], product[100][100];
    for (int i = 0; i < r1; ++i)
        for (int j = 0; j < c1; ++j)
            scanf("%lld", &a[i][j]);
    for (int i = 0; i < r2; ++i)
        for (int j = 0; j < c2; ++j)
            scanf("%lld", &b[i][j]);
    for (int i = 0; i < r1; ++i) {
        for (int j = 0; j < c2; ++j) {
            long long sum = 0;
            for (int k = 0; k < c1; ++k) sum += a[i][k] * b[k][j];
            product[i][j] = sum;
        }
    }
    for (int i = 0; i < r1; ++i) {
        for (int j = 0; j < c2; ++j) {
            if (j > 0) putchar(' ');
            printf("%lld", product[i][j]);
        }
        putchar('\n');
    }
    return 0;
}
`,
    editorial: "The product entry (i, j) is the dot product of row i of the first matrix and column j of the second, which requires c1 multiplications. Three nested loops give O(r1 · c1 · c2). Use 64-bit entries because a 100-term sum of 32-bit products overflows a 32-bit int. The arrays are static here to keep them off the stack at maximal dimensions.",
    skillKeys: ["c.arrays", "algo.complexity", "c.loops"],
    expectedComplexity: "O(r1 · c1 · c2) time",
    tests: [
      { input: "2 3 3 2\n1 2 3\n4 5 6\n7 8\n9 10\n11 12\n", expected: "58 64\n139 154", hidden: false, order: 1 },
      { input: "1 1 1 1\n3\n4\n", expected: "12", hidden: false, order: 2 },
      { input: "2 2 2 2\n1 0\n0 1\n5 6\n7 8\n", expected: "5 6\n7 8", hidden: true, order: 3 },
      { input: "1 2 2 1\n100000 100000\n100000\n100000\n", expected: "20000000000", hidden: true, order: 4 }
    ]
  },
  {
    slug: "max-subarray-sum",
    title: "Maximum subarray sum",
    difficulty: "advanced",
    tags: ["dynamic-programming", "arrays", "greedy"],
    description: "Find the largest sum of any nonempty contiguous subarray.",
    inputSpec: "The first line has n (1 ≤ n ≤ 200000). The second line has n integers, each between -10^9 and 10^9.",
    outputSpec: "Print the maximum subarray sum.",
    constraints: "1 ≤ n ≤ 200000; |a[i]| ≤ 1e9. Sums can exceed a 32-bit signed int.",
    examples: [{ input: "8\n-2 1 -3 4 -1 2 1 -5\n", output: "6" }],
    starterCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Kadane's algorithm in O(n).
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 200000) return 1;
    long long best = 0, current = 0;
    int is_first = 1;
    for (int i = 0; i < n; ++i) {
        long long value;
        if (scanf("%lld", &value) != 1) return 1;
        if (is_first) {
            current = value;
            best = value;
            is_first = 0;
            continue;
        }
        current = current + value > value ? current + value : value;
        if (current > best) best = current;
    }
    printf("%lld\n", best);
    return 0;
}
`,
    editorial: "Kadane's algorithm keeps the best sum ending at the current position: either extend the previous run or start fresh at this element, whichever is larger. The answer is the maximum seen over all positions. Initializing from the first element rather than zero handles all-negative inputs, where the correct answer is the least negative single element. One pass gives O(n) time and O(1) extra space.",
    skillKeys: ["algo.dp", "c.arrays", "algo.complexity"],
    expectedComplexity: "O(n) time, O(1) space",
    tests: [
      { input: "8\n-2 1 -3 4 -1 2 1 -5\n", expected: "6", hidden: false, order: 1 },
      { input: "1\n-7\n", expected: "-7", hidden: false, order: 2 },
      { input: "5\n-3 -1 -9 -2 -4\n", expected: "-1", hidden: true, order: 3 },
      { input: "4\n1 2 3 4\n", expected: "10", hidden: true, order: 4 },
      { input: "3\n1000000000 1000000000 1000000000\n", expected: "3000000000", hidden: true, order: 5 }
    ]
  },
  {
    slug: "word-frequency",
    title: "Most frequent word",
    difficulty: "advanced",
    tags: ["strings", "sorting", "hash-table"],
    description: "Given n lowercase words, print how many distinct words there are and the most frequent one. Ties are broken by the lexicographically smallest word.",
    inputSpec: "The first line has n (1 ≤ n ≤ 100000). The following lines contain n lowercase words of at most 31 letters, separated by whitespace.",
    outputSpec: "Print the number of distinct words and the most frequent word, separated by a single space.",
    constraints: "1 ≤ n ≤ 100000; every word consists of lowercase letters only and has at most 31 characters.",
    examples: [{ input: "5\nthe cat the dog the\n", output: "3 the" }],
    starterCode: c`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char word[32];
    int count;
} Entry;

static int compare_entry(const void *left, const void *right) {
    // Most frequent first, then lexicographically smallest.
    return 0;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    // Sort the words, tally runs, then report.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char word[32];
    int count;
} Entry;

static int compare_entry(const void *left, const void *right) {
    const Entry *a = left;
    const Entry *b = right;
    if (a->count != b->count) return (a->count < b->count) - (a->count > b->count);
    return strcmp(a->word, b->word);
}

static int compare_word(const void *left, const void *right) {
    return strcmp((const char *)left, (const char *)right);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 100000) return 1;
    char (*words)[32] = malloc((size_t)n * sizeof *words);
    if (words == NULL) return 1;
    for (int i = 0; i < n; ++i) {
        if (scanf("%31s", words[i]) != 1) { free(words); return 1; }
    }
    qsort(words, (size_t)n, sizeof *words, compare_word);

    Entry *entries = malloc((size_t)n * sizeof *entries);
    if (entries == NULL) { free(words); return 1; }
    int distinct = 0;
    for (int i = 0; i < n; ++i) {
        if (i == 0 || strcmp(words[i], words[i - 1]) != 0) {
            snprintf(entries[distinct].word, sizeof entries[distinct].word, "%s", words[i]);
            entries[distinct].count = 1;
            ++distinct;
        } else {
            ++entries[distinct - 1].count;
        }
    }
    qsort(entries, (size_t)distinct, sizeof *entries, compare_entry);
    printf("%d %s\n", distinct, entries[0].word);
    free(entries);
    free(words);
    return 0;
}
`,
    editorial: "Sorting the words groups equal strings next to each other, so one linear pass tallies each distinct word into a compact table. A second sort with a comparator that orders by count descending and then by word ascending puts the answer first, and the tiebreak is explicit rather than dependent on sort stability. Sorting dominates at O(n log n) with O(n) extra space. A hash table would give expected O(n) but needs your own collision handling in C.",
    skillKeys: ["c.strings", "c.sorting", "algo.strings", "c.memory.malloc"],
    expectedComplexity: "O(n log n) time, O(n) space",
    tests: [
      { input: "5\nthe cat the dog the\n", expected: "3 the", hidden: false, order: 1 },
      { input: "1\nsolo\n", expected: "1 solo", hidden: false, order: 2 },
      { input: "4\nb a b a\n", expected: "2 a", hidden: true, order: 3 },
      { input: "6\nzebra apple apple zebra mango mango\n", expected: "3 apple", hidden: true, order: 4 }
    ]
  },
  {
    slug: "balanced-brackets",
    title: "Balanced brackets",
    difficulty: "advanced",
    tags: ["strings", "stack", "data-structures"],
    description: "Decide whether every bracket in a string is correctly matched and nested. The string may contain round, square, and curly brackets and other letters.",
    inputSpec: "A single line of at most 100000 characters containing only printable, non-space ASCII characters.",
    outputSpec: "Print yes if the brackets are balanced and no otherwise.",
    constraints: "1 ≤ length ≤ 100000.",
    examples: [
      { input: "a(b[c]{d})e\n", output: "yes" },
      { input: "(]\n", output: "no" }
    ],
    starterCode: c`#include <stdio.h>
#include <string.h>

int main(void) {
    static char line[100002];
    if (!fgets(line, sizeof line, stdin)) return 1;
    // Use an explicit stack of opening brackets.
    return 0;
}
`,
    referenceCode: c`#include <stdio.h>
#include <string.h>

int main(void) {
    static char line[100002];
    static char stack[100002];
    if (!fgets(line, sizeof line, stdin)) return 1;
    int depth = 0, balanced = 1;
    for (int i = 0; line[i] != '\0' && line[i] != '\n'; ++i) {
        char ch = line[i];
        if (ch == '(' || ch == '[' || ch == '{') {
            stack[depth++] = ch;
        } else if (ch == ')' || ch == ']' || ch == '}') {
            char expected = ch == ')' ? '(' : ch == ']' ? '[' : '{';
            if (depth == 0 || stack[depth - 1] != expected) { balanced = 0; break; }
            --depth;
        }
    }
    if (depth != 0) balanced = 0;
    puts(balanced ? "yes" : "no");
    return 0;
}
`,
    editorial: "Bracket matching is the textbook stack problem: push every opening bracket and pop when a closing bracket arrives, checking that the popped opener matches the expected type. A closing bracket with an empty stack, a mismatched pair, or leftover openers at the end all mean the string is unbalanced. One pass over the string gives O(n) time and O(n) worst-case stack space.",
    skillKeys: ["ds.stack_queue", "c.strings", "algo.strings"],
    expectedComplexity: "O(n) time, O(n) space",
    tests: [
      { input: "a(b[c]{d})e\n", expected: "yes", hidden: false, order: 1 },
      { input: "(]\n", expected: "no", hidden: false, order: 2 },
      { input: "(((())))\n", expected: "yes", hidden: true, order: 3 },
      { input: "(()\n", expected: "no", hidden: true, order: 4 },
      { input: "hello\n", expected: "yes", hidden: true, order: 5 },
      { input: ")(\n", expected: "no", hidden: true, order: 6 }
    ]
  }
];

export type SeedClient = Awaited<ReturnType<typeof createSeedClient>>;

/**
 * Prisma is imported lazily so this module can be imported by content tests and
 * the offline verifier without a database or a CommonJS-incompatible client.
 */
async function createSeedClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required to seed CForge.");
  const [{ PrismaPg }, { PrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../src/generated/prisma/client")
  ]);
  return new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
}

/** Prisma's JSON-null sentinel, resolved on first use. */
async function jsonNull() {
  const { Prisma } = await import("../src/generated/prisma/client");
  return Prisma.JsonNull;
}

async function seedSkills(prisma: SeedClient) {
  for (const [key, name, world] of SKILLS) {
    await prisma.skill.upsert({
      where: { key },
      update: { name, world },
      create: { key, name, world }
    });
  }
}

async function seedAchievements(prisma: SeedClient) {
  for (const [key, name, description, icon] of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key },
      update: { name, description, icon },
      create: { key, name, description, icon }
    });
  }
}

async function seedReference(prisma: SeedClient) {
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

async function seedLessons(prisma: SeedClient) {
  const jsonNullValue = await jsonNull();
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
        quizOptions: step.quizOptions === undefined ? jsonNullValue : step.quizOptions,
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

async function seedProblems(prisma: SeedClient) {
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

export async function main() {
  const prisma = await createSeedClient();
  try {
    await seedSkills(prisma);
    await seedAchievements(prisma);
    await seedReference(prisma);
    await seedLessons(prisma);
    await seedProblems(prisma);
    console.log(
      `Seed complete: ${SKILLS.length} skills, ${ACHIEVEMENTS.length} achievements, ` +
      `${REFERENCE.length} reference entries, ${LESSONS.length} lessons, ${PROBLEMS.length} problems.`
    );
  } finally {
    await prisma.$disconnect();
  }
}
