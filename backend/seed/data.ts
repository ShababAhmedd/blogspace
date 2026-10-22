// Demo content for BlogSpace. The authors are fictional community members;
// the people they quote are real, and every quote is cited with its source.

export const seedUsers = [
  { key: "admin", firstName: "Admin", lastName: "BlogSpace", email: "admin@blogspace.dev", password: "Admin@123", role: "admin" },
  { key: "john", firstName: "John", lastName: "Doe", email: "john@example.com", password: "Password123", role: "user" },
  { key: "sarah", firstName: "Sarah", lastName: "Khan", email: "sarah@example.com", password: "Password123", role: "user" },
  { key: "michael", firstName: "Michael", lastName: "Chen", email: "michael@example.com", password: "Password123", role: "user" },
  { key: "ayesha", firstName: "Ayesha", lastName: "Rahman", email: "ayesha@example.com", password: "Password123", role: "user" },
] as const;

type AuthorKey = (typeof seedUsers)[number]["key"];

export const seedBlogs: {
  author: AuthorKey;
  daysAgo: number;
  category: string;
  blogTitle: string;
  blog: string;
}[] = [
  {
    author: "sarah",
    daysAgo: 2,
    category: "AI",
    blogTitle: "Summoning the Demon: What Elon Musk Has Said About AI Risk",
    blog: `Few public figures have warned about artificial intelligence as loudly, or as consistently, as Elon Musk. Long before ChatGPT made AI a dinner-table topic, he was treating it as an existential issue.

At the MIT AeroAstro Centennial Symposium in October 2014, he said:

“With artificial intelligence we are summoning the demon.”

Three years later, speaking to the National Governors Association in July 2017, he made the same point to lawmakers directly:

“AI is a fundamental risk to the existence of human civilization.”

And at SXSW in March 2018 he raised the stakes again:

“Mark my words — AI is far more dangerous than nukes.”

What is interesting is that Musk did not respond to this fear by staying away from AI. He co-founded OpenAI in 2015 and launched xAI in 2023. His argument has always been less "stop building AI" and more "regulate it before it is too late": he told the governors that AI is a rare case where regulation should be proactive rather than reactive.

Whether you find this alarmist or prudent, it is worth taking seriously as engineers. The systems we build are getting more capable every year, and "we'll fix it later" is a risky strategy when the thing you are building can act on its own.

Sources: MIT AeroAstro Centennial Symposium (Oct 2014); National Governors Association summer meeting (Jul 2017); SXSW (Mar 2018).`,
  },
  {
    author: "michael",
    daysAgo: 5,
    category: "AI",
    blogTitle: "AI Is the New Electricity: The Optimists' Case",
    blog: `For every warning about AI there is a leader in the field arguing that its benefits will be enormous — and that we should focus on the problems in front of us.

Andrew Ng, co-founder of Google Brain and Coursera, put it memorably in 2017:

“AI is the new electricity.”

His point: just as electricity transformed almost every industry a century ago, AI will quietly become part of everything — logistics, healthcare, agriculture, education.

Ng has also been openly sceptical of doomsday scenarios. In 2015 he said:

“I don't work on preventing AI from turning evil for the same reason that I don't work on combating overpopulation on the planet Mars.”

Google CEO Sundar Pichai went even further in a January 2018 interview:

“AI is one of the most important things humanity is working on. It is more profound than, I dunno, electricity or fire.”

So who is right — Musk or Ng? Probably both, on different time scales. The practical lesson for developers is the same either way: learn how these systems work, measure them honestly, and build guard rails into the products we ship today.

Sources: Andrew Ng, Stanford GSB talk (2017) and GPU Technology Conference (2015); Sundar Pichai, MSNBC/Recode town hall (Jan 2018).`,
  },
  {
    author: "ayesha",
    daysAgo: 9,
    category: "AI",
    blogTitle: "Can Machines Think? Revisiting Alan Turing's 1950 Paper",
    blog: `Every conversation about modern AI eventually leads back to a paper published in 1950 in the journal Mind: Alan Turing's "Computing Machinery and Intelligence".

It opens with one of the most famous sentences in computer science:

“I propose to consider the question, ‘Can machines think?’”

Turing quickly decided that the question was too vague to answer directly, so he replaced it with a test he called the imitation game — today known as the Turing Test. If a judge chatting through text cannot reliably tell a machine from a human, does it matter whether the machine "really" thinks?

Reading the paper today is striking. Turing anticipates objections people still raise about large language models: that machines cannot be original, that they only do what they are told, that they lack consciousness. He even suggests that rather than programming an adult mind, we might build a "child machine" and educate it — an early sketch of machine learning.

The paper ends with a line that every engineer can relate to:

“We can only see a short distance ahead, but we can see plenty there that needs to be done.”

Seventy-five years later, that still describes the state of AI perfectly.

Source: A. M. Turing, "Computing Machinery and Intelligence", Mind (1950).`,
  },
  {
    author: "john",
    daysAgo: 12,
    category: "Testing",
    blogTitle: "Testing Shows the Presence of Bugs, Not Their Absence",
    blog: `If you work in QA, there is one quote you should know by heart. It comes from Edsger W. Dijkstra, in his 1970 "Notes on Structured Programming":

“Program testing can be used to show the presence of bugs, but never to show their absence!”

It sounds pessimistic, but it is actually liberating. No test suite proves that software is correct. Our job is not to prove perfection; it is to find the most important problems as early and cheaply as possible.

Glenford Myers made a similar point in "The Art of Software Testing" (1979), defining testing as:

“The process of executing a program with the intent of finding errors.”

Notice the intent. A tester who sets out to show that something works will, unconsciously, choose inputs that work. A tester who sets out to break it will find the edge cases.

A few practical habits that follow from this:

• Write at least one test that you expect to fail before you fix a bug.
• Prioritise tests by risk, not by how easy they are to automate.
• Treat a green test run as "no known problems", never as "no problems".
• Track escaped defects — bugs users found that your tests did not. They tell you where your blind spots are.

Sources: E. W. Dijkstra, Notes on Structured Programming (1970); G. J. Myers, The Art of Software Testing (1979).`,
  },
  {
    author: "john",
    daysAgo: 20,
    category: "Programming",
    blogTitle: "Debugging Is Twice as Hard: Kernighan's Law in Practice",
    blog: `Brian Kernighan, co-author of "The C Programming Language", wrote one of the most-quoted warnings about clever code, in "The Elements of Programming Style" (with P. J. Plauger):

“Everyone knows that debugging is twice as hard as writing a program in the first place. So if you're as clever as you can be when you write it, how will you ever debug it?”

This has become known as Kernighan's Law, and it is a great argument for boring code.

In code reviews I now ask one question about anything "clever": will the person on call at 3 a.m. understand this in 30 seconds? If not, it is probably too clever.

Some signs that code is too clever:

• One-liners that need a comment explaining what they do.
• Abstractions created for a second use case that never arrived.
• Performance tricks without a benchmark that proves they matter.

Readable code is not a beginner's compromise. It is a professional decision that makes the next bug — and there will always be a next bug — cheaper to fix.

Source: B. W. Kernighan & P. J. Plauger, The Elements of Programming Style.`,
  },
  {
    author: "michael",
    daysAgo: 27,
    category: "Programming",
    blogTitle: "Write Code for Humans: Lessons from Martin Fowler and Donald Knuth",
    blog: `Martin Fowler's "Refactoring" (1999) contains a sentence that should be printed above every developer's desk:

“Any fool can write code that a computer can understand. Good programmers write code that humans can understand.”

Compilers do not care about variable names. Your teammates do.

Donald Knuth is often quoted as saying "premature optimization is the root of all evil", but the full passage from his 1974 paper "Structured Programming with go to Statements" is more nuanced:

“We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.”

Knuth is not saying performance does not matter. He is saying: measure first, then optimise the small part of the program that actually matters.

Put the two together and you get a simple workflow:

1. Write the clearest version of the code.
2. Measure it with real data.
3. Optimise only the hot spots, and leave a comment explaining why that code is less obvious.

Sources: M. Fowler, Refactoring (1999); D. E. Knuth, "Structured Programming with go to Statements", Computing Surveys (1974).`,
  },
  {
    author: "ayesha",
    daysAgo: 34,
    category: "Programming",
    blogTitle: "First Principles and Feedback Loops: Elon Musk's Advice for Engineers",
    blog: `Elon Musk's companies span rockets, cars and AI, but he often describes the same way of thinking behind all of them.

The first idea is reasoning from first principles. In an interview on Kevin Rose's "Foundation" series he explained:

“I think it's important to reason from first principles rather than by analogy.”

His example was batteries: people assumed they would always be expensive because they always had been. Breaking a battery down into the market price of its raw materials showed how much cheaper it could be.

For programmers this is a useful habit. Instead of "everyone uses this framework, so we should too", ask: what does this feature actually need? Sometimes the answer is the popular framework. Sometimes it is fifty lines of plain code.

The second idea is the feedback loop. In a 2012 interview with Mashable he said:

“I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.”

That is essentially what good engineering teams formalise with code review, retrospectives, monitoring and post-mortems. The faster the loop, the faster you improve.

Sources: Kevin Rose, "Foundation" interview with Elon Musk; Mashable interview (2012).`,
  },
  {
    author: "sarah",
    daysAgo: 41,
    category: "Programming",
    blogTitle: "Talk Is Cheap. Show Me the Code.",
    blog: `In August 2000, replying to a long design discussion on the Linux kernel mailing list, Linus Torvalds wrote a line that became a motto for open source:

“Talk is cheap. Show me the code.”

It is easy to read this as dismissive, but the idea behind it is healthy. A working prototype ends arguments faster than any number of meetings. It exposes the hidden problems that diagrams hide.

Steve Jobs, in a 1995 interview later released as "The Lost Interview", explained why writing code matters even for people who never become professional developers:

“Everybody in this country should learn to program a computer, because it teaches you how to think.”

Programming forces you to be precise. You cannot hand-wave a step, because the computer will not fill in the gap for you.

So next time a discussion goes in circles, try building the smallest version that proves the point. Even if it is thrown away, it will teach everyone something.

Sources: Linus Torvalds, Linux kernel mailing list (Aug 2000); Steve Jobs, "Steve Jobs: The Lost Interview" (recorded 1995).`,
  },
  {
    author: "michael",
    daysAgo: 48,
    category: "Automation",
    blogTitle: "\"Humans Are Underrated\": Elon Musk on Over-Automation at Tesla",
    blog: `In 2018 Tesla was struggling to ramp up Model 3 production — a period Musk himself called "production hell". Part of the problem was a highly automated assembly line that did not work as planned.

In April 2018, Musk admitted it publicly on Twitter:

“Yes, excessive automation at Tesla was a mistake. To be precise, my mistake. Humans are underrated.”

Tesla ended up removing some of the automation and even building an extra assembly line in a large tent outside the Fremont factory.

There is an old rule about automation that is usually credited to Bill Gates:

“Automation applied to an efficient operation will magnify the efficiency. Automation applied to an inefficient operation will magnify the inefficiency.”

Test automation follows the same rule. Automating a flaky, poorly understood manual process gives you a flaky, poorly understood automated process — only faster.

Before automating anything, ask:

• Is the manual process stable and well understood?
• Will this run often enough to repay the effort?
• Who will maintain it when the product changes?

Sources: Elon Musk on Twitter (Apr 2018); automation rule widely attributed to Bill Gates.`,
  },
  {
    author: "john",
    daysAgo: 56,
    category: "Automation",
    blogTitle: "The Best Part Is No Part: Musk's Five-Step Process for Automation",
    blog: `During a 2021 tour of SpaceX's Starbase with the YouTube channel Everyday Astronaut, Elon Musk described the engineering process he tries to follow. Its order matters:

1. Make the requirements less dumb.
2. Delete the part or process step.
3. Simplify or optimise.
4. Accelerate cycle time.
5. Automate.

He summarised step two as:

“The best part is no part. The best process is no process.”

And he admitted that he had made the mistake of going backwards through the list — automating, then speeding up, then simplifying something that should have been deleted in the first place. As he put it on the tour, a very common error for smart engineers is to optimise a thing that should not exist.

This maps neatly onto test automation:

• Question the requirement — does this test check something users care about?
• Delete duplicate or obsolete tests before automating them.
• Simplify the flow — fewer UI steps, more API-level checks.
• Speed up the feedback — run fast tests on every commit.
• Only then automate what remains.

Source: Everyday Astronaut, "Starbase Tour with Elon Musk" (2021).`,
  },
  {
    author: "ayesha",
    daysAgo: 70,
    category: "DevOps",
    blogTitle: "Everything Fails, All the Time: Designing for Failure",
    blog: `Amazon CTO Werner Vogels has repeated one phrase so often that it has become a principle of cloud engineering:

“Everything fails, all the time.”

Disks die, networks partition, deployments go wrong, and a dependency you have never heard of has an outage. You cannot prevent all of that. What you can do is design systems that keep working — or fail gracefully — when it happens.

Jez Humble and David Farley give the matching advice for delivery pipelines in "Continuous Delivery" (2010):

“If it hurts, do it more frequently, and bring the pain forward.”

If deployments are scary, deploy more often, in smaller pieces, until they become boring. If restoring from backup is painful, practise it regularly so you are not doing it for the first time during an incident.

A short checklist inspired by both ideas:

• Health checks and automatic restarts for every service.
• Timeouts and retries with backoff on every network call.
• Small, frequent deployments with an easy rollback.
• Regular restore drills for your backups.
• Blameless post-mortems that fix the system, not the person.

Sources: Werner Vogels (Amazon), widely quoted talks and writing; J. Humble & D. Farley, Continuous Delivery (2010).`,
  },
  {
    author: "sarah",
    daysAgo: 84,
    category: "DevOps",
    blogTitle: "\"We've Always Done It This Way\": Grace Hopper and DevOps Culture",
    blog: `Rear Admiral Grace Hopper helped create COBOL and spent decades pushing the computing world to change faster than it wanted to. One line is widely attributed to her:

“The most dangerous phrase in the language is, ‘We've always done it this way.’”

DevOps is, at its heart, a cultural change rather than a set of tools. Pipelines and containers help, but the real shift is questioning hand-offs, manual approvals and release rituals that exist mainly because they always have.

Another saying often credited to Hopper is:

“It's easier to ask forgiveness than it is to get permission.”

Used carelessly in production that is a recipe for outages. But in the form of small, reversible experiments — feature flags, canary releases, short-lived branches — it is exactly how high-performing teams move fast safely.

Next time someone defends a slow process, ask what problem it solves today. If nobody knows, it might be time to change it.

Source: quotes widely attributed to Grace Hopper (including her 1970s–80s talks and interviews).`,
  },
];
