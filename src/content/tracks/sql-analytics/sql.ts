import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "sql-joins",
    track: "sql-analytics",
    title: "SQL Joins",
    blurb: "The join types, and the two mistakes that produce wrong answers silently.",
    lesson: `Joins are where most wrong SQL answers come from, because the query runs fine and returns plausible numbers.

**The types.** *INNER* keeps only rows matching on both sides. *LEFT* keeps every row from the left table, filling NULLs where the right has no match. *RIGHT* is the mirror and is rarely used, since swapping the tables reads better. *FULL OUTER* keeps unmatched rows from both. *CROSS* produces every combination, which is occasionally what you want — generating a date spine, for instance — and otherwise a mistake.

**A self join** joins a table to itself: employees to their managers, or a row to the previous row before window functions existed.

**Mistake one: filtering a left-joined table in WHERE.** This is the single most common SQL bug in interviews.

\`FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.status = 'paid'\`

Users with no orders get NULL for \`o.status\`, and \`NULL = 'paid'\` is not true, so those rows are discarded — the LEFT JOIN has silently become an INNER JOIN. If the condition describes *which rows to join*, it belongs in ON. If it describes *which results to keep*, it belongs in WHERE.

**Mistake two: fan-out.** Joining one-to-many multiplies rows. Join orders to line items and each order appears once per item, so \`SUM(orders.total)\` now counts that total several times. The result looks like a plausible revenue figure and is wrong. Aggregate the many side first — in a CTE or subquery — then join the single row back.

**Anti-joins** find rows with no match: \`LEFT JOIN ... WHERE right.id IS NULL\`, or \`NOT EXISTS\`. Prefer \`NOT EXISTS\` over \`NOT IN\`, because \`NOT IN\` against a set containing a single NULL returns no rows at all — a trap that produces an empty result set with no error.`,
    resources: [
      {
        label: "PostgreSQL — Table joins",
        url: "https://www.postgresql.org/docs/current/queries-table-expressions.html",
      },
    ],
  },
  {
    id: "sql-aggregation",
    track: "sql-analytics",
    title: "Aggregation & NULLs",
    blurb: "GROUP BY, HAVING, and the ways NULL quietly changes your answer.",
    lesson: `**Logical execution order** explains most confusing SQL behaviour: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.

Because SELECT runs after WHERE, you cannot filter on a column alias in WHERE — the alias does not exist yet. You *can* use it in ORDER BY, which runs later. That one ordering answers a lot of "why doesn't this work".

**WHERE filters rows; HAVING filters groups.** WHERE runs before grouping and cannot see aggregates. HAVING runs after and can. "Customers who placed more than five orders" is \`HAVING COUNT(*) > 5\`; "orders placed this year" is WHERE. Putting a row condition in HAVING usually still works and is slower, because you grouped rows you were about to discard.

**COUNT(\\*) and \`COUNT(column)\` are different.** \`COUNT(*)\` counts rows. \`COUNT(column)\` counts non-NULL values in that column. \`COUNT(DISTINCT column)\` counts distinct non-NULL values. Reaching for the wrong one is how "how many users have a phone number" becomes "how many users".

**NULL is unknown, not zero and not empty.** \`NULL = NULL\` is not true — it is unknown — so comparisons need \`IS NULL\`. Aggregates skip NULLs, which means \`AVG(score)\` over ten rows with three NULLs divides by seven, not ten. Whether that is right depends entirely on whether a missing score means "no score" or "zero", and only you know.

**Aggregating with no rows returns NULL, not 0,** for SUM. \`COALESCE(SUM(x), 0)\` is usually what a report wants.

**GROUP BY groups by every non-aggregated column you select.** Most databases require them to be listed; the ones that do not will happily return an arbitrary row's value for the rest.`,
    resources: [
      {
        label: "PostgreSQL — Aggregate functions",
        url: "https://www.postgresql.org/docs/current/functions-aggregate.html",
      },
    ],
  },
  {
    id: "sql-window-functions",
    track: "sql-analytics",
    title: "Window Functions",
    blurb: "Ranking, running totals, and comparing a row to its neighbours.",
    lesson: `A window function computes across a set of rows related to the current row **without collapsing them**. That is the difference from GROUP BY: aggregation returns one row per group, a window function returns every row plus the computed value.

**PARTITION BY divides the rows into groups; ORDER BY orders within each.** \`AVG(salary) OVER (PARTITION BY department)\` puts each employee's departmental average on their own row, which GROUP BY cannot do without a join back.

**The three ranking functions differ only in ties,** and the distinction is asked constantly. Given scores 100, 90, 90, 80:

- \`ROW_NUMBER\` → 1, 2, 3, 4. Always distinct; tied rows get an arbitrary order.
- RANK → 1, 2, 2, 4. Ties share a rank and the next value skips.
- \`DENSE_RANK\` → 1, 2, 2, 3. Ties share a rank and nothing is skipped.

"Top 3 salaries per department" almost always means \`DENSE_RANK\`, because two people on the same salary should both count as third.

**LAG and LEAD** reach into the previous and next row — month-over-month change, time between a user's consecutive events, detecting gaps in a sequence. Before window functions this required a self join on n = n - 1, which is why older SQL looks the way it does.

**Running totals** come from a frame: \`SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\`.

**The frame default is a genuine trap.** With ORDER BY and no explicit frame, the default is \`RANGE UNBOUNDED PRECEDING AND CURRENT ROW\`, and RANGE includes *all peer rows with the same ORDER BY value*. With duplicate dates, every row on that date gets the same running total — the full day's sum. Specify ROWS when you want row-by-row.

**Window functions run after WHERE,** so you cannot filter on one directly. Wrap it in a CTE and filter outside.`,
    resources: [
      {
        label: "PostgreSQL — Window functions",
        url: "https://www.postgresql.org/docs/current/tutorial-window.html",
      },
    ],
  },
  {
    id: "sql-subqueries",
    track: "sql-analytics",
    title: "CTEs & Subqueries",
    blurb: "Structuring a query so a human can follow it.",
    lesson: `**Common table expressions** name intermediate results with WITH. Their main value is readability: a query built as four named steps is reviewable, and the same logic nested four subqueries deep is not. In an interview, a CTE chain also lets you narrate your reasoning step by step, which is most of what is being assessed.

**Recursive CTEs** walk hierarchies — an org chart, a category tree, a chain of referrals — with an anchor member and a recursive member that references the CTE itself.

**Correlated subqueries** reference the outer query and are evaluated per outer row, which is why they can be slow. Many are better expressed as a join or a window function. "Each employee earning more than their department average" is a correlated subquery in older SQL and one window function today.

**EXISTS, IN, and JOIN for existence checks.** EXISTS short-circuits on the first match and handles NULLs correctly. IN is fine over a small, NULL-free list. A JOIN will duplicate outer rows if the inner side matches more than once, so it is the wrong tool for "does a match exist" unless you deduplicate.

**\`NOT IN\` with NULLs is the classic trap.** If the subquery returns any NULL, \`NOT IN\` yields no rows — because "is this value not equal to NULL" is unknown, never true. \`NOT EXISTS\` behaves the way you meant.

**Prefer a CTE to a repeated subquery.** Writing the same subquery twice invites them to drift apart when someone edits one.

**Watch out for CTE materialisation.** Some engines optimise across the boundary and some materialise each CTE, so a CTE referenced three times may be computed three times — or once and reused. If a query is unexpectedly slow, that boundary is worth checking.`,
    resources: [
      {
        label: "PostgreSQL — WITH queries",
        url: "https://www.postgresql.org/docs/current/queries-with.html",
      },
    ],
  },
  {
    id: "sql-performance",
    track: "sql-analytics",
    title: "Query Performance",
    blurb: "Why a query is slow, and the small rewrites that fix it.",
    lesson: `**Read the plan before changing anything.** \`EXPLAIN\` shows what the database intends to do; \`EXPLAIN ANALYZE\` runs it and shows what actually happened, including where the row estimates were wrong. Guessing at optimisations without a plan is how people add indexes that go unused.

**Sargability** is the property that lets an index be used. Wrapping an indexed column in a function destroys it: \`WHERE YEAR(created_at) = 2026\` must compute YEAR() for every row, so it scans. WHERE \`created_at >= '2026-01-01' AND created_at < '2027-01-01'\` expresses the same thing as a range the index can seek. The same applies to leading wildcards — \`LIKE '%term'\` cannot use a B-tree, because there is no prefix to seek on.

**Leftmost prefix.** A composite index on (a, b) serves queries filtering on a, or on a and b — but not b alone, because the index is sorted by a first. Column order in a composite index is a design decision, not a formality.

**Covering indexes** include every column the query needs, so the engine answers from the index without touching the table. Often a large win on wide tables, paid for in index size and write cost.

**SELECT \\* is not free.** It transfers columns you do not use, prevents index-only scans, and breaks silently when the schema changes.

**Watch for implicit conversions.** Comparing a string column to a number, or joining columns with different types or collations, can quietly disable index use — the plan will show a scan where you expected a seek.

**OFFSET gets slower the deeper you go,** because the engine still walks and discards every skipped row. Keyset pagination — "where id > last_seen_id" — stays fast at any depth.

**Estimates matter.** If the plan expects 10 rows and gets 100,000, the join strategy it chose is probably wrong, and the fix is usually fresher statistics rather than a hint.`,
    resources: [
      {
        label: "Use The Index, Luke",
        url: "https://use-the-index-luke.com/",
      },
      {
        label: "PostgreSQL — Using EXPLAIN",
        url: "https://www.postgresql.org/docs/current/using-explain.html",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Joins ----------
  {
    id: "sq-join-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 3,
    context:
      "FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.status = 'paid'. Users with no orders have disappeared from the results.",
    prompt:
      "Why does filtering the right table in WHERE turn a LEFT JOIN into an inner join?",
    options: [
      {
        id: "a",
        text: "The WHERE clause discards the NULL rows, turning it into an inner join — move the condition into ON",
      },
      { id: "b", text: "LEFT JOIN requires the filtered table on the left" },
      { id: "c", text: "The join key is missing an index" },
      { id: "d", text: "status should be compared with IS rather than =" },
    ],
    answer: "a",
    explanation:
      "Unmatched users get NULL for o.status, and NULL = 'paid' is not true, so WHERE removes them. If the condition decides *which rows to join*, it belongs in ON. If it decides *which results to keep*, it belongs in WHERE. This is the most common SQL interview bug there is.",
    concepts: ["LEFT JOIN", "ON versus WHERE", "INNER JOIN"],
    tags: ["left-join", "where-vs-on"],
  },
  {
    id: "sq-join-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 4,
    context:
      "Orders are joined to line items, then SUM(orders.total) is computed. Revenue comes out several times too high.",
    prompt:
      "Why does summing an order total across a one-to-many join inflate revenue?",
    options: [
      {
        id: "a",
        text: "Fan-out — the one-to-many join repeats each order per line item, so its total is summed repeatedly",
      },
      { id: "b", text: "The totals column includes tax twice" },
      { id: "c", text: "SUM ignores NULLs and double-counts the rest" },
      { id: "d", text: "An inner join should have been a left join" },
    ],
    answer: "a",
    explanation:
      "An order with four line items appears four times, so its total is added four times. The dangerous part is that the number looks plausible. Aggregate the many side first in a CTE, then join one row back — or sum a column that belongs to the line items rather than the order.",
    concepts: ["Join fan-out", "Row multiplication", "Aggregate correctness"],
    tags: ["fan-out", "aggregation"],
  },
  {
    id: "sq-join-003",
    type: "matching",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 2,
    prompt: "Match each join type to what it returns.",
    pairs: [
      { left: "INNER JOIN", right: "Only rows matching on both sides" },
      { left: "LEFT JOIN", right: "All left rows, NULLs where the right has no match" },
      { left: "FULL OUTER JOIN", right: "All rows from both sides, matched where possible" },
      { left: "CROSS JOIN", right: "Every combination of rows from both tables" },
    ],
    explanation:
      "RIGHT JOIN is deliberately absent — it is the mirror of LEFT and is rarely used, because swapping the table order reads more clearly. CROSS JOIN is occasionally exactly right, such as generating a complete date spine to join sparse data onto.",
    concepts: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"],
    tags: ["join-types"],
  },
  {
    id: "sq-join-004",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 4,
    context:
      "You need customers who have never placed an order. A colleague writes WHERE customer_id NOT IN (SELECT customer_id FROM orders). It returns nothing, though such customers exist.",
    prompt: "Why does NOT IN with a subquery return no rows at all?",
    options: [
      {
        id: "a",
        text: "The subquery contains a NULL, and NOT IN against any NULL yields unknown for every row",
      },
      { id: "b", text: "NOT IN cannot be used with subqueries" },
      { id: "c", text: "The orders table needs an index on customer_id" },
      { id: "d", text: "NOT IN requires DISTINCT in the subquery" },
    ],
    answer: "a",
    explanation:
      "NOT IN expands to a chain of \"not equal\" comparisons, and comparing anything to NULL is unknown rather than true — so no row qualifies. It fails silently with an empty result and no error. NOT EXISTS handles NULLs correctly and is the safer default.",
    concepts: ["NOT IN", "NOT EXISTS", "Three-valued logic"],
    tags: ["not-in", "nulls", "anti-join"],
  },
  {
    id: "sq-join-005",
    type: "short",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 3,
    context:
      "An employees table has a manager_id column referencing another row in the same table. You want each employee alongside their manager's name.",
    prompt: "What kind of join is this? (Two words.)",
    answers: ["self join", "self-join", "selfjoin", "a self join"],
    typoTolerance: true,
    explanation:
      "A self join — the table joined to itself under two aliases. Use a LEFT JOIN if some employees have no manager, or the person at the top of the org chart vanishes from your results.",
    concepts: ["Self join", "Table alias"],
    tags: ["self-join"],
  },

  // ---------- Aggregation ----------
  {
    id: "sq-agg-001",
    type: "ordering",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 3,
    prompt: "Put the logical execution order of a SELECT statement in sequence.",
    items: ["FROM", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY", "LIMIT"],
    explanation:
      "This order explains most confusing SQL behaviour. Because SELECT runs after WHERE, a column alias defined in SELECT is not available in WHERE — but it is available in ORDER BY, which runs later. It also explains why WHERE cannot see aggregates and HAVING can.",
    concepts: ["Logical query processing order", "GROUP BY", "HAVING"],
    tags: ["execution-order"],
  },
  {
    id: "sq-agg-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 2,
    prompt: "What is the difference between WHERE and HAVING?",
    options: [
      {
        id: "a",
        text: "WHERE filters rows before grouping; HAVING filters groups after, and can see aggregates",
      },
      { id: "b", text: "They are interchangeable; HAVING is the newer syntax" },
      { id: "c", text: "WHERE works on numbers and HAVING on text" },
      { id: "d", text: "HAVING filters rows and WHERE filters columns" },
    ],
    answer: "a",
    explanation:
      "\"Orders placed this year\" is a row condition and belongs in WHERE. \"Customers with more than five orders\" is a group condition and needs HAVING. Putting a row condition in HAVING usually still returns the right answer, more slowly, because you grouped rows you were about to throw away.",
    concepts: ["WHERE clause", "HAVING clause", "Aggregate function"],
    tags: ["having", "where"],
  },
  {
    id: "sq-agg-003",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 3,
    context:
      "A table has 10 rows. The score column is NULL in 3 of them.",
    prompt: "What do COUNT(*), COUNT(score), and AVG(score) return?",
    options: [
      {
        id: "a",
        text: "10, 7, and the average of the 7 non-NULL scores",
      },
      { id: "b", text: "10, 10, and the average over all 10 rows treating NULL as 0" },
      { id: "c", text: "7, 7, and the average of 7 rows" },
      { id: "d", text: "10, 7, and NULL, because NULLs are present" },
    ],
    answer: "a",
    explanation:
      "COUNT(*) counts rows; COUNT(column) counts non-NULL values; aggregates skip NULLs entirely. So AVG divides by 7, not 10. Whether that is correct depends on whether a missing score means \"not recorded\" or \"scored zero\" — the database cannot know, so you must decide.",
    concepts: ["COUNT(*)", "NULL semantics", "AVG"],
    tags: ["nulls", "count"],
  },
  {
    id: "sq-agg-004",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 3,
    context:
      "A monthly revenue report shows blank instead of 0 for months with no sales.",
    prompt: "What is happening and what fixes it?",
    options: [
      {
        id: "a",
        text: "SUM over no rows returns NULL — wrap it in COALESCE to produce 0",
      },
      { id: "b", text: "SUM returns 0 and the report is formatting it wrongly" },
      { id: "c", text: "The GROUP BY is missing those months" },
      { id: "d", text: "The revenue column allows NULLs and should not" },
    ],
    answer: "a",
    explanation:
      "SUM of an empty set is NULL rather than zero, which is arguably correct — the sum of nothing is undefined — and almost never what a report wants. Note this only covers months that appear in the results; months with no rows at all need a date spine joined in.",
    concepts: ["COALESCE", "NULL semantics", "Aggregate function"],
    tags: ["nulls", "coalesce"],
  },
  {
    id: "sq-agg-005",
    type: "short",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 2,
    context:
      "You want to count how many different countries appear in a customers table, ignoring repeats.",
    prompt: "Which keyword goes inside COUNT()?",
    answers: ["distinct", "count distinct", "distinct country"],
    typoTolerance: true,
    explanation:
      "COUNT(DISTINCT country). Note it also ignores NULLs, so a country recorded as NULL is not counted as its own category — if \"unknown\" should be a bucket, you need to handle it explicitly.",
    concepts: ["COUNT DISTINCT", "Cardinality"],
    tags: ["distinct"],
  },

  // ---------- Window functions ----------
  {
    id: "sq-win-001",
    type: "matching",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 4,
    prompt:
      "Scores are 100, 90, 90, 80. Match each function to the ranks it produces.",
    pairs: [
      { left: "ROW_NUMBER()", right: "1, 2, 3, 4" },
      { left: "RANK()", right: "1, 2, 2, 4" },
      { left: "DENSE_RANK()", right: "1, 2, 2, 3" },
    ],
    explanation:
      "They differ only in how ties are handled. ROW_NUMBER forces distinct values and orders ties arbitrarily. RANK shares a rank then skips. DENSE_RANK shares and does not skip. \"Top 3 salaries per department\" nearly always means DENSE_RANK, since two people on the same salary should both count.",
    concepts: ["ROW_NUMBER", "RANK", "DENSE_RANK"],
    tags: ["ranking"],
  },
  {
    id: "sq-win-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 3,
    prompt:
      "What does a window function do that GROUP BY cannot?",
    options: [
      {
        id: "a",
        text: "Compute across related rows while still returning every individual row",
      },
      { id: "b", text: "Aggregate more than one column at a time" },
      { id: "c", text: "Filter rows based on an aggregate" },
      { id: "d", text: "Sort the result set" },
    ],
    answer: "a",
    explanation:
      "GROUP BY collapses each group to one row. A window function leaves the rows intact and adds the computed value alongside — so you can show every employee with their departmental average, which otherwise needs an aggregate subquery joined back.",
    concepts: ["Window function", "PARTITION BY", "GROUP BY"],
    tags: ["fundamentals"],
  },
  {
    id: "sq-win-003",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 4,
    context:
      "You need each user's time between consecutive logins.",
    prompt: "Which window function is the natural fit?",
    options: [
      {
        id: "a",
        text: "LAG over PARTITION BY user ORDER BY login time, to reach the previous row",
      },
      { id: "b", text: "ROW_NUMBER, then subtract the row numbers" },
      { id: "c", text: "RANK within each user" },
      { id: "d", text: "SUM with an unbounded preceding frame" },
    ],
    answer: "a",
    explanation:
      "LAG reaches back to the previous row within the partition, so subtracting gives the gap directly. Before window functions this needed a self join matching row n to row n-1, which is why so much older analytics SQL is written that way.",
    concepts: ["LAG", "LEAD", "Window frame"],
    tags: ["lag-lead"],
  },
  {
    id: "sq-win-004",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 5,
    context:
      "SUM(amount) OVER (ORDER BY order_date) is used for a running total. On days with several orders, every row on that day shows the same value — the whole day's total.",
    prompt:
      "Why does a running total with ORDER BY show the same value for tied rows?",
    options: [
      {
        id: "a",
        text: "The default frame is RANGE, which includes all peer rows sharing the ORDER BY value — use ROWS instead",
      },
      { id: "b", text: "Running totals require PARTITION BY to work correctly" },
      { id: "c", text: "SUM cannot be used as a window function" },
      { id: "d", text: "The dates need to be unique for ordering to work" },
    ],
    answer: "a",
    explanation:
      "With ORDER BY and no explicit frame, the default is RANGE UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats all rows with the same ORDER BY value as peers included together. Specifying ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW gives the row-by-row accumulation people expect.",
    concepts: ["Window frame", "RANGE versus ROWS", "Running total"],
    tags: ["frames", "range-vs-rows"],
  },
  {
    id: "sq-win-005",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 4,
    context:
      "You add WHERE rn = 1 to filter on a ROW_NUMBER() column and get an error.",
    prompt:
      "Why can you not filter on a ROW_NUMBER() column in the same WHERE clause?",
    options: [
      {
        id: "a",
        text: "Window functions are evaluated after WHERE — wrap the query in a CTE and filter outside it",
      },
      { id: "b", text: "ROW_NUMBER must be aliased before it can be filtered" },
      { id: "c", text: "The filter belongs in HAVING instead" },
      { id: "d", text: "ROW_NUMBER cannot be compared with equality" },
    ],
    answer: "a",
    explanation:
      "Window functions run after WHERE and even after HAVING, so the column does not exist yet at filter time. Computing it in a CTE and filtering in the outer query is the standard shape — and it is the idiom behind almost every \"latest row per group\" query.",
    concepts: ["Common table expression", "Logical query processing order", "Window function"],
    tags: ["execution-order"],
  },

  // ---------- CTEs and subqueries ----------
  {
    id: "sq-cte-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 3,
    prompt: "What is the main argument for a CTE over nested subqueries?",
    options: [
      {
        id: "a",
        text: "Named steps make the logic readable and reviewable, and easier to narrate",
      },
      { id: "b", text: "CTEs always execute faster" },
      { id: "c", text: "CTEs avoid the need for indexes" },
      { id: "d", text: "Subqueries cannot reference more than one table" },
    ],
    answer: "a",
    explanation:
      "The benefit is comprehension, not speed — and in an interview, a chain of named steps lets you explain your reasoning as you build it. Performance depends on the engine: some optimise across the CTE boundary, some materialise each one, so a CTE used three times may be computed once or three times.",
    concepts: ["Common table expression", "Query readability", "CTE materialisation"],
    tags: ["cte", "readability"],
  },
  {
    id: "sq-cte-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 4,
    prompt:
      "For a pure existence check, why is EXISTS often preferable to a JOIN?",
    options: [
      {
        id: "a",
        text: "It short-circuits on the first match and cannot duplicate outer rows",
      },
      { id: "b", text: "It always uses an index where a join does not" },
      { id: "c", text: "It can reference columns a join cannot" },
      { id: "d", text: "It returns NULL rather than erroring on no match" },
    ],
    answer: "a",
    explanation:
      "A join that matches several inner rows repeats the outer row, so \"customers who have ordered\" silently becomes \"customers, once per order\" unless you deduplicate. EXISTS answers yes or no and stops looking, which is both correct and usually cheaper.",
    concepts: ["EXISTS", "Semi-join", "Row duplication"],
    tags: ["exists", "join"],
  },
  {
    id: "sq-cte-003",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 4,
    context:
      "You need to walk an org chart from a given employee down through every level of report.",
    prompt: "Which SQL feature handles this?",
    options: [
      {
        id: "a",
        text: "A recursive CTE, with an anchor member and a member that references the CTE itself",
      },
      { id: "b", text: "A self join repeated once per level" },
      { id: "c", text: "A window function partitioned by manager" },
      { id: "d", text: "A CROSS JOIN against the employees table" },
    ],
    answer: "a",
    explanation:
      "Recursive CTEs traverse hierarchies of unknown depth — org charts, category trees, dependency graphs. Repeated self joins work only if you know the depth in advance and need one join per level, which is why that approach breaks the moment someone adds a layer of management.",
    concepts: ["Recursive CTE", "Hierarchical query"],
    tags: ["recursive-cte"],
  },
  {
    id: "sq-cte-004",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 4,
    context:
      "A correlated subquery computes each employee's department average, evaluated once per row.",
    prompt: "What is the modern replacement?",
    options: [
      {
        id: "a",
        text: "A window function: AVG(salary) OVER (PARTITION BY department)",
      },
      { id: "b", text: "A CROSS JOIN to the departments table" },
      { id: "c", text: "A HAVING clause on the grouped query" },
      { id: "d", text: "A recursive CTE over departments" },
    ],
    answer: "a",
    explanation:
      "The correlated subquery runs per outer row; the window function computes each partition once and attaches the value to every row. It is shorter, clearer, and usually much faster — and it is one of the most common \"can you modernise this query\" prompts.",
    concepts: ["Correlated subquery", "Window function", "PARTITION BY"],
    tags: ["correlated-subquery", "window"],
  },

  // ---------- Performance ----------
  {
    id: "sq-perf-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 4,
    context:
      "WHERE YEAR(created_at) = 2026 is slow despite an index on created_at.",
    prompt: "Why, and how would you rewrite it?",
    options: [
      {
        id: "a",
        text: "Wrapping the column in a function prevents index use — rewrite as a range: >= '2026-01-01' AND < '2027-01-01'",
      },
      { id: "b", text: "YEAR() is not supported by the query planner" },
      { id: "c", text: "The index needs rebuilding" },
      { id: "d", text: "created_at should be indexed as text" },
    ],
    answer: "a",
    explanation:
      "The index stores raw values, not YEAR() of them, so the function must be computed for every row and the index is unusable. Expressing the same condition as a range lets the index seek. This property is called sargability, and it is one of the highest-value rewrites there is.",
    concepts: ["Sargable predicate", "Index seek", "Full table scan"],
    tags: ["sargability", "indexes"],
  },
  {
    id: "sq-perf-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 3,
    prompt: "What is the difference between EXPLAIN and EXPLAIN ANALYZE?",
    options: [
      {
        id: "a",
        text: "EXPLAIN shows the planned strategy; EXPLAIN ANALYZE runs it and shows actual timings and row counts",
      },
      { id: "b", text: "EXPLAIN ANALYZE only works on SELECT statements" },
      { id: "c", text: "EXPLAIN is for indexes and EXPLAIN ANALYZE is for joins" },
      { id: "d", text: "They are aliases for the same command" },
    ],
    answer: "a",
    explanation:
      "The gap between estimated and actual rows is the most useful thing on the page — if the planner expected 10 rows and found 100,000, it likely chose the wrong join strategy, and the fix is usually fresher statistics. Note ANALYZE actually executes, so be careful with writes.",
    concepts: ["EXPLAIN", "EXPLAIN ANALYZE", "Query planner statistics"],
    tags: ["explain"],
  },
  {
    id: "sq-perf-003",
    type: "multi",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 4,
    prompt:
      "Which can silently prevent an index from being used? Select all that apply.",
    options: [
      { id: "a", text: "Applying a function to the indexed column" },
      { id: "b", text: "A leading wildcard, as in LIKE '%term'" },
      { id: "c", text: "Filtering on the second column of a composite index alone" },
      { id: "d", text: "An implicit type conversion in the comparison" },
      { id: "e", text: "Selecting fewer columns than the index contains" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Each defeats the ordered structure the index relies on — a function changes the value, a leading wildcard removes the prefix to seek on, a composite index is sorted by its first column, and a type conversion is a function in disguise. Selecting fewer columns is harmless and can enable an index-only scan.",
    concepts: ["Sargable predicate", "Leftmost prefix rule", "Implicit type conversion"],
    tags: ["indexes", "sargability"],
  },
  {
    id: "sq-perf-004",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 4,
    context:
      "A paginated report is fast on page 2 and very slow on page 900, using LIMIT with OFFSET.",
    prompt: "Why, and what is the alternative?",
    options: [
      {
        id: "a",
        text: "OFFSET still walks and discards every skipped row — use keyset pagination on the last seen sort key",
      },
      { id: "b", text: "The result set exceeds the query cache size" },
      { id: "c", text: "LIMIT requires an index to work efficiently" },
      { id: "d", text: "Deep pages need a larger page size to compensate" },
    ],
    answer: "a",
    explanation:
      "OFFSET 9000 means fetching and throwing away 9,000 rows before returning anything. Keyset pagination — WHERE sort_key > :last_seen ORDER BY sort_key LIMIT n — seeks straight to the position and stays constant-time at any depth. It also stays correct when rows are inserted mid-traversal.",
    concepts: ["Keyset pagination", "OFFSET", "Deep pagination"],
    tags: ["pagination", "offset"],
  },
  {
    id: "sq-join-006",
    type: "multi",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 3,
    prompt:
      "Which are correct ways to find users who have never placed an order? Select all that apply.",
    options: [
      { id: "a", text: "LEFT JOIN orders, then filter WHERE orders.id IS NULL" },
      { id: "b", text: "WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)" },
      { id: "c", text: "EXCEPT against the set of user ids appearing in orders" },
      { id: "d", text: "WHERE users.id NOT IN (SELECT user_id FROM orders)" },
      { id: "e", text: "INNER JOIN orders, then filter WHERE orders.id IS NULL" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "These are the three spellings of an anti-join, and a planner usually treats the first two identically. NOT IN is the trap: a single NULL in the subquery makes the predicate unknown for every row, so the query returns nothing at all, with no error. An INNER JOIN discards exactly the rows you were looking for.",
    concepts: ["Anti-join", "NOT EXISTS", "Three-valued logic", "EXCEPT"],
    tags: ["anti-join", "nulls"],
  },
  {
    id: "sq-join-007",
    type: "ordering",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 3,
    prompt:
      "Put the steps of diagnosing a query that returns too many rows in order.",
    items: [
      "Count the rows the base table returns on its own",
      "Add one join at a time, re-counting after each",
      "Find the join where the count jumps, and check that join's cardinality",
      "Confirm whether the join key is actually unique on the side that multiplied",
      "Aggregate the many side first, then join the single row back",
    ],
    explanation:
      "Row multiplication produces a plausible number rather than an error, so it has to be found by counting rather than by reading the query. The last step is the general fix: collapse the many side in a CTE before joining, so any aggregate afterwards runs over one row per entity.",
    concepts: ["Join fan-out", "Cardinality", "Common table expression", "Row multiplication"],
    tags: ["fan-out", "diagnosis"],
  },
  {
    id: "sq-join-008",
    type: "short",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 4,
    context:
      "For every customer you need their three most recent orders — not the three most recent overall. An ordinary join cannot express this, because the subquery would have to see each outer row.",
    prompt:
      "Which JOIN keyword lets a subquery reference columns from the row on its left? (One word.)",
    answers: ["lateral", "lateral join", "cross apply", "apply", "outer apply"],
    typoTolerance: true,
    explanation:
      "LATERAL, spelled CROSS APPLY in SQL Server. Without it a subquery in the FROM clause is evaluated once, independently, so it cannot depend on the outer row. The portable alternative for top-N per group is a window function — ROW_NUMBER partitioned by customer, filtered in an outer query — which is often faster too.",
    concepts: ["LATERAL join", "Top-N per group", "Correlated subquery", "CROSS APPLY"],
    tags: ["lateral", "top-n"],
  },
  {
    id: "sq-agg-006",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 3,
    context:
      "A dashboard sums yesterday's revenue. On a day with no orders the tile renders blank, and a downstream calculation that divides by it fails.",
    prompt:
      "What does SUM return over zero rows, and how should the query handle it?",
    options: [
      { id: "a", text: "NULL rather than 0 — wrap the aggregate in COALESCE to get a numeric zero" },
      { id: "b", text: "0, so the blank must come from a different bug" },
      { id: "c", text: "An error, which the driver renders as a blank" },
      { id: "d", text: "NULL, and the fix is to make the underlying column NOT NULL" },
    ],
    answer: "a",
    explanation:
      "SUM over an empty set is NULL because there is nothing to add, while COUNT over an empty set is 0 because there is definitely nothing to count. The inconsistency is deliberate and catches people out every quiet Sunday. COALESCE the aggregate, not the column — the column's nullability is a different question.",
    concepts: ["NULL semantics", "COALESCE", "Empty set aggregation", "COUNT versus SUM"],
    tags: ["nulls", "aggregates"],
  },
  {
    id: "sq-agg-007",
    type: "short",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 3,
    context:
      "One query must return, per country, both the total number of orders and the number that were refunded — without running two queries and joining the results.",
    prompt:
      "What is the technique of putting a condition inside an aggregate called? (Two words.)",
    answers: [
      "conditional aggregation",
      "conditional aggregate",
      "filtered aggregation",
      "filtered aggregate",
    ],
    typoTolerance: true,
    explanation:
      "Conditional aggregation — a SUM over a CASE expression, or the clearer FILTER clause where the engine supports it. It replaces a self-join or a pair of subqueries with one pass over the data, and it is how you pivot rows into columns in plain SQL: one aggregate per column you want out.",
    concepts: ["Conditional aggregation", "FILTER clause", "CASE expression", "Pivot"],
    tags: ["case", "pivot"],
  },
  {
    id: "sq-win-006",
    type: "ordering",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 3,
    prompt:
      "Put the steps of selecting the latest row per group with a window function in order.",
    items: [
      "Choose the column that defines the group, and PARTITION BY it",
      "Choose the column that defines recency, and ORDER BY it descending",
      "Assign ROW_NUMBER() over that window",
      "Wrap the whole thing in a CTE or subquery",
      "Filter the outer query to the rows numbered 1",
    ],
    explanation:
      "The wrapping step is not stylistic. Window functions are evaluated after WHERE, so the row number does not exist yet when WHERE runs — which is why filtering on it in the same query is an error, and why every top-N-per-group recipe has an outer query wrapped around it.",
    concepts: ["ROW_NUMBER", "PARTITION BY", "Logical query processing order", "Top-N per group"],
    tags: ["top-n", "row-number"],
  },
  {
    id: "sq-win-007",
    type: "multi",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 3,
    prompt:
      "Which results can a window function produce that GROUP BY cannot? Select all that apply.",
    options: [
      { id: "a", text: "Each row shown alongside its group's total" },
      { id: "b", text: "Each row's difference from the previous row in an order" },
      { id: "c", text: "A per-row rank within its partition" },
      { id: "d", text: "One row per group carrying that group's total" },
      { id: "e", text: "A filter that removes rows before aggregation happens" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The defining property is that a window function does not collapse rows: every input row survives and gains a computed column. That is what makes running totals, per-row ranks, and row-to-row comparisons expressible in one pass, where GROUP BY would need a self-join back to the detail rows.",
    concepts: ["Window function", "PARTITION BY", "Running total", "Aggregate function"],
    tags: ["windows", "group-by"],
  },
  {
    id: "sq-win-008",
    type: "matching",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 3,
    prompt: "Match each window function to what it returns for a row.",
    pairs: [
      { left: "LAG", right: "The value from an earlier row in the window's order" },
      { left: "LEAD", right: "The value from a later row in the window's order" },
      { left: "FIRST_VALUE", right: "The value from the first row of the frame" },
      { left: "NTILE(4)", right: "Which quarter of the partition this row falls into" },
      { left: "SUM() OVER ()", right: "The total across every row, repeated on each row" },
    ],
    explanation:
      "LAST_VALUE is absent for a good reason: with the default frame it returns the current row rather than the partition's final row, because the frame ends at the current row unless you say otherwise. Every window function is a function plus a frame, and the frame is where the bugs live.",
    concepts: ["LAG", "LEAD", "NTILE", "Window frame"],
    tags: ["functions", "frames"],
  },
  {
    id: "sq-cte-005",
    type: "ordering",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 4,
    prompt: "Put the parts of a recursive CTE in the order they execute.",
    items: [
      "The anchor member runs once, producing the starting rows",
      "The recursive member runs against the rows the previous step produced",
      "Its output is added to the result and becomes the next step's input",
      "The recursive member runs again, and keeps running while it returns rows",
      "It returns no rows, and the recursion stops",
    ],
    explanation:
      "The termination condition is emergent rather than declared — recursion ends when the recursive member produces nothing, which is precisely why a cyclic graph makes it run forever. Guard it with a depth column and a limit, or by carrying the path visited so far and excluding anything already in it.",
    concepts: ["Recursive CTE", "Anchor member", "Termination condition", "Cycle detection"],
    tags: ["recursion", "hierarchies"],
  },
  {
    id: "sq-cte-006",
    type: "multi",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 4,
    prompt:
      "Which statements about common table expressions are accurate? Select all that apply.",
    options: [
      { id: "a", text: "A CTE can be referenced more than once in the same query" },
      { id: "b", text: "A CTE can be recursive, which a plain subquery cannot" },
      {
        id: "c",
        text: "On some engines a CTE acts as an optimisation fence, so outer predicates are not pushed into it",
      },
      { id: "d", text: "A CTE is always materialised into a temporary table" },
      { id: "e", text: "A CTE persists after the query finishes, in the way a view does" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The fence is the practical trap and it is engine-specific: where it applies, a WHERE clause outside the CTE cannot filter rows before it runs, so a readable rewrite quietly becomes a slow one. Modern PostgreSQL inlines CTEs by default and offers MATERIALIZED to force the old behaviour — check yours before assuming either way.",
    concepts: ["Common table expression", "Optimisation fence", "Predicate pushdown", "Derived table"],
    tags: ["ctes", "planner"],
  },
  {
    id: "sq-cte-007",
    type: "short",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 3,
    context:
      "A SELECT list contains a subquery that references a column from the outer row and returns one value, so it is evaluated once per row of the outer result.",
    prompt: "What is a subquery that depends on the outer row called? (Two words.)",
    answers: [
      "correlated subquery",
      "correlated sub-query",
      "correlated subqueries",
      "correlated",
    ],
    typoTolerance: true,
    explanation:
      "A correlated subquery. It reads well and can execute once per outer row, so its cost scales with the size of the outer result — instant on a hundred rows, unusable on a million. Planners sometimes rewrite them into joins; when yours does not, a window function or a joined aggregate is the usual replacement.",
    concepts: ["Correlated subquery", "Scalar subquery", "Query plan", "Window function"],
    tags: ["subqueries", "cost"],
  },
  {
    id: "sq-perf-005",
    type: "short",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 3,
    context:
      "A page lists 200 posts. Fetching the list takes one query, and rendering each post's author issues one more — 201 queries where two would do.",
    prompt: "What is this query pattern called?",
    answers: [
      "n+1",
      "n + 1",
      "n+1 query",
      "n+1 problem",
      "n+1 query problem",
      "n plus 1",
      "n+1 selects",
    ],
    typoTolerance: true,
    explanation:
      "The N+1 query problem. Each query is individually fast, which is why it survives review and any profiling that only looks for slow queries — the cost is 200 network round trips, not 200 slow reads. Fix it by loading the authors in one query keyed on the collected ids, which is what eager loading does for you.",
    concepts: ["N+1 query problem", "Eager loading", "Batch loading", "Round-trip latency"],
    tags: ["n-plus-one", "orm"],
  },
  {
    id: "sq-perf-006",
    type: "matching",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 4,
    prompt: "Match each join strategy to the situation a planner chooses it for.",
    pairs: [
      {
        left: "Nested loop join",
        right: "One side is tiny, or the other has an index on the join key",
      },
      {
        left: "Hash join",
        right: "Both sides are large and unindexed, and one fits in memory",
      },
      {
        left: "Merge join",
        right: "Both inputs already arrive sorted on the join key",
      },
      {
        left: "Index-only scan",
        right: "Every column needed is in the index, so the table is never read",
      },
    ],
    explanation:
      "A nested loop over two large unindexed tables in a plan is the classic symptom of stale statistics — the planner chose it believing one side was small. That is why running ANALYZE is a genuine fix for a slow query: the plan was reasonable given wrong information about the data.",
    concepts: ["Nested loop join", "Hash join", "Merge join", "Query planner statistics"],
    tags: ["planner", "joins"],
  },
  {
    id: "sq-perf-007",
    type: "multi",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 3,
    context: "An index exists on (tenant_id, created_at), in that order.",
    prompt:
      "Which queries can use an index on (tenant_id, created_at)? Select all that apply.",
    options: [
      { id: "a", text: "WHERE tenant_id = ?" },
      { id: "b", text: "WHERE tenant_id = ? AND created_at > ?" },
      { id: "c", text: "WHERE tenant_id = ? ORDER BY created_at" },
      { id: "d", text: "WHERE created_at > ?" },
      { id: "e", text: "WHERE created_at > ? ORDER BY tenant_id" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "A composite index is sorted by its first column, then within that by the second — a phone book by surname, then first name. You can look up a surname, or a surname and a first name, never a first name alone. The third case earns its keep quietly: rows already arrive ordered within each tenant, so the sort costs nothing.",
    concepts: ["Composite index", "Leftmost prefix rule", "Sort elimination", "Index ordering"],
    tags: ["composite-index", "ordering"],
  },
];
